-- Atualizar dados existentes com o user_id do usuário atual
UPDATE cards SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE categories SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE income_types SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE transactions SET user_id = auth.uid() WHERE user_id IS NULL; 