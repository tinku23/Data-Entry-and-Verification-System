import { RecordsService } from '../../records/records.service';
export declare class RecordUnlockTask {
    private readonly recordsService;
    private readonly logger;
    constructor(recordsService: RecordsService);
    handleUnlockExpiredRecords(): Promise<void>;
}
