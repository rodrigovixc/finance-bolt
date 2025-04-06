-- Criação das tabelas
create table cards (
  id uuid default uuid_generate_v4() primary key,
  bank text not null,
  last_digits text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  color text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table income_types (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table transactions (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  amount numeric not null,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  card_id uuid references cards(id),
  category_id uuid references categories(id),
  income_type_id uuid references income_types(id),
  is_recurring boolean default false,
  recurrence_period text,
  recurrence_end_date date,
  installments jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas de segurança
alter table cards enable row level security;
alter table categories enable row level security;
alter table income_types enable row level security;
alter table transactions enable row level security;

create policy "Usuários autenticados podem ver seus próprios dados"
  on cards for select
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem inserir seus próprios dados"
  on cards for insert
  with check (auth.uid() = auth.uid());

create policy "Usuários autenticados podem atualizar seus próprios dados"
  on cards for update
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem deletar seus próprios dados"
  on cards for delete
  using (auth.uid() = auth.uid());

-- Repetir as mesmas políticas para as outras tabelas
create policy "Usuários autenticados podem ver seus próprios dados"
  on categories for select
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem inserir seus próprios dados"
  on categories for insert
  with check (auth.uid() = auth.uid());

create policy "Usuários autenticados podem atualizar seus próprios dados"
  on categories for update
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem deletar seus próprios dados"
  on categories for delete
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem ver seus próprios dados"
  on income_types for select
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem inserir seus próprios dados"
  on income_types for insert
  with check (auth.uid() = auth.uid());

create policy "Usuários autenticados podem atualizar seus próprios dados"
  on income_types for update
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem deletar seus próprios dados"
  on income_types for delete
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem ver suas próprias transações"
  on transactions for select
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem inserir suas próprias transações"
  on transactions for insert
  with check (auth.uid() = auth.uid());

create policy "Usuários autenticados podem atualizar suas próprias transações"
  on transactions for update
  using (auth.uid() = auth.uid());

create policy "Usuários autenticados podem deletar suas próprias transações"
  on transactions for delete
  using (auth.uid() = auth.uid()); 