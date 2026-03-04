-- ============================================================
-- GREATZED LLP — Supabase Schema
-- Paste this entire file into: Supabase → SQL Editor → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- PLANS
create table if not exists plans (
  id               uuid primary key default uuid_generate_v4(),
  product_type     text not null check (product_type in ('car','health','life','travel')),
  insurer_id       text not null,
  name             text not null,
  plan_type        text,
  annual_premium   numeric(10,2) not null,
  original_premium numeric(10,2),
  features         jsonb default '[]',
  is_active        boolean default true,
  created_at       timestamptz default now()
);

-- USERS
create table if not exists users (
  id           uuid primary key default uuid_generate_v4(),
  phone        text unique,
  email        text unique,
  full_name    text,
  dob          date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- POLICIES
create table if not exists policies (
  id                   uuid primary key default uuid_generate_v4(),
  policy_number        text unique not null,
  plan_id              text not null,
  user_id              uuid references users(id) on delete set null,
  holder_name          text not null,
  holder_email         text not null,
  holder_phone         text not null,
  holder_dob           date,
  nominee              text,
  razorpay_order_id    text,
  razorpay_payment_id  text,
  status               text default 'active' check (status in ('active','expired','cancelled','pending')),
  issued_at            timestamptz default now(),
  expires_at           timestamptz,
  documents_url        text,
  created_at           timestamptz default now()
);

-- TRANSACTIONS
create table if not exists transactions (
  id                   uuid primary key default uuid_generate_v4(),
  razorpay_order_id    text unique not null,
  razorpay_payment_id  text,
  plan_id              text not null,
  user_id              uuid references users(id) on delete set null,
  amount               numeric(10,2) not null,
  currency             text default 'INR',
  status               text default 'pending' check (status in ('pending','paid','failed','refunded')),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- LEADS
create table if not exists leads (
  id          uuid primary key default uuid_generate_v4(),
  name        text,
  phone       text not null,
  email       text,
  product     text,
  details     jsonb default '{}',
  status      text default 'new' check (status in ('new','contacted','converted','lost')),
  created_at  timestamptz default now()
);

-- CLAIMS
create table if not exists claims (
  id              uuid primary key default uuid_generate_v4(),
  policy_id       uuid references policies(id) on delete cascade,
  claim_number    text unique not null,
  incident_date   date,
  claim_type      text,
  description     text,
  amount_claimed  numeric(10,2),
  amount_settled  numeric(10,2),
  status          text default 'submitted' check (status in ('submitted','under_review','approved','rejected','settled')),
  documents_url   jsonb default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- INDEXES
create index if not exists idx_policies_email      on policies(holder_email);
create index if not exists idx_policies_status     on policies(status);
create index if not exists idx_transactions_order  on transactions(razorpay_order_id);
create index if not exists idx_transactions_status on transactions(status);
create index if not exists idx_leads_status        on leads(status);
create index if not exists idx_claims_policy       on claims(policy_id);

-- ROW LEVEL SECURITY
-- Backend uses SERVICE_ROLE_KEY which bypasses RLS entirely.
-- Frontend anon key reads only the user's own data.
alter table policies     enable row level security;
alter table transactions enable row level security;
alter table claims       enable row level security;
alter table users        enable row level security;

create policy "user_own_policies" on policies
  for select using (holder_email = auth.jwt() ->> 'email');

create policy "user_own_transactions" on transactions
  for select using (user_id = auth.uid());

create policy "user_own_claims" on claims
  for select using (
    policy_id in (select id from policies where holder_email = auth.jwt() ->> 'email')
  );

create policy "user_own_profile" on users
  for select using (id = auth.uid());

-- SEED PLANS
insert into plans (product_type, insurer_id, name, plan_type, annual_premium, original_premium, features) values
  ('car','hdfc', 'Comprehensive Plus',    'Comprehensive',  8499,  10200, '["Zero Depreciation","Engine Protection","Roadside Assistance","PA Cover ₹15L"]'),
  ('car','icici','Motor Shield',          'Comprehensive',  7899,  9500,  '["Zero Depreciation","24×7 Assistance","PA Cover ₹15L","Towing Cover"]'),
  ('car','tata', 'AutoSecure Elite',      'Comprehensive',  9299,  11000, '["Zero Depreciation","Engine Protect","Consumables","Return to Invoice"]'),
  ('car','bajaj','Drive Smart TP',        'Third Party',    2094,  2094,  '["Third Party Liability","PA Cover ₹15L","Legal Liability","Compliance"]'),
  ('health','star', 'Family Health Optima','Family Floater',18500, 22000, '["Sum Insured ₹10L","No Room Rent Limit","Daycare","Pre-Post Hospitalization"]'),
  ('health','niva', 'ReAssure 2.0',        'Individual',    12800, 15000, '["Sum Insured ₹5L","Unlimited Restore","No Sub-Limits","AYUSH Cover"]'),
  ('health','hdfc', 'Optima Secure',       'Family Floater',24500, 28000, '["Sum Insured ₹15L","Secure Benefit 2×","Mental Health","Home Care"]'),
  ('life','hdfc', 'Click 2 Protect Super','Term Life',      9800,  11500, '["Cover ₹1 Crore","Till Age 85","Terminal Illness","Tax Benefit 80C"]'),
  ('life','icici','iProtect Smart',       'Term Life',      8900,  10800, '["Cover ₹1 Crore","Till Age 85","Life Stage Benefit","Survival Payout"]'),
  ('life','tata', 'Sampoorna Raksha',     'Term Life',      10200, 12000, '["Cover ₹1 Crore","Till Age 85","Return of Premium","Joint Life"]'),
  ('travel','bajaj','Travel Companion',   'International',  1800,  2200,  '["Medical $1,00,000","Trip Cancellation","Baggage Loss","Passport Loss"]'),
  ('travel','tata', 'Travel Guard Elite', 'International',  2100,  2500,  '["Medical $2,00,000","Emergency Evacuation","Personal Liability","24×7 Help"]'),
  ('travel','icici','Travel Shield',      'Asia Pacific',   1200,  1500,  '["Medical $50,000","Trip Delay","Baggage Delay","Flight Cancel"]');

select 'Greatzed schema created ✅' as result;
