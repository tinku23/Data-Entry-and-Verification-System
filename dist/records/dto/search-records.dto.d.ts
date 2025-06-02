export declare class SearchRecordsDto {
    query?: string;
    property_address?: string;
    borrower_name?: string;
    apn?: string;
    status?: 'Pending' | 'Verified' | 'Flagged';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
