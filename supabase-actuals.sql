-- Run this in Supabase SQL Editor to add actuals tracking

-- Monthly giving / income (org-wide)
create table if not exists giving (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null check (month between 1 and 12),
  amount numeric not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (year, month)
);

-- Monthly actual spend by budget type
create table if not exists actuals_spend (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null check (month between 1 and 12),
  budget_type text not null check (budget_type in ('Labor','Contracts','Assets','Other')),
  amount numeric not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (year, month, budget_type)
);

-- RLS
alter table giving enable row level security;
alter table actuals_spend enable row level security;

-- Everyone can read
create policy "authenticated read giving" on giving for select using (auth.role() = 'authenticated');
create policy "authenticated read actuals" on actuals_spend for select using (auth.role() = 'authenticated');

-- Only admins can write
create policy "admin write giving" on giving for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin)
);
create policy "admin write actuals" on actuals_spend for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin)
);

-- Auto-update updated_at
create trigger giving_updated_at before update on giving for each row execute function update_updated_at();
create trigger actuals_updated_at before update on actuals_spend for each row execute function update_updated_at();
