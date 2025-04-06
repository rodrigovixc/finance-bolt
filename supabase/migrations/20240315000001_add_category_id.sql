-- Adicionar coluna category_id na tabela transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Adicionar a referência (foreign key) para a tabela categories
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_category
FOREIGN KEY (category_id)
REFERENCES categories(id);

-- Criar índice para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id); 