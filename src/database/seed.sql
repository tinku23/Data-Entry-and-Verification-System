-- Create sample users
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$rQ8K5O.6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6', 'Admin'),
('va_user', '$2b$10$rQ8K5O.6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6', 'VA')
ON CONFLICT (username) DO NOTHING;

-- Create sample batch
INSERT INTO batches (batch_name, batch_type, description) VALUES 
('2024-01-15-Daily', 'Daily', 'Daily batch for January 15, 2024')
ON CONFLICT (batch_name) DO NOTHING;

-- Get batch ID for sample records
DO $$
DECLARE
    batch_uuid uuid;
BEGIN
    SELECT id INTO batch_uuid FROM batches WHERE batch_name = '2024-01-15-Daily';
    
    -- Create sample records
    INSERT INTO records (
        property_address, transaction_date, borrower_name, loan_amount, 
        sales_price, down_payment, apn, entered_by, entered_by_date,
        loan_officer_name, nmls_id, loan_term, batch_id, search_vector
    ) VALUES 
    (
        '123 Main Street, Los Angeles, CA 90210', 
        '2024-01-15',
        'John Doe',
        350000.00,
        400000.00,
        50000.00,
        '5555-001-001',
        'admin',
        NOW(),
        'Alice Johnson',
        'CA-12345',
        30,
        batch_uuid,
        '123 main street los angeles john doe 5555-001-001 alice johnson ca-12345'
    ),
    (
        '456 Oak Avenue, Beverly Hills, CA 90211',
        '2024-01-15', 
        'Jane Smith',
        750000.00,
        850000.00,
        100000.00,
        '5555-002-002',
        'va_user',
        NOW(),
        'Bob Wilson',
        'CA-67890',
        30,
        batch_uuid,
        '456 oak avenue beverly hills jane smith 5555-002-002 bob wilson ca-67890'
    );
END $$;
