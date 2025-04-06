-- Criar tabela de tipos de entrada
CREATE TABLE income_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON income_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE income_types ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios tipos de entrada"
    ON income_types FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios tipos de entrada"
    ON income_types FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios tipos de entrada"
    ON income_types FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios tipos de entrada"
    ON income_types FOR DELETE
    USING (auth.uid() = user_id);

-- Adicionar coluna de tipo de entrada na tabela de transações
ALTER TABLE transactions ADD COLUMN income_type_id UUID REFERENCES income_types(id);

-- Adicionar coluna user_id na tabela de cartões
ALTER TABLE cards ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;

-- Habilitar RLS na tabela de cartões
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para cartões
CREATE POLICY "Usuários podem ver seus próprios cartões"
    ON cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios cartões"
    ON cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios cartões"
    ON cards FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios cartões"
    ON cards FOR DELETE
    USING (auth.uid() = user_id);

-- Adicionar coluna user_id na tabela de transações
ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;

-- Habilitar RLS na tabela de transações
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para transações
CREATE POLICY "Usuários podem ver suas próprias transações"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias transações"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id); 