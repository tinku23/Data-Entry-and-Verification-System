export declare class User {
    id: string;
    username: string;
    password_hash: string;
    role: 'Admin' | 'VA';
    created_at: Date;
    updated_at: Date;
}
