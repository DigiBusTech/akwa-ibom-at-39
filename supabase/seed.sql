-- ============================================================================
-- Akwa Ibom @ 39 Anniversary Trivia - Production Seed Data (15 Questions)
-- Idempotent insertion using categories, questions, and options
-- ============================================================================

DO $$
DECLARE
    cat_food UUID;
    cat_lga UUID;
    cat_culture UUID;
    cat_leaders UUID;
    cat_landmarks UUID;

    q_id UUID;
BEGIN
    -- 1. Insert Categories
    INSERT INTO categories (name, slug)
    VALUES ('Food & Cuisine', 'food-cuisine')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_food;

    INSERT INTO categories (name, slug)
    VALUES ('Local Government Areas (LGAs) & Geography', 'lgas-geography')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_lga;

    INSERT INTO categories (name, slug)
    VALUES ('Languages & Cultural Heritage', 'languages-cultural-heritage')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_culture;

    INSERT INTO categories (name, slug)
    VALUES ('Past Leaders & History', 'past-leaders-history')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_leaders;

    INSERT INTO categories (name, slug)
    VALUES ('Landmarks & State Milestones', 'landmarks-state-milestones')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_landmarks;

    -- ========================================================================
    -- CATEGORY 1: Food & Cuisine
    -- ========================================================================
    
    -- Q1: Ekpang Nkukwo
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_food, 
        'Which traditional Akwa Ibom delicacy is prepared primarily using grated water yam wrapped in leaves?',
        'Ekpang Nkukwo is a cherished traditional delicacy made from grated cocoyam or water yam wrapped carefully in cocoyam or sweet potato leaves and simmered with palm oil and rich seafood.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Afang Soup', FALSE),
        (q_id, 'Ekpang Nkukwo', TRUE),
        (q_id, 'Edikang Ikong', FALSE),
        (q_id, 'Asa Iwa', FALSE);

    -- Q2: Odusa / Piper guineense
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_food, 
        'Which indigenous aromatic leaf, botanically known as Piper guineense, is commonly called "Odusa" in local soups?',
        'Piper guineense is commonly called Uziza or Odusa and provides a pungent, fragrant aroma in native culinary preparations.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Uziza / Odusa', TRUE),
        (q_id, 'Utasi', FALSE),
        (q_id, 'Atama', FALSE),
        (q_id, 'Editan', FALSE);

    -- Q3: Atama Soup
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_food, 
        'What combination of main leaves gives the famous Akwa Ibom "Atama Soup" its signature aroma and texture?',
        'Atama soup gets its legendary rich texture and bouquet from fresh shredded atama leaves steeped in fresh palm fruit pulp extract (Abak).'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Waterleaf and Okra', FALSE),
        (q_id, 'Atama leaf and Palm Fruit Extract (Abak)', TRUE),
        (q_id, 'Bitterleaf and Egusi', FALSE),
        (q_id, 'Scent leaf and Spinach', FALSE);

    -- ========================================================================
    -- CATEGORY 2: Local Government Areas (LGAs) & Geography
    -- ========================================================================

    -- Q4: 31 LGAs
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_lga, 
        'How many Local Government Areas make up Akwa Ibom State?',
        'Akwa Ibom State comprises 31 Local Government Areas across Uyo, Ikot Ekpene, and Eket Senatorial Districts.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, '27', FALSE),
        (q_id, '31', TRUE),
        (q_id, '36', FALSE),
        (q_id, '25', FALSE);

    -- Q5: Ibeno
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_lga, 
        'Which coastal Local Government Area in Akwa Ibom houses major offshore oil operations and the longest coastline in Nigeria?',
        'Ibeno LGA features the longest open sand beach coastline in West Africa, stretching over 30 kilometers along the Atlantic.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Ikot Abasi', FALSE),
        (q_id, 'Ibeno', TRUE),
        (q_id, 'Oron', FALSE),
        (q_id, 'Eastern Obolo', FALSE);

    -- Q6: Amalgamation House - Ikot Abasi
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_lga, 
        'In which LGA is the historic "Amalgamation House"—where Lord Lugard signed the 1914 amalgamation of Nigeria—located?',
        'The historic Amalgamation House is located in Ikot Abasi LGA along the Imo River estuary.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Uyo', FALSE),
        (q_id, 'Ikot Abasi', TRUE),
        (q_id, 'Ikot Ekpene', FALSE),
        (q_id, 'Eket', FALSE);

    -- ========================================================================
    -- CATEGORY 3: Languages & Cultural Heritage
    -- ========================================================================

    -- Q7: Dakkada
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_culture, 
        'What does the celebrated Akwa Ibom socio-cultural philosophy "Dakkada" translate to in English?',
        '"Dakkada" translates to "Arise" or "Stand Up", embodying pride, self-reliance, and faith in divine destiny.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Move Forward', FALSE),
        (q_id, 'Arise and Shine / Arise', TRUE),
        (q_id, 'Unity is Strength', FALSE),
        (q_id, 'Peace and Progress', FALSE);

    -- Q8: Annang in Ikot Ekpene
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_culture, 
        'Which major ethnic group and dialect is predominantly native to the Ikot Ekpene Senatorial District?',
        'The Annang people are native to Ikot Ekpene Senatorial District, famous for woodcarving, raffia craftsmanship, and rich cultural traditions.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Annang', TRUE),
        (q_id, 'Oron', FALSE),
        (q_id, 'Eket', FALSE),
        (q_id, 'Ibeno', FALSE);

    -- Q9: Oron Council
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_culture, 
        'Which ancestral group in Akwa Ibom is traditionally governed by the Ohiokim Oron council of elders?',
        'The Oron (Oro) nation of Akwa Ibom has its venerable cultural leadership rooted in the Ohiokim Oron council.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Annang', FALSE),
        (q_id, 'Oron (Oro)', TRUE),
        (q_id, 'Ekid', FALSE),
        (q_id, 'Ibiono', FALSE);

    -- ========================================================================
    -- CATEGORY 4: Past Leaders & History
    -- ========================================================================

    -- Q10: Col. Tunde Ogbeha
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_leaders, 
        'Who was appointed as the first Military Administrator of Akwa Ibom State upon its creation in September 1987?',
        'Col. Tunde Ogbeha was appointed as the pioneer Military Administrator of the new state in September 1987.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Col. Tunde Ogbeha', TRUE),
        (q_id, 'Col. Godwin Abbe', FALSE),
        (q_id, 'Obong Victor Attah', FALSE),
        (q_id, 'Wing Commander Idongesit Nkanga', FALSE);

    -- Q11: Obong Akpan Isemin
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_leaders, 
        'Who served as the first democratically elected civilian Governor of Akwa Ibom State in the Third Republic (1992)?',
        'Obong Akpan Isemin served as the first civilian executive governor during the Nigerian Third Republic between 1992 and 1993.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Obong Akpan Isemin', TRUE),
        (q_id, 'Obong Victor Attah', FALSE),
        (q_id, 'Chief Godswill Akpabio', FALSE),
        (q_id, 'Dr. Clement Isong', FALSE);

    -- Q12: Udom Emmanuel & Ibom Air
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_leaders, 
        'Which former Governor is credited with establishing Ibom Air and initiating the Victor Attah International Airport expansion?',
        'Governor Udom Emmanuel established Ibom Air in 2019 and led major aviation infrastructure expansions including the new smart terminal.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Chief Godswill Akpabio', FALSE),
        (q_id, 'Mr. Udom Emmanuel', TRUE),
        (q_id, 'Pastor Umo Eno', FALSE),
        (q_id, 'Obong Victor Attah', FALSE);

    -- ========================================================================
    -- CATEGORY 5: Landmarks & State Milestones
    -- ========================================================================

    -- Q13: State Creation Date
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_landmarks, 
        'On what exact date was Akwa Ibom State created from the former Cross River State?',
        'Akwa Ibom State was created on September 23, 1987, by General Ibrahim Babangida.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'September 23, 1987', TRUE),
        (q_id, 'August 27, 1991', FALSE),
        (q_id, 'May 27, 1967', FALSE),
        (q_id, 'October 1, 1960', FALSE);

    -- Q14: Ibom Air
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_landmarks, 
        'What state-owned commercial airline launched by Akwa Ibom State is the first of its kind in Nigeria?',
        'Ibom Air is the only state-owned commercial airline in Nigeria, renowned for industry-leading on-time performance.'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Anchor Air', FALSE),
        (q_id, 'Ibom Air', TRUE),
        (q_id, 'Dakkada Airlines', FALSE),
        (q_id, 'Orange Air', FALSE);

    -- Q15: Nest of Champions
    INSERT INTO questions (category_id, question_text, explanation)
    VALUES (
        cat_landmarks, 
        'What modern 30,000-capacity sports facility in Uyo is popularly nicknamed the "Nest of Champions"?',
        'The Godswill Akpabio International Stadium in Uyo is internationally acclaimed and nicknamed the "Nest of Champions".'
    ) RETURNING id INTO q_id;

    INSERT INTO options (question_id, option_text, is_correct) VALUES
        (q_id, 'Uyo Township Stadium', FALSE),
        (q_id, 'Godswill Akpabio International Stadium', TRUE),
        (q_id, 'Eket Township Stadium', FALSE),
        (q_id, 'Ikot Ekpene Sports Complex', FALSE);

END $$;
