import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';
export declare class RecordsController {
    private readonly recordsService;
    constructor(recordsService: RecordsService);
    create(createRecordDto: CreateRecordDto, req: any): Promise<import("./entities/record.entity").Record>;
    search(searchDto: SearchRecordsDto): Promise<{
        data: import("./entities/record.entity").Record[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    autocomplete(field: string, query: string, limit?: string): Promise<any[]>;
    getStatistics(): Promise<{
        total: number;
        locked: number;
        byStatus: any;
    }>;
    getRecordsByBatch(batchId: string, req: any): Promise<import("./entities/record.entity").Record[]>;
    findOne(id: string): Promise<import("./entities/record.entity").Record>;
    update(id: string, updateData: Partial<CreateRecordDto>, req: any): Promise<import("./entities/record.entity").Record>;
    lock(id: string, req: any): Promise<import("./entities/record.entity").Record>;
    unlock(id: string, req: any): Promise<import("./entities/record.entity").Record>;
    verify(id: string, isGood: boolean, req: any): Promise<import("./entities/record.entity").Record>;
}
