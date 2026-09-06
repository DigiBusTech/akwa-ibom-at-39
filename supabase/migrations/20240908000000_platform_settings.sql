-- 7. Platform Settings Table (Celebration confetti/fireworks scheduler)
CREATE TABLE IF NOT EXISTS platform_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    confetti_start_time TIMESTAMPTZ,
    confetti_end_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Public can read platform settings
CREATE POLICY "Allow public select platform_settings"
    ON platform_settings FOR SELECT
    USING (true);

-- Authenticated / Service Role can insert/update platform settings
CREATE POLICY "Allow admin all platform_settings"
    ON platform_settings FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert default row 1
INSERT INTO platform_settings (id, confetti_start_time, confetti_end_time)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
