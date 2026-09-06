-- 6. Daily Letters Table ("A Letter to Akwa Ibom" Statehood Countdown)
CREATE TABLE IF NOT EXISTS daily_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_number INTEGER NOT NULL UNIQUE,
    publish_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_letters ENABLE ROW LEVEL SECURITY;

-- Public can read all published letters
CREATE POLICY "Public can view daily letters"
    ON daily_letters FOR SELECT
    USING (true);

-- Authenticated / Admin can insert, update, delete
CREATE POLICY "Admin full access on daily letters"
    ON daily_letters FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for fast lookup by publish_date and day_number
CREATE INDEX IF NOT EXISTS idx_daily_letters_date ON daily_letters(publish_date);
CREATE INDEX IF NOT EXISTS idx_daily_letters_day ON daily_letters(day_number);

-- Seed Initial Jubilee Countdown Letters
INSERT INTO daily_letters (day_number, publish_date, title, content)
VALUES
(1, '2026-09-01', 'The Dawn of Promise: Remembering September 23, 1987', 'Thirty-nine years ago, the dream of our founding fathers crystallized into reality. Akwa Ibom State was carved out of the former Cross River State, born from resilient prayer, visionary leadership, and an unshakeable belief that our people possess the destiny of greatness. As we step into this 39th anniversary season, let every citizen from the sandy shores of Ibeno to the rolling hills of Ini reflect on how far our faith, unity, and industrious spirit have carried us. We are not just a state; we are a beacon of peace, hospitality, and boundless opportunity.')
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO daily_letters (day_number, publish_date, title, content)
VALUES
(2, '2026-09-02', 'The Soul of Our Soil: Honoring the Hands That Feed Us', 'From the fertile cassava fields of Abak and the rich oil palm groves of Essien Udim to the flourishing fisheries along the Atlantic coast, the true wealth of Akwa Ibom has always resided in the dignity of our labor. Today, under the ARISE Agenda, agricultural transformation is placing food on every table and empowering our rural communities. Let us celebrate the farmers, traders, and artisans whose sweat nourishes our heritage every single morning.')
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO daily_letters (day_number, publish_date, title, content)
VALUES
(3, '2026-09-03', 'A Tapestry of Culture: 31 LGAs, One Indivisible Family', 'Whether we speak Ibibio, Annang, Oron, Obolo, or Ibeno, our heartbeat is identical. Our traditions, from the revered Ekpe masquerade to the warmth of our culinary mastery — Afang, Edikang Ikong, and Ekpang Nkukwo — are admired across the globe. Our cultural heritage is not a relic of the past; it is the living compass guiding our youth toward honor, discipline, and communal love.')
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO daily_letters (day_number, publish_date, title, content)
VALUES
(4, '2026-09-04', 'The Global Diaspora: Ambassadors of the Land of Promise', 'To our sons and daughters in the United Kingdom, the United States, Canada, Benin Republic, South Africa, and across the globe: distance cannot diminish your Akwa Ibom blood. Through your enterprise, intellectual contributions, and philanthropic remittances, you elevate our state on the world map. You remain an integral pillar of our celebration. Akwa Ibom is proud of you, and our doors are always open to welcome your ideas and investments back home.')
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO daily_letters (day_number, publish_date, title, content)
VALUES
(5, '2026-09-05', 'The Horizon of Peace: Safeguarding Our Most Precious Asset', 'In a rapidly changing world, Akwa Ibom stands out as an oasis of security, harmony, and political stability in Nigeria. Peace is not an accident; it is the deliberate collective covenant of every citizen, traditional institution, and religious leader. As we approach September 23rd, let us recommit to guarding this peace with vigilance, supporting one another, and fostering an environment where innovation and enterprise thrive.')
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO daily_letters (day_number, publish_date, title, content)
VALUES
(6, '2026-09-06', '39 Shades of Gratitude: The Journey Continues', 'Today, on this milestone countdown, we count our blessings as a people. We remember the past governors and leaders who laid foundational stones of infrastructure, education, and aviation. Today, the ARISE Agenda builds upon this enduring legacy, connecting rural development with urban excellence. Let every Akwa Ibomite wear our colors with pride, hold their head high, and boldly proclaim: We are Akwa Ibom, Land of Promise, and our best days are right ahead!')
ON CONFLICT (day_number) DO NOTHING;
