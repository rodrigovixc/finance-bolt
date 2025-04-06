# Bolt Finance

Sistema de gerenciamento financeiro pessoal desenvolvido com React, TypeScript e Supabase.

## 🚀 Funcionalidades

- 📊 Dashboard com visão geral das finanças
- 💳 Gerenciamento de cartões de crédito
- 💰 Registro de despesas e receitas
- 📈 Visualização de gastos por cartão
- 📅 Histórico de transações
- 🔐 Autenticação de usuários

## 🛠️ Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Vite

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/rodrigovixc/finance-bolt.git
cd finance-bolt
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

## ⚙️ Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com) se ainda não tiver

2. Crie um novo projeto:
   - Clique em "New Project"
   - Dê um nome ao projeto (ex: "bolt-finance")
   - Escolha uma senha para o banco de dados
   - Selecione a região mais próxima (ex: São Paulo)
   - Clique em "Create new project"

3. Configure o banco de dados:
   - Vá para a seção "SQL Editor"
   - Execute os scripts de migração na ordem:
     1. `supabase/migrations/001_initial_schema.sql`
     2. `supabase/migrations/002_income_types.sql`
     3. `supabase/migrations/003_fix_transactions.sql`
     4. `supabase/migrations/004_user_auth.sql`

4. Configure as políticas de segurança (RLS):
   - Vá para "Authentication" > "Policies"
   - Habilite o RLS para todas as tabelas
   - Aplique as políticas de segurança conforme definido nos scripts de migração

5. Obtenha as credenciais do projeto:
   - Vá para "Project Settings" > "API"
   - Copie a URL do projeto e a chave anon/public

## 🔑 Configuração do Ambiente

1. Crie um arquivo `.env` na raiz do projeto:
```bash
touch .env
```

2. Adicione as seguintes variáveis de ambiente:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

Substitua `sua_url_do_supabase` e `sua_chave_anon_do_supabase` pelos valores obtidos no passo 5 da configuração do Supabase.

## 🚀 Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

2. Acesse o projeto em:
```
http://localhost:5173
```

## 📝 Estrutura do Banco de Dados

- `cards`: Armazena os cartões de crédito
- `transactions`: Registra todas as transações (despesas e receitas)
- `income_types`: Tipos de receitas (salário, freelance, etc.)
- `auth.users`: Usuários do sistema (gerenciado pelo Supabase Auth)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Autores

- **Rodrigo Costa** - [GitHub](https://github.com/rodrigovixc) 