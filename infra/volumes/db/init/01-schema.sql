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
    INSERT INTO user_data (user_id, data_type, data)
    VALUES (p_user_id, p_data_type, p_data)
    ON CONFLICT (user_id, data_type)
    DO UPDATE SET 
        data = EXCLUDED.data,
        updated_at = NOW()
    RETURNING * INTO result;
    
    RETURN result;
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
GRANT EXECUTE ON FUNCTION get_user_data(UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data(UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_user_data(UUID) TO authenticated; 