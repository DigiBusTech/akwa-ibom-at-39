-- ============================================================================
-- Akwa Ibom @ 39 Anniversary Trivia & DP Generator App
-- Database Schema & Security Hardening Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Options Table (Holds choices and answer key)
CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Quiz Submissions Table (Leaderboard & Score Tracking)
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(50) NOT NULL,
    lga VARCHAR(50),
    score INT NOT NULL,
    total_questions INT NOT NULL,
    badge_title VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Birthday Wishes Ticker Table
CREATE TABLE IF NOT EXISTS birthday_wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name VARCHAR(25) NOT NULL,
    lga VARCHAR(50),
    wish_text VARCHAR(160) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_score ON quiz_submissions(score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birthday_wishes_approved ON birthday_wishes(is_approved, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_wishes ENABLE ROW LEVEL SECURITY;

-- Public can read categories & questions
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Questions" ON questions;
CREATE POLICY "Public Read Questions" ON questions FOR SELECT USING (true);

-- CRITICAL ZERO-CLIENT-TRUST: Public CANNOT query raw options table directly
-- Only service_role can select from options (or via the secure public view below)
DROP POLICY IF EXISTS "Service Role Read Options" ON options;
CREATE POLICY "Service Role Read Options" ON options FOR SELECT TO service_role USING (true);

-- Public can insert quiz submissions and wishes
DROP POLICY IF EXISTS "Public Insert Submissions" ON quiz_submissions;
CREATE POLICY "Public Insert Submissions" ON quiz_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Submissions" ON quiz_submissions;
CREATE POLICY "Public Read Submissions" ON quiz_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Wishes" ON birthday_wishes;
CREATE POLICY "Public Insert Wishes" ON birthday_wishes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Approved Wishes" ON birthday_wishes;
CREATE POLICY "Public Read Approved Wishes" ON birthday_wishes FOR SELECT USING (is_approved = true);

-- ============================================================================
-- SECURE PUBLIC VIEW (Omits `is_correct` column to prevent client bundle cheating)
-- ============================================================================
CREATE OR REPLACE VIEW public_quiz_options AS
SELECT 
    id, 
    question_id, 
    option_text 
FROM options;

-- Grant select on view to anon and authenticated roles
GRANT SELECT ON public_quiz_options TO anon, authenticated;

-- ============================================================================
-- RPC FUNCTION FOR SECURE SERVER-SIDE ANSWER EVALUATION
-- ============================================================================
CREATE OR REPLACE FUNCTION evaluate_quiz_submission(
    p_answers JSONB -- Format: [{"question_id": "UUID", "selected_option_id": "UUID"}]
)
RETURNS TABLE (
    calculated_score INT,
    total_questions INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_score INT := 0;
    v_total INT := 0;
    elem JSONB;
BEGIN
    FOR elem IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_total := v_total + 1;
        IF EXISTS (
            SELECT 1 FROM options 
            WHERE id = (elem->>'selected_option_id')::UUID 
            AND question_id = (elem->>'question_id')::UUID 
            AND is_correct = TRUE
        ) THEN
            v_score := v_score + 1;
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_score, v_total;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION evaluate_quiz_submission(JSONB) TO anon, authenticated, service_role;
