-- 7M Financial Planner — Supabase Schema
-- Run this in your Supabase SQL editor

-- Departments & leads lookup
create table if not exists departments (
  id serial primary key,
  name text not null unique,
  lead text
);

-- Labor / personnel
create table if not exists labor (
  id uuid primary key default gen_random_uuid(),
  budget_dept text,
  functional_dept text,
  name text,
  role text,
  start_date date,
  total_comp numeric,
  base numeric,
  match_403b numeric,
  cell_phone numeric,
  insurance_fica numeric,
  housing numeric,
  jan numeric default 0, feb numeric default 0, mar numeric default 0,
  apr numeric default 0, may numeric default 0, jun numeric default 0,
  jul numeric default 0, aug numeric default 0, sep numeric default 0,
  oct numeric default 0, nov numeric default 0, dec numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contracts
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  department text,
  phase text,
  category text,
  type text,
  description text,
  vendor text,
  start_date date,
  end_date date,
  months numeric,
  contract_amount numeric,
  jan numeric default 0, feb numeric default 0, mar numeric default 0,
  apr numeric default 0, may numeric default 0, jun numeric default 0,
  jul numeric default 0, aug numeric default 0, sep numeric default 0,
  oct numeric default 0, nov numeric default 0, dec numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Assets / equipment inventory
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  department text,
  phase text,
  category text,
  asset_type text,
  brand text,
  model text,
  serial_number text,
  comments text,
  location_user text,
  purchase_date date,
  life_in_months numeric,
  refresh_date date,
  unit_cost numeric,
  purchase_amount numeric,
  quantity numeric default 1,
  jan numeric default 0, feb numeric default 0, mar numeric default 0,
  apr numeric default 0, may numeric default 0, jun numeric default 0,
  jul numeric default 0, aug numeric default 0, sep numeric default 0,
  oct numeric default 0, nov numeric default 0, dec numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Other budget items
create table if not exists other_items (
  id uuid primary key default gen_random_uuid(),
  department text,
  phase text,
  category text,
  item text,
  jan numeric default 0, feb numeric default 0, mar numeric default 0,
  apr numeric default 0, may numeric default 0, jun numeric default 0,
  jul numeric default 0, aug numeric default 0, sep numeric default 0,
  oct numeric default 0, nov numeric default 0, dec numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bonus funding targets
create table if not exists bonus_config (
  id serial primary key,
  annual_revenue_target numeric not null default 2000000,
  total_bonus_pool numeric not null default 85552,
  updated_at timestamptz default now()
);

-- User profiles (linked to Supabase auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  department text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Row-level security
alter table labor enable row level security;
alter table contracts enable row level security;
alter table assets enable row level security;
alter table other_items enable row level security;
alter table profiles enable row level security;
alter table departments enable row level security;
alter table bonus_config enable row level security;

-- Everyone authenticated can read all data
create policy "authenticated read labor" on labor for select using (auth.role() = 'authenticated');
create policy "authenticated read contracts" on contracts for select using (auth.role() = 'authenticated');
create policy "authenticated read assets" on assets for select using (auth.role() = 'authenticated');
create policy "authenticated read other" on other_items for select using (auth.role() = 'authenticated');
create policy "authenticated read departments" on departments for select using (auth.role() = 'authenticated');
create policy "authenticated read bonus" on bonus_config for select using (auth.role() = 'authenticated');
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- Leads can only edit rows matching their department
create policy "dept edit labor" on labor for all using (
  exists (select 1 from profiles where id = auth.uid() and (is_admin or department = labor.functional_dept))
);
create policy "dept edit contracts" on contracts for all using (
  exists (select 1 from profiles where id = auth.uid() and (is_admin or department = contracts.department))
);
create policy "dept edit assets" on assets for all using (
  exists (select 1 from profiles where id = auth.uid() and (is_admin or department = assets.department))
);
create policy "dept edit other" on other_items for all using (
  exists (select 1 from profiles where id = auth.uid() and (is_admin or department = other_items.department))
);

-- Admins can update bonus config
create policy "admin edit bonus" on bonus_config for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin)
);

-- Seed departments
insert into departments (name, lead) values
  ('Admin', 'Julie'),
  ('Business', 'Caitlin'),
  ('Care & Assimilation', 'Caleb'),
  ('College', 'Josh'),
  ('Communications', 'Matt'),
  ('Facility', 'Julie'),
  ('Groups', 'Justin'),
  ('IT', 'Caitlin'),
  ('Kids', 'Kayla'),
  ('Missions', 'Josh'),
  ('Pastoral', null),
  ('Preteen', null),
  ('Production', 'Jeremy'),
  ('Students', null),
  ('Worship', null)
on conflict (name) do nothing;

-- Seed bonus config
insert into bonus_config (annual_revenue_target, total_bonus_pool)
values (2000000, 85552)
on conflict do nothing;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger labor_updated_at before update on labor for each row execute function update_updated_at();
create trigger contracts_updated_at before update on contracts for each row execute function update_updated_at();
create trigger assets_updated_at before update on assets for each row execute function update_updated_at();
create trigger other_updated_at before update on other_items for each row execute function update_updated_at();
