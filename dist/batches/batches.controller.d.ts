import { BatchesService } from './batches.service';
import { Batch } from './entities/batch.entity';
export declare class BatchesController {
    private readonly batchesService;
    constructor(batchesService: BatchesService);
    create(createBatchDto: Partial<Batch>): Promise<Batch>;
    findAll(): Promise<Batch[]>;
    findOne(id: string): Promise<Batch>;
    update(id: string, updateBatchDto: Partial<Batch>): Promise<Batch>;
    remove(id: string): Promise<void>;
}
