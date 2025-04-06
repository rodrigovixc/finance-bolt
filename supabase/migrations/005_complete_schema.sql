-- Primeiro, removemos todas as tabelas existentes
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS income_types CASCADE;

-- Criamos a tabela de cartões
CREATE TABLE cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bank TEXT NOT NULL,
    name TEXT NOT NULL,
    last_digits TEXT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    closing_day INTEGER NOT NULL,
    due_day INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criamos a tabela de tipos de receita
CREATE TABLE income_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criamos a tabela de transações
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    income_type_id UUID REFERENCES income_types(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criamos os triggers para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_types_updated_at
    BEFORE UPDATE ON income_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitamos RLS em todas as tabelas
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criamos as políticas de segurança
-- Políticas para cartões
CREATE POLICY "Usuários podem ver seus próprios cartões"
    ON cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios cartões"
    ON cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios cartões"
    ON cards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios cartões"
    ON cards FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para tipos de receita
CREATE POLICY "Usuários podem ver seus próprios tipos de receita"
    ON income_types FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios tipos de receita"
    ON income_types FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios tipos de receita"
    ON income_types FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios tipos de receita"
    ON income_types FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para transações
CREATE POLICY "Usuários podem ver suas próprias transações"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias transações"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Inserimos alguns tipos de receita padrão
INSERT INTO income_types (user_id, name, description)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Salário', 'Rendimento mensal fixo'),
    ('00000000-0000-0000-0000-000000000000', 'Freelance', 'Trabalhos autônomos'),
    ('00000000-0000-0000-0000-000000000000', 'Investimentos', 'Rendimentos de investimentos'),
    ('00000000-0000-0000-0000-000000000000', 'Outros', 'Outros tipos de receita'); 