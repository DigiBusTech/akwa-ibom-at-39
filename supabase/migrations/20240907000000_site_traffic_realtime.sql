-- ============================================================================
-- Migration: 20240907000000_site_traffic_realtime.sql
-- Real-time Site Traffic Telemetry & Real-time Subscriptions Setup
-- ============================================================================

-- 1. Create site_traffic Table
CREATE TABLE IF NOT EXISTS site_traffic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    country_code VARCHAR(10) NOT NULL DEFAULT 'NG',
    page_route VARCHAR(255) NOT NULL DEFAULT '/',
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id VARCHAR(100)
);

-- 2. Indexes for High-Velocity Telemetry Queries
CREATE INDEX IF NOT EXISTS idx_site_traffic_visited_at ON site_traffic(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_traffic_session ON site_traffic(session_id, page_route);
CREATE INDEX IF NOT EXISTS idx_site_traffic_country ON site_traffic(country_code);

-- 3. Row Level Security
ALTER TABLE site_traffic ENABLE ROW LEVEL SECURITY;

-- Allow insert from edge middleware / api routes
CREATE POLICY "Allow public insert to site_traffic" 
    ON site_traffic FOR INSERT 
    WITH CHECK (true);

-- Allow reading traffic data
CREATE POLICY "Allow public select on site_traffic" 
    ON site_traffic FOR SELECT 
    USING (true);

-- 4. Enable Realtime Publications for Command Center
ALTER TABLE site_traffic REPLICA IDENTITY FULL;
ALTER TABLE quiz_submissions REPLICA IDENTITY FULL;

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_traffic;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE quiz_submissions;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;
