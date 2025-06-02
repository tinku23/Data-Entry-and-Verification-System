"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const record_entity_1 = require("./entities/record.entity");
const audit_log_entity_1 = require("../audit-logs/entities/audit-log.entity");
let RecordsService = class RecordsService {
    constructor(recordRepo, auditLogRepo) {
        this.recordRepo = recordRepo;
        this.auditLogRepo = auditLogRepo;
    }
    async create(data, userId = 'dev-user') {
        console.log('Service: Creating record with data:', data);
        console.log('Service: Using userId:', userId);
        try {
            let calculatedDownPayment = data.down_payment;
            if (calculatedDownPayment === undefined || calculatedDownPayment === null) {
                if (data.sales_price && data.loan_amount) {
                    calculatedDownPayment = Math.max(0, data.sales_price - data.loan_amount);
                }
                else {
                    calculatedDownPayment = 0;
                }
            }
            calculatedDownPayment = Math.max(0, calculatedDownPayment);
            const record = this.recordRepo.create({
                ...data,
                down_payment: calculatedDownPayment,
                entered_by: userId,
                entered_by_date: new Date(),
                search_vector: this.createSearchVector(data),
                county_website_url: data.apn ? this.generateCountyWebsiteUrl(data.apn, data.property_address) : null,
            });
            console.log('Service: Record entity created:', record);
            const savedRecord = await this.recordRepo.save(record);
            console.log('Service: Record saved with ID:', savedRecord.id);
            await this.createAuditLog(savedRecord.id, userId, 'Create', undefined, undefined, JSON.stringify(data));
            return savedRecord;
        }
        catch (error) {
            console.error('Service: Failed to create record:', error);
            throw error;
        }
    }
    async update(id, data, userId) {
        const record = await this.findOne(id);
        if (record.locked_by && record.locked_by !== userId) {
            const lockExpiry = new Date(record.lock_timestamp);
            lockExpiry.setMinutes(lockExpiry.getMinutes() + 10);
            if (new Date() < lockExpiry) {
                throw new common_1.ConflictException('Record is locked by another user');
            }
        }
        const changes = this.trackChanges(record, data);
        if (data.sales_price || data.loan_amount) {
            const salesPrice = data.sales_price || record.sales_price;
            const loanAmount = data.loan_amount || record.loan_amount;
            if (salesPrice !== undefined && loanAmount !== undefined) {
                data.down_payment = salesPrice - loanAmount;
            }
        }
        Object.assign(record, data);
        record.search_vector = this.createSearchVector(record);
        const savedRecord = await this.recordRepo.save(record);
        for (const change of changes) {
            await this.createAuditLog(id, userId, 'Edit', change.field, change.oldValue, change.newValue);
        }
        return savedRecord;
    }
    async findOne(id) {
        const record = await this.recordRepo.findOne({
            where: { id },
            relations: ['batch', 'audit_logs']
        });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        return record;
    }
    async searchRecords(searchDto) {
        const { query, property_address, borrower_name, apn, status, page = 1, limit = 10, sortBy, sortOrder } = searchDto;
        const queryBuilder = this.recordRepo.createQueryBuilder('record')
            .leftJoinAndSelect('record.batch', 'batch');
        if (query) {
            queryBuilder.andWhere(`(
          record.search_vector ILIKE :query OR
          record.property_address ILIKE :query OR
          record.borrower_name ILIKE :query OR
          record.apn ILIKE :query OR
          record.loan_officer_name ILIKE :query OR
          record.nmls_id ILIKE :query
        )`, { query: `%${query}%` });
        }
        if (property_address) {
            queryBuilder.andWhere('record.property_address ILIKE :property_address', {
                property_address: `%${property_address}%`
            });
        }
        if (borrower_name) {
            queryBuilder.andWhere('record.borrower_name ILIKE :borrower_name', {
                borrower_name: `%${borrower_name}%`
            });
        }
        if (apn) {
            queryBuilder.andWhere('record.apn ILIKE :apn', {
                apn: `%${apn}%`
            });
        }
        if (status) {
            queryBuilder.andWhere('record.status = :status', { status });
        }
        queryBuilder.andWhere('(record.locked_by IS NULL OR record.lock_timestamp < :expiredTime)', { expiredTime: new Date(Date.now() - 10 * 60 * 1000) });
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const allowedSortFields = ['created_at', 'updated_at', 'property_address', 'borrower_name', 'loan_amount', 'transaction_date'];
        const safeSortBy = sortBy && allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        queryBuilder.orderBy(`record.${safeSortBy}`, sortOrder);
        const [records, total] = await queryBuilder.getManyAndCount();
        return {
            data: records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }
    async autocomplete(field, query, limit = 10) {
        const allowedFields = ['property_address', 'borrower_name', 'apn', 'loan_officer_name'];
        if (!allowedFields.includes(field)) {
            throw new Error('Invalid field for autocomplete');
        }
        const results = await this.recordRepo
            .createQueryBuilder('record')
            .select(`DISTINCT record.${field}`, 'value')
            .where(`record.${field} ILIKE :query`, { query: `%${query}%` })
            .andWhere(`record.${field} IS NOT NULL`)
            .andWhere(`record.${field} != ''`)
            .orderBy(`record.${field}`)
            .limit(limit)
            .getRawMany();
        return results.map(result => result.value).filter(Boolean);
    }
    async lock(id, userId) {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        if (record.locked_by && record.locked_by !== userId) {
            const lockExpiry = new Date(record.lock_timestamp);
            lockExpiry.setMinutes(lockExpiry.getMinutes() + 10);
            if (new Date() < lockExpiry) {
                throw new common_1.ConflictException('Record is locked by another user');
            }
        }
        record.locked_by = userId;
        record.lock_timestamp = new Date();
        const savedRecord = await this.recordRepo.save(record);
        await this.createAuditLog(id, userId, 'Lock');
        return savedRecord;
    }
    async unlock(id, userId) {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        if (record.locked_by !== userId) {
            throw new common_1.ConflictException('Record is not locked by this user');
        }
        record.locked_by = null;
        record.lock_timestamp = null;
        const savedRecord = await this.recordRepo.save(record);
        await this.createAuditLog(id, userId, 'Unlock');
        return savedRecord;
    }
    async verifyRecord(id, userId, isGood) {
        const record = await this.recordRepo.findOne({ where: { id } });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        record.status = isGood ? 'Verified' : 'Flagged';
        record.reviewed_by = userId;
        record.reviewed_by_date = new Date();
        record.locked_by = null;
        record.lock_timestamp = null;
        const savedRecord = await this.recordRepo.save(record);
        await this.createAuditLog(id, userId, isGood ? 'Verify' : 'Flag');
        return savedRecord;
    }
    async getRecordsByBatch(batchId, userId) {
        const queryBuilder = this.recordRepo.createQueryBuilder('record')
            .leftJoinAndSelect('record.batch', 'batch')
            .where('record.batch_id = :batchId', { batchId });
        if (userId) {
            queryBuilder.andWhere('(record.locked_by IS NULL OR record.locked_by = :userId OR record.lock_timestamp < :expiredTime)', { userId, expiredTime: new Date(Date.now() - 10 * 60 * 1000) });
        }
        return queryBuilder.getMany();
    }
    async getRecordStatistics() {
        const stats = await this.recordRepo
            .createQueryBuilder('record')
            .select('record.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('record.status')
            .getRawMany();
        const totalRecords = await this.recordRepo.count();
        const lockedRecords = await this.recordRepo.count({
            where: {
                locked_by: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
                lock_timestamp: (0, typeorm_2.Not)((0, typeorm_2.LessThan)(new Date(Date.now() - 10 * 60 * 1000)))
            }
        });
        return {
            total: totalRecords,
            locked: lockedRecords,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat.status] = parseInt(stat.count);
                return acc;
            }, {})
        };
    }
    async unlockExpiredRecords() {
        const expiredTime = new Date();
        expiredTime.setMinutes(expiredTime.getMinutes() - 10);
        const expiredRecords = await this.recordRepo.find({
            where: {
                lock_timestamp: (0, typeorm_2.LessThan)(expiredTime),
                locked_by: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
            },
        });
        for (const record of expiredRecords) {
            record.locked_by = null;
            record.lock_timestamp = null;
            await this.recordRepo.save(record);
            await this.createAuditLog(record.id, 'SYSTEM', 'Unlock', undefined, undefined, 'Automatic unlock due to timeout');
        }
        return expiredRecords.length;
    }
    generateCountyWebsiteUrl(apn, address) {
        if (!apn || !address) {
            return '';
        }
        const encodedApn = encodeURIComponent(apn);
        const encodedAddress = encodeURIComponent(address);
        return `https://example-county.gov/property-search?apn=${encodedApn}&address=${encodedAddress}`;
    }
    trackChanges(originalRecord, updateData) {
        const changes = [];
        const fieldsToTrack = [
            'property_address', 'borrower_name', 'loan_amount', 'sales_price',
            'apn', 'loan_officer_name', 'nmls_id', 'loan_term'
        ];
        for (const field of fieldsToTrack) {
            if (updateData[field] !== undefined && updateData[field] !== originalRecord[field]) {
                changes.push({
                    field,
                    oldValue: String(originalRecord[field] ?? ''),
                    newValue: String(updateData[field] ?? '')
                });
            }
        }
        return changes;
    }
    createSearchVector(data) {
        const searchableFields = [
            data.property_address,
            data.borrower_name,
            data.apn,
            data.loan_officer_name,
            data.nmls_id,
        ].filter(Boolean);
        return searchableFields.join(' ').toLowerCase();
    }
    async createAuditLog(recordId, userId, action, fieldName, oldValue, newValue) {
        try {
            const auditLog = this.auditLogRepo.create({
                record_id: recordId,
                user_id: userId,
                action: action,
                field_name: fieldName || null,
                old_value: oldValue || null,
                new_value: newValue || null,
            });
            await this.auditLogRepo.save(auditLog);
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(record_entity_1.Record)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RecordsService);
//# sourceMappingURL=records.service.js.map