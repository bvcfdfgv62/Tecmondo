
-- Run these commands if your tables already exist to add the new columns
alter table public.service_orders add column if not exists diagnosis text;
alter table public.service_orders add column if not exists repair_category text;
