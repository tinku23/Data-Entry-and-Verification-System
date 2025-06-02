import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditLogsService {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    createLog(data: Partial<AuditLog>): Promise<AuditLog>;
}
