-- Red.Ai Projects Table Schema for Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS projects (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT '',
    image_url text,
    status text DEFAULT 'draft',
    generated_images jsonb DEFAULT '[]'::jsonb,
    budget jsonb DEFAULT '{"min": 50000, "max": 200000, "currency": "RUB"}'::jsonb,
    preferred_styles jsonb DEFAULT '["modern"]'::jsonb,
    restrictions jsonb DEFAULT '[]'::jsonb,
    room_analysis jsonb,
    design_recommendation jsonb,
    three_d_model jsonb,
    pdf_report jsonb,
    shopping_list jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);

-- RLS (Row Level Security) - optional, for better security
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own projects
-- CREATE POLICY "Users can view own projects" ON projects
--     FOR SELECT USING (auth.uid()::text = user_id);

-- Policy to allow users to insert their own projects  
-- CREATE POLICY "Users can insert own projects" ON projects
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow users to update their own projects
-- CREATE POLICY "Users can update own projects" ON projects
--     FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy to allow users to delete their own projects
-- CREATE POLICY "Users can delete own projects" ON projects
--     FOR DELETE USING (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 