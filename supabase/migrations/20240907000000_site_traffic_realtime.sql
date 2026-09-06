-- ============================================================================
-- Migration: 20240907000000_site_traffic_realtime.sql
-- Real-time Site Traffic Device Telemetry, Atomic Route History & Subscriptions
-- ============================================================================

-- 1. Create or Upgrade site_traffic Table
CREATE TABLE IF NOT EXISTS site_traffic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(64) UNIQUE,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    country_code VARCHAR(10) NOT NULL DEFAULT 'NG',
    page_route VARCHAR(255) NOT NULL DEFAULT '/',
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_visits INTEGER NOT NULL DEFAULT 1,
    route_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    session_id VARCHAR(100)
);

-- Ensure all columns exist for existing tables
ALTER TABLE site_traffic ADD COLUMN IF NOT EXISTS device_id VARCHAR(64);
ALTER TABLE site_traffic ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE site_traffic ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 1;
ALTER TABLE site_traffic ADD COLUMN IF NOT EXISTS route_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE site_traffic ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

-- Backfill device_id for existing rows if null
UPDATE site_traffic
SET device_id = COALESCE(session_id, 'dev_' || REPLACE(id::text, '-', ''))
WHERE device_id IS NULL;

-- Remove duplicate rows per device_id, retaining only the latest record
DELETE FROM site_traffic a
WHERE a.id NOT IN (
    SELECT DISTINCT ON (device_id) id
    FROM site_traffic
    ORDER BY device_id, visited_at DESC
);

-- Enforce device_id NOT NULL and UNIQUE constraint
ALTER TABLE site_traffic ALTER COLUMN device_id SET NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'site_traffic_device_id_key'
    ) THEN
        ALTER TABLE site_traffic ADD CONSTRAINT site_traffic_device_id_key UNIQUE (device_id);
    END IF;
END $$;

-- 2. Indexes for High-Velocity Telemetry Queries
CREATE INDEX IF NOT EXISTS idx_site_traffic_visited_at ON site_traffic(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_traffic_device_id ON site_traffic(device_id);
CREATE INDEX IF NOT EXISTS idx_site_traffic_country ON site_traffic(country_code);

-- 3. Row Level Security Policies
ALTER TABLE site_traffic ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to site_traffic" ON site_traffic;
DROP POLICY IF EXISTS "Allow public update to site_traffic" ON site_traffic;
DROP POLICY IF EXISTS "Allow public select on site_traffic" ON site_traffic;

CREATE POLICY "Allow public insert to site_traffic" 
    ON site_traffic FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update to site_traffic" 
    ON site_traffic FOR UPDATE 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow public select on site_traffic" 
    ON site_traffic FOR SELECT 
    USING (true);

-- 4. High-Performance Atomic RPC Procedure for Edge Telemetry Tracking
-- Upserts a device record, updates the current route, increments total visits,
-- and prepends the visit to route_history (capped to the 25 most recent paths).
CREATE OR REPLACE FUNCTION record_traffic_visit(
    p_device_id VARCHAR,
    p_ip_address VARCHAR,
    p_country_code VARCHAR,
    p_page_route VARCHAR
) RETURNS VOID AS $$
DECLARE
    new_entry JSONB := jsonb_build_object(
        'route', p_page_route, 
        'timestamp', TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    );
BEGIN
    INSERT INTO site_traffic (
        device_id,
        ip_address,
        country_code,
        page_route,
        visited_at,
        first_seen_at,
        total_visits,
        route_history
    )
    VALUES (
        p_device_id,
        p_ip_address,
        p_country_code,
        p_page_route,
        NOW(),
        NOW(),
        1,
        jsonb_build_array(new_entry)
    )
    ON CONFLICT (device_id) DO UPDATE SET
        ip_address = EXCLUDED.ip_address,
        country_code = EXCLUDED.country_code,
        page_route = EXCLUDED.page_route,
        visited_at = NOW(),
        total_visits = COALESCE(site_traffic.total_visits, 1) + 1,
        route_history = (
            SELECT jsonb_agg(item)
            FROM (
                SELECT item
                FROM jsonb_array_elements(
                    jsonb_build_array(new_entry) || COALESCE(site_traffic.route_history, '[]'::jsonb)
                ) AS item
                LIMIT 25
            ) s
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION record_traffic_visit(VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO anon, authenticated, service_role;

-- 5. Enable Realtime Publications for Command Center
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

