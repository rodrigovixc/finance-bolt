-- Atualizar a tabela de categorias
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'shopping-cart';

-- Atualizar a tabela de transações
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_period VARCHAR(10),
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS installments JSONB;

-- Criar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Inserir categorias padrão
INSERT INTO categories (name, description, color, icon)
VALUES 
  ('Alimentação', 'Gastos com alimentação', '#10B981', 'utensils'),
  ('Transporte', 'Gastos com transporte', '#3B82F6', 'car'),
  ('Moradia', 'Gastos com moradia', '#8B5CF6', 'home'),
  ('Saúde', 'Gastos com saúde', '#EC4899', 'heart'),
  ('Educação', 'Gastos com educação', '#F59E0B', 'graduation-cap'),
  ('Lazer', 'Gastos com lazer', '#6366F1', 'smile'),
  ('Vestuário', 'Gastos com roupas', '#F43F5E', 'shirt'),
  ('Outros', 'Outros gastos', '#6B7280', 'tag')
ON CONFLICT (name) DO NOTHING; 