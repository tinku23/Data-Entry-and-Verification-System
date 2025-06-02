export declare const config: {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        url: string;
        ssl: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    app: {
        port: number;
        nodeEnv: string;
        corsOrigin: string;
    };
    lockTimeout: number;
};
