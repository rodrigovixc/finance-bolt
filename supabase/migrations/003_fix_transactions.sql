-- Make card_id nullable in transactions table
ALTER TABLE transactions
ALTER COLUMN card_id DROP NOT NULL; 