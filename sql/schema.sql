-- Majoo Device Compatibility — schema
-- Run this once in the Supabase SQL editor for the target project.

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

do $$ begin
  create type compatibility_status as enum ('compatible', 'not_compatible', 'untested');
exception when duplicate_object then null;
end $$;

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  merk text not null,
  type text not null default '',
  kategori_sub text,
  os text,
  setting text,
  device_tac boolean,
  app_version text,
  compatibility_status compatibility_status not null default 'untested',
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists devices_category_id_idx on devices(category_id);
create index if not exists devices_merk_type_idx on devices(merk, type);

alter table categories enable row level security;
alter table devices enable row level security;

-- Public read access (website is public).
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);
drop policy if exists "public read devices" on devices;
create policy "public read devices" on devices for select using (true);

-- Writes go through the server using the service role key (bypasses RLS),
-- so no public insert/update/delete policy is defined here.
