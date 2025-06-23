-- JWT configuration
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgjwt SCHEMA extensions;

-- Function to check JWT
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.sub', TRUE), ''),
      (NULLIF(current_setting('request.jwt.claims', TRUE), '')::JSONB ->> 'sub')
    )::UUID
$$;

-- Function to get JWT role
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.role', TRUE), ''),
      (NULLIF(current_setting('request.jwt.claims', TRUE), '')::JSONB ->> 'role')
    )::TEXT
$$;

-- Function to get JWT email
CREATE OR REPLACE FUNCTION auth.email()
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.email', TRUE), ''),
      (NULLIF(current_setting('request.jwt.claims', TRUE), '')::JSONB ->> 'email')
    )::TEXT
$$; 