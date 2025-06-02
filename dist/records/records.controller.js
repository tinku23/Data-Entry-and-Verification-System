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
exports.RecordsController = void 0;
const common_1 = require("@nestjs/common");
const records_service_1 = require("./records.service");
const create_record_dto_1 = require("./dto/create-record.dto");
const search_records_dto_1 = require("./dto/search-records.dto");
let RecordsController = class RecordsController {
    constructor(recordsService) {
        this.recordsService = recordsService;
    }
    async create(createRecordDto, req) {
        console.log('Controller: Received create request with data:', createRecordDto);
        try {
            const userId = req.user?.userId || 'dev-user';
            console.log('Controller: Using userId:', userId);
            const result = await this.recordsService.create(createRecordDto, userId);
            console.log('Controller: Record created successfully:', result.id);
            return result;
        }
        catch (error) {
            console.error('Controller: Failed to create record:', error);
            throw error;
        }
    }
    search(searchDto) {
        return this.recordsService.searchRecords(searchDto);
    }
    async autocomplete(field, query, limit = '10') {
        const fieldMapping = {
            'propertyAddress': 'property_address',
            'borrowerName': 'borrower_name',
            'apn': 'apn',
            'loanOfficerName': 'loan_officer_name'
        };
        const mappedField = fieldMapping[field] || field;
        return this.recordsService.autocomplete(mappedField, query, parseInt(limit, 10));
    }
    getStatistics() {
        return this.recordsService.getRecordStatistics();
    }
    getRecordsByBatch(batchId, req) {
        const userId = req.user?.userId || 'dev-user';
        return this.recordsService.getRecordsByBatch(batchId, userId);
    }
    findOne(id) {
        return this.recordsService.findOne(id);
    }
    update(id, updateData, req) {
        const userId = req.user?.userId || 'dev-user';
        return this.recordsService.update(id, updateData, userId);
    }
    lock(id, req) {
        const userId = req.user?.userId || 'dev-user';
        return this.recordsService.lock(id, userId);
    }
    unlock(id, req) {
        const userId = req.user?.userId || 'dev-user';
        return this.recordsService.unlock(id, userId);
    }
    verify(id, isGood, req) {
        const userId = req.user?.userId || 'dev-user';
        return this.recordsService.verifyRecord(id, userId, isGood);
    }
};
exports.RecordsController = RecordsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_record_dto_1.CreateRecordDto, Object]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_records_dto_1.SearchRecordsDto]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('autocomplete/:field'),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "autocomplete", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('batch/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "getRecordsByBatch", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/lock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "lock", null);
__decorate([
    (0, common_1.Put)(':id/unlock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "unlock", null);
__decorate([
    (0, common_1.Put)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isGood')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "verify", null);
exports.RecordsController = RecordsController = __decorate([
    (0, common_1.Controller)('records'),
    __metadata("design:paramtypes", [records_service_1.RecordsService])
], RecordsController);
//# sourceMappingURL=records.controller.js.map