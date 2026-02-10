-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: settings
create table if not exists public.settings (
    id uuid default uuid_generate_v4() primary key,
    company_name text,
    cnpj text,
    phone text,
    email text,
    address text,
    created_at timestamptz default now()
);

-- Table: clients
create table if not exists public.clients (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now(),
    name text default 'Cliente', -- NOT NULL removed/default added for safety
    email text,
    whatsapp text,
    cpf_cnpj text,
    address text,
    notes text,
    updated_at timestamptz
);

-- Table: products
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now(),
    description text default '',
    barcode text,
    purchase_price numeric default 0,
    resale_price numeric default 0,
    stock_quantity integer default 0,
    image_url text,
    supplier text,
    updated_at timestamptz
);

-- Table: service_orders
create table if not exists public.service_orders (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now(),
    status text default 'open',
    technician text,
    customer_name text,
    whatsapp text,
    email text,
    equipment_type text,
    brand text,
    model text,
    reported_problem text,
    entry_condition jsonb default '{}',
    services jsonb default '[]',
    products jsonb default '[]',
    discount numeric default 0,
    total_value numeric default 0,
    payment_status text default 'pending',
    diagnosis text,
    repair_category text,
    updated_at timestamptz
);

-- Table: budgets
create table if not exists public.budgets (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now(),
    customer_name text,
    email text,
    whatsapp text,
    equipment_text text,
    problem_description text,
    status text default 'pending',
    approved_value numeric
);

-- Table: transactions
create table if not exists public.transactions (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now(),
    description text,
    amount numeric,
    type text check (type in ('income', 'expense')),
    category text,
    date timestamptz default now()
);

-- Table: sales
create table if not exists public.sales (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamptz default now(),
    customer_name text,
    client_id uuid, -- link manually or via FK if strict
    total_value numeric default 0,
    payment_method text,
    status text default 'completed',
    items jsonb default '[]'
);

-- Basic RLS for public access (since user is struggling with Auth/RLS setup)
alter table public.settings enable row level security;
create policy "Public access settings" on public.settings for all using (true) with check (true);

alter table public.clients enable row level security;
create policy "Public access clients" on public.clients for all using (true) with check (true);

alter table public.products enable row level security;
create policy "Public access products" on public.products for all using (true) with check (true);

alter table public.service_orders enable row level security;
create policy "Public access service_orders" on public.service_orders for all using (true) with check (true);

alter table public.budgets enable row level security;
create policy "Public access budgets" on public.budgets for all using (true) with check (true);

alter table public.transactions enable row level security;
create policy "Public access transactions" on public.transactions for all using (true) with check (true);

alter table public.sales enable row level security;
create policy "Public access sales" on public.sales for all using (true) with check (true);
