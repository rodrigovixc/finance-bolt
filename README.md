# Bolt Finance

Sistema de controle financeiro pessoal com foco em cartões de crédito.

## 🚀 Funcionalidades

- 📊 Dashboard com visão geral das finanças
- 💳 Controle de cartões de crédito
- 💰 Registro de transações (receitas e despesas)
- 📈 Categorização de despesas
- 📅 Controle de parcelamentos
- 📊 Gráficos e relatórios

## 🛠️ Tecnologias Utilizadas

- React
- TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS
- Recharts

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/bolt-finance.git
cd bolt-finance
```

2. Instale as dependências:
```bash
npm install
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
   - Copie e cole todo o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
   - Execute o script

4. Obtenha as credenciais do projeto:
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
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Substitua `sua_url_do_supabase` e `sua_chave_anonima_do_supabase` pelos valores obtidos no passo 4 da configuração do Supabase.

## 🚀 Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse o projeto em:
```
http://localhost:5173
```

## 📝 Estrutura do Banco de Dados

- `cards`: Armazena os cartões de crédito
- `transactions`: Registra todas as transações (despesas e receitas)
- `income_types`: Tipos de receitas (salário, freelance, etc.)
- `categories`: Categorias de despesas

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 