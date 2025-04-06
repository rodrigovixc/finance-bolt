-- Remover tabelas na ordem correta (evitando problemas com chaves estrangeiras)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS income_types;
DROP TABLE IF EXISTS categories;

-- Remover extensão UUID (opcional)
-- DROP EXTENSION IF EXISTS "uuid-ossp"; 