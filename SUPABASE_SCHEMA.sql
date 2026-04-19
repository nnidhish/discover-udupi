-- Discover Udupi Database Schema
-- PostgreSQL with Row Level Security (RLS)

-- 1. Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. User Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Locations (Places)
create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null, -- cafe, restaurant, viewpoint, market, temple, etc.
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  address text,
  phone text,
  website text,
  image_url text,
  cover_image_url text,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Favorites
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, location_id)
);

-- 5. Reviews
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  content text,
  image_urls text[] default array[]::text[],
  helpful_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Photos/Images for locations
create table if not exists public.location_images (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references public.locations (id) on delete cascade,
  image_url text not null,
  caption text,
  uploaded_by uuid references public.profiles (id),
  is_main boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Row Level Security Policies

-- Profiles: Everyone can view, users can only edit their own
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Locations: Everyone can view
alter table public.locations enable row level security;

create policy "Locations are viewable by everyone" on public.locations
  for select using (true);

create policy "Only admins can insert/update locations" on public.locations
  for insert with check (auth.uid() = auth.uid()); -- TODO: add admin check

create policy "Only admins can update locations" on public.locations
  for update using (auth.uid() = auth.uid()); -- TODO: add admin check

-- Favorites: Users can only manage their own favorites
alter table public.favorites enable row level security;

create policy "Users can view their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can create their own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Reviews: Everyone can view, users can create/edit their own
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone" on public.reviews
  for select using (true);

create policy "Authenticated users can create reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on public.reviews
  for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews" on public.reviews
  for delete using (auth.uid() = user_id);

-- Location Images: Everyone can view
alter table public.location_images enable row level security;

create policy "Location images are viewable by everyone" on public.location_images
  for select using (true);

create policy "Authenticated users can upload images" on public.location_images
  for insert with check (auth.uid() = uploaded_by);

-- 8. Indexes for performance
create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_location_id on public.favorites(location_id);
create index if not exists idx_reviews_location_id on public.reviews(location_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_location_images_location_id on public.location_images(location_id);
create index if not exists idx_locations_category on public.locations(category);
create index if not exists idx_locations_featured on public.locations(is_featured);

-- 9. Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();

create trigger update_locations_updated_at before update on public.locations
  for each row execute function update_updated_at_column();

create trigger update_reviews_updated_at before update on public.reviews
  for each row execute function update_updated_at_column();

-- 10. Sample Data (Optional - remove if not needed)
-- INSERT INTO public.locations (name, description, category, latitude, longitude, address, rating, review_count) VALUES
-- ('Malpe Beach', 'Beautiful beach with pristine white sand', 'beach', 13.3396, 74.7421, 'Malpe, Udupi', 4.5, 128),
-- ('St. Mary''s Island', 'Scenic island with historical church', 'viewpoint', 13.3413, 74.7378, 'St. Mary''s Island, Udupi', 4.6, 95),
-- ('Udupi Krishna Temple', 'Ancient temple in the heart of the city', 'temple', 13.3393, 74.7517, 'Udupi', 4.8, 256);
