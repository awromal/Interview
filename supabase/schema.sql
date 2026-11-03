-- Supabase Schema for AI Tech Interview Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  target_role text default 'fullstack_developer',
  experience_level text default 'beginner',
  current_resume_url text,
  ats_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Interview Sessions Table
create table if not exists public.interview_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  candidate_name text not null,
  target_role text not null,
  level text not null default 'beginner', -- beginner, intermediate, pro
  stage text not null default 'level_2_behavioral',
  status text not null default 'in_progress', -- in_progress, completed, abandoned
  overall_score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 3. Interview Transcript Messages Table
create table if not exists public.interview_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.interview_sessions(id) on delete cascade not null,
  sender text not null, -- 'ai' or 'candidate'
  text text not null,
  duration_seconds numeric,
  filler_words jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Coding Submissions Table
create table if not exists public.coding_submissions (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.interview_sessions(id) on delete cascade not null,
  challenge_id text not null,
  language text not null,
  code text not null,
  passed boolean default false,
  tests_passed integer default 0,
  tests_total integer default 0,
  execution_time_ms numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Scorecard & Feedback Reports Table
create table if not exists public.scorecards (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.interview_sessions(id) on delete cascade not null unique,
  overall_score integer not null,
  breakdown jsonb not null,
  speech_metrics jsonb not null,
  strengths jsonb default '[]'::jsonb,
  areas_of_improvement jsonb default '[]'::jsonb,
  action_plan jsonb default '[]'::jsonb,
  detailed_question_evaluations jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_messages enable row level security;
alter table public.coding_submissions enable row level security;
alter table public.scorecards enable row level security;

-- Simple RLS Policies (Allow access to own rows or public demo mode)
create policy "Allow all actions for testing or authenticated users on profiles"
  on public.profiles for all using (true);

create policy "Allow all actions on interview_sessions"
  on public.interview_sessions for all using (true);

create policy "Allow all actions on interview_messages"
  on public.interview_messages for all using (true);

create policy "Allow all actions on coding_submissions"
  on public.coding_submissions for all using (true);

create policy "Allow all actions on scorecards"
  on public.scorecards for all using (true);
