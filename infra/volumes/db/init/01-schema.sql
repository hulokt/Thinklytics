-- Create user_data table to store all localStorage data
CREATE TABLE IF NOT EXISTS user_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_type ON user_data(data_type);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at);

-- Create RLS policies for user_data table
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON user_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON user_data
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON user_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to upsert user data
CREATE OR REPLACE FUNCTION upsert_user_data(
    p_user_id UUID,
    p_data_type VARCHAR(50),
    p_data JSONB
)
RETURNS user_data AS $$
DECLARE
    result user_data;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id cannot be null';
    END IF;
    
    IF p_data_type IS NULL OR p_data_type = '' THEN
        RAISE EXCEPTION 'data_type cannot be null or empty';
    END IF;
    
    IF p_data IS NULL THEN
        RAISE EXCEPTION 'data cannot be null';
    END IF;
    
    -- Check data size (limit to 10MB to prevent issues)
    IF jsonb_array_length(p_data) > 10000 THEN
        RAISE EXCEPTION 'Data too large: maximum 10,000 items allowed';
    END IF;
    
    -- Log the operation for debugging
    RAISE NOTICE 'upsert_user_data: user_id=%, data_type=%, data_size=%', 
        p_user_id, p_data_type, jsonb_array_length(p_data);
    
    INSERT INTO user_data (user_id, data_type, data)
    VALUES (p_user_id, p_data_type, p_data)
    ON CONFLICT (user_id, data_type)
    DO UPDATE SET 
        data = EXCLUDED.data,
        updated_at = NOW()
    RETURNING * INTO result;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details
        RAISE NOTICE 'upsert_user_data error: %', SQLERRM;
        RAISE EXCEPTION 'Failed to upsert user data: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create optimized function to append questions without full replace
CREATE OR REPLACE FUNCTION append_user_questions(
    p_user_id UUID,
    p_questions JSONB
)
RETURNS JSONB AS $$
DECLARE
    existing_data JSONB;
    new_data JSONB;
    existing_questions JSONB;
    result user_data;
BEGIN
    -- Get existing questions
    SELECT data INTO existing_data
    FROM user_data
    WHERE user_id = p_user_id AND data_type = 'sat_master_log_questions';
    
    -- If no existing data, initialize as empty array
    IF existing_data IS NULL THEN
        existing_questions := '[]'::JSONB;
    ELSE
        existing_questions := existing_data;
    END IF;
    
    -- Append new questions to existing ones
    new_data := existing_questions || p_questions;
    
    -- Upsert the combined data
    INSERT INTO user_data (user_id, data_type, data)
    VALUES (p_user_id, 'sat_master_log_questions', new_data)
    ON CONFLICT (user_id, data_type)
    DO UPDATE SET 
        data = new_data,
        updated_at = NOW()
    RETURNING * INTO result;
    
    RETURN result.data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user data by type
CREATE OR REPLACE FUNCTION get_user_data(
    p_user_id UUID,
    p_data_type VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT data INTO result
    FROM user_data
    WHERE user_id = p_user_id AND data_type = p_data_type;
    
    RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete user data by type
CREATE OR REPLACE FUNCTION delete_user_data(
    p_user_id UUID,
    p_data_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_data
    WHERE user_id = p_user_id AND data_type = p_data_type;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all user data types
CREATE OR REPLACE FUNCTION get_all_user_data(p_user_id UUID)
RETURNS TABLE(data_type VARCHAR(50), data JSONB, updated_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY
    SELECT ud.data_type, ud.data, ud.updated_at
    FROM user_data ud
    WHERE ud.user_id = p_user_id
    ORDER BY ud.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_data TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_data(UUID, VARCHAR(50), JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION append_user_questions(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_data(UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data(UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_user_data(UUID) TO authenticated;

-- Create a safer upsert function for large data
CREATE OR REPLACE FUNCTION safe_upsert_user_data(
    p_user_id UUID,
    p_data_type VARCHAR(50),
    p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    existing_data JSONB;
    merged_data JSONB;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'user_id cannot be null');
    END IF;
    
    IF p_data_type IS NULL OR p_data_type = '' THEN
        RETURN jsonb_build_object('error', 'data_type cannot be null or empty');
    END IF;
    
    IF p_data IS NULL THEN
        RETURN jsonb_build_object('error', 'data cannot be null');
    END IF;
    
    -- Get existing data first
    SELECT data INTO existing_data
    FROM user_data
    WHERE user_id = p_user_id AND data_type = p_data_type;
    
    -- If no existing data, use the new data directly
    IF existing_data IS NULL THEN
        merged_data := p_data;
    ELSE
        -- For arrays, merge them; for objects, merge them; for other types, replace
        IF jsonb_typeof(p_data) = 'array' AND jsonb_typeof(existing_data) = 'array' THEN
            merged_data := existing_data || p_data;
        ELSIF jsonb_typeof(p_data) = 'object' AND jsonb_typeof(existing_data) = 'object' THEN
            merged_data := existing_data || p_data;
        ELSE
            merged_data := p_data;
        END IF;
    END IF;
    
    -- Check size limits
    IF jsonb_array_length(merged_data) > 5000 THEN
        RETURN jsonb_build_object('error', 'Data too large after merge: maximum 5,000 items allowed');
    END IF;
    
    -- Perform the upsert
    INSERT INTO user_data (user_id, data_type, data)
    VALUES (p_user_id, p_data_type, merged_data)
    ON CONFLICT (user_id, data_type)
    DO UPDATE SET 
        data = merged_data,
        updated_at = NOW();
    
    RETURN jsonb_build_object('success', true, 'data', merged_data);
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM, 'details', 'Database operation failed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission for the new function
GRANT EXECUTE ON FUNCTION safe_upsert_user_data(UUID, VARCHAR(50), JSONB) TO authenticated;

-- User-specific questions table (replaces JSONB storage for performance)
CREATE TABLE IF NOT EXISTS user_questions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    origin TEXT DEFAULT 'user',
    section TEXT,
    domain TEXT,
    questionType TEXT,
    passageText TEXT,
    passageImage TEXT,
    questionText TEXT,
    answerChoices JSONB,
    correctAnswer TEXT,
    explanation TEXT,
    explanationImage TEXT,
    difficulty TEXT,
    hidden BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast user question queries
CREATE INDEX IF NOT EXISTS idx_user_questions_user_id ON user_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_questions_created ON user_questions(user_id, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_user_questions_section ON user_questions(user_id, section);

-- RLS for user questions
ALTER TABLE user_questions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own questions
CREATE POLICY "Users can view own questions" ON user_questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions" ON user_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON user_questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON user_questions
    FOR DELETE USING (auth.uid() = user_id);

-- Global catalog questions (visible to all users)
CREATE TABLE IF NOT EXISTS catalog_questions (
    id TEXT PRIMARY KEY,
    origin TEXT DEFAULT 'catalog',
    section TEXT,
    domain TEXT,
    questionType TEXT,
    passageText TEXT,
    passageImage TEXT,
    questionText TEXT,
    answerChoices JSONB,
    correctAnswer TEXT,
    explanation TEXT,
    explanationImage TEXT,
    difficulty TEXT,
    hidden BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_catalog_questions_lastUpdated ON catalog_questions(lastUpdated DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_questions_section ON catalog_questions(section);

-- RLS
ALTER TABLE catalog_questions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view catalog
CREATE POLICY "catalog select for all authenticated" ON catalog_questions
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (client gate handles admin)
CREATE POLICY "catalog write for authenticated" ON catalog_questions
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Trigger to update lastUpdated
CREATE OR REPLACE FUNCTION update_catalog_lastUpdated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lastUpdated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_catalog_lastUpdated ON catalog_questions;
CREATE TRIGGER trg_update_catalog_lastUpdated
BEFORE UPDATE ON catalog_questions
FOR EACH ROW EXECUTE FUNCTION update_catalog_lastUpdated();

-- Migration function to move JSONB questions to individual rows
CREATE OR REPLACE FUNCTION migrate_jsonb_questions_to_table()
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    question_record JSONB;
    migrated_count INTEGER := 0;
BEGIN
    -- Loop through all users with questions data
    FOR user_record IN 
        SELECT user_id, data 
        FROM user_data 
        WHERE data_type = 'sat_master_log_questions' 
        AND jsonb_array_length(data) > 0
    LOOP
        -- Loop through each question in the JSONB array
        FOR question_record IN 
            SELECT jsonb_array_elements(user_record.data) as question
        LOOP
            -- Insert question into user_questions table
            INSERT INTO user_questions (
                id, user_id, origin, section, domain, questionType,
                passageText, passageImage, questionText, answerChoices,
                correctAnswer, explanation, explanationImage, difficulty,
                hidden, createdAt, lastUpdated
            ) VALUES (
                COALESCE(question_record.question->>'id', gen_random_uuid()::text),
                user_record.user_id,
                COALESCE(question_record.question->>'origin', 'user'),
                question_record.question->>'section',
                question_record.question->>'domain',
                question_record.question->>'questionType',
                question_record.question->>'passageText',
                question_record.question->>'passageImage',
                question_record.question->>'questionText',
                question_record.question->'answerChoices',
                question_record.question->>'correctAnswer',
                question_record.question->>'explanation',
                question_record.question->>'explanationImage',
                question_record.question->>'difficulty',
                COALESCE((question_record.question->>'hidden')::boolean, false),
                COALESCE((question_record.question->>'createdAt')::timestamp, NOW()),
                COALESCE((question_record.question->>'lastUpdated')::timestamp, NOW())
            ) ON CONFLICT (id) DO NOTHING; -- Skip duplicates
            
            migrated_count := migrated_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants for user questions table
GRANT SELECT, INSERT, UPDATE, DELETE ON user_questions TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_jsonb_questions_to_table() TO authenticated;

-- Grants for PostgREST roles
GRANT SELECT ON catalog_questions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON catalog_questions TO authenticated;

-- Admins table: list of user_ids that are admins
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
-- Do not expose admin membership list by default
DROP POLICY IF EXISTS "admins select" ON public.admins;
DROP POLICY IF EXISTS "admins modify" ON public.admins;
-- (Optional) Allow admins to see their own membership
CREATE POLICY "admins self select" ON public.admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Tighten catalog write policies to admins only
DROP POLICY IF EXISTS "catalog write for authenticated" ON public.catalog_questions;

CREATE POLICY "catalog insert for admins" ON public.catalog_questions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "catalog update for admins" ON public.catalog_questions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "catalog delete for admins" ON public.catalog_questions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));