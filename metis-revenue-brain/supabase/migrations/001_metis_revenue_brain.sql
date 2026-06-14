create table if not exists public.metis_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  business text not null,
  niche text not null,
  pain text not null,
  revenue_goal text not null,
  offer_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'new'
);

create table if not exists public.metis_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.metis_leads(id) on delete set null,
  customer_email text,
  external_reference text,
  amount_total integer,
  currency text,
  status text not null default 'received',
  raw_event jsonb not null default '{}'::jsonb
);

create table if not exists public.metis_deliveries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid references public.metis_orders(id) on delete cascade,
  title text not null,
  status text not null default 'queued',
  checklist jsonb not null default '[]'::jsonb,
  due_at timestamptz
);

create index if not exists metis_leads_email_idx on public.metis_leads(email);
create index if not exists metis_orders_lead_id_idx on public.metis_orders(lead_id);
create index if not exists metis_deliveries_order_id_idx on public.metis_deliveries(order_id);

alter table public.metis_leads enable row level security;
alter table public.metis_orders enable row level security;
alter table public.metis_deliveries enable row level security;
