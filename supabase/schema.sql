-- The Exquisite Wine Experience: database schema.
-- Run the whole file in the Supabase SQL editor, then `npm run seed` to load /data and
-- `npm run test:supabase` to check everything.
--
-- Safe to re-run. It only creates and alters these four tables: products, restaurants,
-- contact_messages, newsletter_signups. Nothing else in the project is touched.
--
-- Access model (no customer accounts; Shopify takes guest checkout):
--   anyone   -> can read products and restaurants
--   anyone   -> can send a contact message and join the newsletter, but never read them back
--   service  -> the service_role key (seed script, Supabase dashboard) manages everything

-- ---------------------------------------------------------------- products
create table if not exists public.products (
  handle         text primary key,
  title          text not null,
  vendor         text not null,
  type           text not null check (type in ('Red','White','Sparkling','Rosé','Dessert','Spirits')),
  region         text not null,
  country        text not null,
  grape          text not null,
  vintage        int check (vintage is null or vintage between 1900 and 2100),
  size           text not null default '750 ml',
  abv            numeric(4,1) check (abv is null or abv between 0 and 80), -- null when the sheet doesn't say
  price          numeric(10,2) not null check (price >= 0),
  body           smallint not null check (body between 1 and 5),
  acidity        smallint not null check (acidity between 1 and 5),
  sweetness      smallint not null check (sweetness between 1 and 5),
  notes          text not null,
  pairing        text not null,
  drink_window   text not null,
  sommelier_note text not null,
  featured       boolean not null default false,
  limited        boolean not null default false,
  stock          int not null default 0 check (stock >= 0),
  image_url      text
);

-- Alcohol became optional with the real catalogue (some producer sheets don't state it).
alter table public.products alter column abv drop not null;

-- ---------------------------------------------------------------- restaurants
create table if not exists public.restaurants (
  slug        text primary key,
  name        text not null,
  city        text not null,
  province    text not null default 'ON',
  kind        text not null,
  address     text,
  phone       text,
  website     text,
  intro       text not null,
  on_the_list text[] not null default '{}',
  image       text,
  image_alt   text
);
-- Added after the first version of this file; harmless if they already exist.
alter table public.restaurants add column if not exists image text;
alter table public.restaurants add column if not exists image_alt text;

-- ---------------------------------------------------------------- contact form
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 200),
  email      text not null check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  topic      text not null check (char_length(topic) <= 100),
  message    text not null check (char_length(message) between 1 and 4000)
);

-- ---------------------------------------------------------------- cellar letter (newsletter)
create table if not exists public.newsletter_signups (
  email      text primary key check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- row level security
alter table public.products           enable row level security;
alter table public.restaurants        enable row level security;
alter table public.contact_messages   enable row level security;
alter table public.newsletter_signups enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select to anon, authenticated using (true);

drop policy if exists "public read restaurants" on public.restaurants;
create policy "public read restaurants" on public.restaurants for select to anon, authenticated using (true);

-- Visitors may send a message or sign up, but never read either table back.
drop policy if exists "public insert contact" on public.contact_messages;
create policy "public insert contact" on public.contact_messages for insert to anon, authenticated with check (true);

drop policy if exists "public insert newsletter" on public.newsletter_signups;
create policy "public insert newsletter" on public.newsletter_signups for insert to anon, authenticated with check (true);

-- Newer projects don't expose new tables to the API roles automatically.
grant select on public.products, public.restaurants to anon, authenticated;
grant insert on public.contact_messages, public.newsletter_signups to anon, authenticated;
revoke select, update, delete on public.contact_messages, public.newsletter_signups from anon, authenticated;

-- Make the API pick up the new tables straight away.
notify pgrst, 'reload schema';
