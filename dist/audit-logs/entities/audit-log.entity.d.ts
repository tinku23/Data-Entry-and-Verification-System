import { Record } from '../../records/entities/record.entity';
export declare class AuditLog {
    id: string;
    record_id: string;
    user_id: string;
    action: string;
    field_name?: string;
    old_value?: string;
    new_value?: string;
    ip_address?: string;
    user_agent?: string;
    timestamp: Date;
    record: Record;
}
