-- Add card_flag column to service_orders table
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS card_flag TEXT;
