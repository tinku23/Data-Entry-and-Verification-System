import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
export declare class BatchesService {
    private readonly batchRepo;
    constructor(batchRepo: Repository<Batch>);
    create(createBatchDto: Partial<Batch>): Promise<Batch>;
    findAll(): Promise<Batch[]>;
    findOne(id: string): Promise<Batch>;
    update(id: string, updateBatchDto: Partial<Batch>): Promise<Batch>;
    remove(id: string): Promise<void>;
}
