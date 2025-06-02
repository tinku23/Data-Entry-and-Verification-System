import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly service;
    constructor(service: AuditLogsService);
    logAction(body: any): Promise<import("./entities/audit-log.entity").AuditLog>;
}
