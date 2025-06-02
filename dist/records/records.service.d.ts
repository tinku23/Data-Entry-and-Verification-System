import { Repository } from 'typeorm';
import { Record } from './entities/record.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { SearchRecordsDto } from './dto/search-records.dto';
import { CreateRecordDto } from './dto/create-record.dto';
export declare class RecordsService {
    private readonly recordRepo;
    private readonly auditLogRepo;
    constructor(recordRepo: Repository<Record>, auditLogRepo: Repository<AuditLog>);
    create(data: CreateRecordDto, userId?: string): Promise<Record>;
    update(id: string, data: Partial<CreateRecordDto>, userId: string): Promise<Record>;
    findOne(id: string): Promise<Record>;
    searchRecords(searchDto: SearchRecordsDto): Promise<{
        data: Record[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    autocomplete(field: string, query: string, limit?: number): Promise<any[]>;
    lock(id: string, userId: string): Promise<Record>;
    unlock(id: string, userId: string): Promise<Record>;
    verifyRecord(id: string, userId: string, isGood: boolean): Promise<Record>;
    getRecordsByBatch(batchId: string, userId?: string): Promise<Record[]>;
    getRecordStatistics(): Promise<{
        total: number;
        locked: number;
        byStatus: any;
    }>;
    unlockExpiredRecords(): Promise<number>;
    private generateCountyWebsiteUrl;
    private trackChanges;
    private createSearchVector;
    private createAuditLog;
}
