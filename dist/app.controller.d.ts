import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getRoot(): {
        message: string;
        version: string;
        endpoints: {
            health: string;
            records: string;
            search: string;
            statistics: string;
        };
    };
    getHealth(): {
        status: string;
        timestamp: string;
        environment: string;
        database: string;
    };
}
