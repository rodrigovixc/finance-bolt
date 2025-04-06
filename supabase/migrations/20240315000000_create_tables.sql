-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'shopping-cart',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de cartões
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank VARCHAR(255) NOT NULL,
  last_digits VARCHAR(4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tipos de receita
CREATE TABLE IF NOT EXISTS income_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  card_id UUID REFERENCES cards(id),
  income_type_id UUID REFERENCES income_types(id),
  category_id UUID REFERENCES categories(id),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_period VARCHAR(10),
  recurrence_end_date DATE,
  installments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_income_type_id ON transactions(income_type_id);

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

-- Inserir tipos de receita padrão
INSERT INTO income_types (name)
VALUES 
  ('Salário'),
  ('Investimentos'),
  ('Freelance'),
  ('Outros')
ON CONFLICT (name) DO NOTHING; 