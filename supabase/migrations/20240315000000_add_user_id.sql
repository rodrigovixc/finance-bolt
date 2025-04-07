-- Adicionar coluna user_id em todas as tabelas
ALTER TABLE cards ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE income_types ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Atualizar políticas de segurança
DROP POLICY IF EXISTS "Usuários autenticados podem ver seus próprios dados" ON cards;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir seus próprios dados" ON cards;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seus próprios dados" ON cards;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar seus próprios dados" ON cards;

DROP POLICY IF EXISTS "Usuários autenticados podem ver seus próprios dados" ON categories;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir seus próprios dados" ON categories;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seus próprios dados" ON categories;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar seus próprios dados" ON categories;

DROP POLICY IF EXISTS "Usuários autenticados podem ver seus próprios dados" ON income_types;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir seus próprios dados" ON income_types;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar seus próprios dados" ON income_types;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar seus próprios dados" ON income_types;

DROP POLICY IF EXISTS "Usuários autenticados podem ver suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar suas próprias transações" ON transactions;

-- Criar novas políticas de segurança
CREATE POLICY "Usuários podem ver apenas seus próprios dados"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas seus próprios dados"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar apenas seus próprios dados"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- Repetir para categories
CREATE POLICY "Usuários podem ver apenas suas próprias categorias"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias categorias"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias categorias"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar apenas suas próprias categorias"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Repetir para income_types
CREATE POLICY "Usuários podem ver apenas seus próprios tipos de receita"
  ON income_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas seus próprios tipos de receita"
  ON income_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios tipos de receita"
  ON income_types FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar apenas seus próprios tipos de receita"
  ON income_types FOR DELETE
  USING (auth.uid() = user_id);

-- Repetir para transactions
CREATE POLICY "Usuários podem ver apenas suas próprias transações"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias transações"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias transações"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar apenas suas próprias transações"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id); 