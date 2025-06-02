import { Record } from '../../records/entities/record.entity';
export declare class Batch {
    id: string;
    batch_name: string;
    batch_type: string;
    status: string;
    description?: string;
    created_at: Date;
    records?: Record[];
}
