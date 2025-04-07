-- Limpar a tabela de transações
DELETE FROM transactions
WHERE auth.uid() = auth.uid(); 