-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Users profile (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Clients
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  company text not null default '',
  status text not null default 'warm' check (status in ('cold', 'warm', 'hot')),
  birthday text default '',
  how_we_met text default '',
  needs text default '',
  how_helped text default '',
  plans text default '',
  budget text default '$$' check (budget in ('$', '$$', '$$$')),
  last_contacted date default current_date,
  preferences jsonb default '{"family":[],"holidays":[],"food":[],"hobbies":[]}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.clients enable row level security;
create policy "Users can CRUD own clients" on public.clients for all using (auth.uid() = user_id);

-- Meeting notes
create table public.meeting_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete cascade not null,
  client_name text not null,
  date date not null default current_date,
  location text default '',
  topics text[] default '{}',
  follow_ups jsonb default '[]',
  small_talk jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.meeting_notes enable row level security;
create policy "Users can CRUD own notes" on public.meeting_notes for all using (auth.uid() = user_id);

-- Calendar events
create table public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  title text not null,
  time text not null,
  location text default '',
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.calendar_events enable row level security;
create policy "Users can CRUD own events" on public.calendar_events for all using (auth.uid() = user_id);

-- Todos / follow-ups
create table public.todos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete cascade,
  client_name text not null default '',
  task text not null,
  done boolean default false,
  suggested_time text default '',
  meeting_note_id uuid references public.meeting_notes on delete set null,
  created_at timestamptz default now()
);

alter table public.todos enable row level security;
create policy "Users can CRUD own todos" on public.todos for all using (auth.uid() = user_id);

-- Indexes
create index idx_clients_user_id on public.clients(user_id);
create index idx_meeting_notes_user_id on public.meeting_notes(user_id);
create index idx_meeting_notes_client_id on public.meeting_notes(client_id);
create index idx_calendar_events_user_id on public.calendar_events(user_id);
create index idx_todos_user_id on public.todos(user_id);
