export declare class AppService {
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        environment: string;
        database: string;
    };
    getAppInfo(): {
        message: string;
        version: string;
        endpoints: {
            health: string;
            records: string;
            search: string;
            statistics: string;
        };
    };
}
