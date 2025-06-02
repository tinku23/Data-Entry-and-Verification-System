import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { Record } from './entities/record.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { SearchRecordsDto } from './dto/search-records.dto';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async create(data: CreateRecordDto, userId: string = 'dev-user') {
    console.log('Service: Creating record with data:', data);
    console.log('Service: Using userId:', userId);
    
    try {
      // Calculate down payment automatically if not provided
      let calculatedDownPayment = data.down_payment;
      
      if (calculatedDownPayment === undefined || calculatedDownPayment === null) {
        if (data.sales_price && data.loan_amount) {
          calculatedDownPayment = Math.max(0, data.sales_price - data.loan_amount);
        } else {
          // If no sales_price provided, set down_payment to 0
          calculatedDownPayment = 0;
        }
      }

      // Ensure down_payment is never negative
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
      
      // Create audit log
      await this.createAuditLog(savedRecord.id, userId, 'Create', undefined, undefined, JSON.stringify(data));
      
      return savedRecord;
    } catch (error) {
      console.error('Service: Failed to create record:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CreateRecordDto>, userId: string) {
    const record = await this.findOne(id);
    
    if (record.locked_by && record.locked_by !== userId) {
      const lockExpiry = new Date(record.lock_timestamp!);
      lockExpiry.setMinutes(lockExpiry.getMinutes() + 10);
      
      if (new Date() < lockExpiry) {
        throw new ConflictException('Record is locked by another user');
      }
    }

    // Track changes for audit
    const changes = this.trackChanges(record, data);
    
    // Recalculate down payment if needed
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
    
    // Create audit logs for each change
    for (const change of changes) {
      await this.createAuditLog(id, userId, 'Edit', change.field, change.oldValue, change.newValue);
    }
    
    return savedRecord;
  }

  async findOne(id: string) {
    const record = await this.recordRepo.findOne({ 
      where: { id },
      relations: ['batch', 'audit_logs']
    });
    
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    
    return record;
  }

  async searchRecords(searchDto: SearchRecordsDto) {
    const { query, property_address, borrower_name, apn, status, page = 1, limit = 10, sortBy, sortOrder } = searchDto;
    
    const queryBuilder = this.recordRepo.createQueryBuilder('record')
      .leftJoinAndSelect('record.batch', 'batch');

    // Full-text search with vector search
    if (query) {
      queryBuilder.andWhere(
        `(
          record.search_vector ILIKE :query OR
          record.property_address ILIKE :query OR
          record.borrower_name ILIKE :query OR
          record.apn ILIKE :query OR
          record.loan_officer_name ILIKE :query OR
          record.nmls_id ILIKE :query
        )`,
        { query: `%${query}%` }
      );
    }

    // Specific field filters
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

    // Only show unlocked records or records locked by current user for edit access
    queryBuilder.andWhere(
      '(record.locked_by IS NULL OR record.lock_timestamp < :expiredTime)',
      { expiredTime: new Date(Date.now() - 10 * 60 * 1000) }
    );

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Sorting with safe column names
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

  async autocomplete(field: string, query: string, limit: number = 10) {
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

  async lock(id: string, userId: string) {
    const record = await this.recordRepo.findOne({ where: { id } });
    
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (record.locked_by && record.locked_by !== userId) {
      // Check if lock is expired (10 minutes)
      const lockExpiry = new Date(record.lock_timestamp!);
      lockExpiry.setMinutes(lockExpiry.getMinutes() + 10);
      
      if (new Date() < lockExpiry) {
        throw new ConflictException('Record is locked by another user');
      }
    }

    record.locked_by = userId;
    record.lock_timestamp = new Date();
    
    const savedRecord = await this.recordRepo.save(record);
    
    // Create audit log
    await this.createAuditLog(id, userId, 'Lock');
    
    return savedRecord;
  }

  async unlock(id: string, userId: string) {
    const record = await this.recordRepo.findOne({ where: { id } });
    
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (record.locked_by !== userId) {
      throw new ConflictException('Record is not locked by this user');
    }

    record.locked_by = null as any;
    record.lock_timestamp = null as any;
    
    const savedRecord = await this.recordRepo.save(record);
    
    // Create audit log
    await this.createAuditLog(id, userId, 'Unlock');
    
    return savedRecord;
  }

  async verifyRecord(id: string, userId: string, isGood: boolean) {
    const record = await this.recordRepo.findOne({ where: { id } });
    
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    record.status = isGood ? 'Verified' : 'Flagged';
    record.reviewed_by = userId;
    record.reviewed_by_date = new Date();
    record.locked_by = null as any;
    record.lock_timestamp = null as any;
    
    const savedRecord = await this.recordRepo.save(record);
    
    // Create audit log
    await this.createAuditLog(id, userId, isGood ? 'Verify' : 'Flag');
    
    return savedRecord;
  }

  async getRecordsByBatch(batchId: string, userId?: string) {
    const queryBuilder = this.recordRepo.createQueryBuilder('record')
      .leftJoinAndSelect('record.batch', 'batch')
      .where('record.batch_id = :batchId', { batchId });

    // If userId provided, show only records assigned to that user or unassigned
    if (userId) {
      queryBuilder.andWhere(
        '(record.locked_by IS NULL OR record.locked_by = :userId OR record.lock_timestamp < :expiredTime)',
        { userId, expiredTime: new Date(Date.now() - 10 * 60 * 1000) }
      );
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
        locked_by: Not(IsNull()),
        lock_timestamp: Not(LessThan(new Date(Date.now() - 10 * 60 * 1000)))
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
        lock_timestamp: LessThan(expiredTime),
        locked_by: Not(IsNull()),
      },
    });

    for (const record of expiredRecords) {
      record.locked_by = null as any;
      record.lock_timestamp = null as any;
      await this.recordRepo.save(record);
      
      // Create audit log
      await this.createAuditLog(record.id, 'SYSTEM', 'Unlock', undefined, undefined, 'Automatic unlock due to timeout');
    }

    return expiredRecords.length;
  }

  private generateCountyWebsiteUrl(apn: string, address: string): string {
    if (!apn || !address) {
      return '';
    }
    const encodedApn = encodeURIComponent(apn);
    const encodedAddress = encodeURIComponent(address);
    return `https://example-county.gov/property-search?apn=${encodedApn}&address=${encodedAddress}`;
  }

  private trackChanges(originalRecord: Record, updateData: Partial<CreateRecordDto>) {
    const changes = [];
    const fieldsToTrack: (keyof CreateRecordDto)[] = [
      'property_address', 'borrower_name', 'loan_amount', 'sales_price', 
      'apn', 'loan_officer_name', 'nmls_id', 'loan_term'
    ];

    for (const field of fieldsToTrack) {
      if (updateData[field] !== undefined && updateData[field] !== (originalRecord as any)[field]) {
        changes.push({
          field,
          oldValue: String((originalRecord as any)[field] ?? ''),
          newValue: String(updateData[field] ?? '')
        });
      }
    }

    return changes;
  }

  private createSearchVector(data: any): string {
    const searchableFields = [
      data.property_address,
      data.borrower_name,
      data.apn,
      data.loan_officer_name,
      data.nmls_id,
    ].filter(Boolean);
    
    return searchableFields.join(' ').toLowerCase();
  }

  private async createAuditLog(
    recordId: string,
    userId: string,
    action: string,
    fieldName?: string,
    oldValue?: string,
    newValue?: string,
  ) {
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
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to prevent breaking the main operation
    }
  }
}