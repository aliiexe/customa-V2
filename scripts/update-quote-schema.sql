-- Update client_quotes table to include updatedAt field if not exists
ALTER TABLE client_quotes 
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update the status ENUM to include new status values
ALTER TABLE client_quotes 
MODIFY COLUMN status ENUM('DRAFT', 'PENDING', 'CONFIRMED', 'APPROVED', 'REJECTED', 'CONVERTED') NOT NULL DEFAULT 'DRAFT';

-- Update existing quotes to have DRAFT status if they don't have a status
UPDATE client_quotes 
SET status = 'DRAFT' 
WHERE status IS NULL OR status = '';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_client_quotes_status ON client_quotes(status);
CREATE INDEX IF NOT EXISTS idx_client_quotes_client_id ON client_quotes(clientId);
CREATE INDEX IF NOT EXISTS idx_client_quote_items_quote_id ON client_quote_items(quoteId); 