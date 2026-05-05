-- ============================================================
-- LangMaster — Test Seed Data (course_modules + courses)
-- ============================================================
-- Run AFTER cleanup.sql.
-- This seeds:
--   1. Courses (upsert — safe to re-run)
--   2. Course curriculum (course_modules) for each course
-- User accounts (admin, teacher, student) are created via
-- Supabase Auth in the dashboard or through the app signup flow.
-- ============================================================


-- ── 1. Courses ───────────────────────────────────────────────
-- Clear and re-seed courses cleanly
truncate public.course_modules cascade;
delete from public.courses;

insert into public.courses
  (id, name, description, language, level, duration_weeks, sessions_per_week, max_group_size, price_usd, is_active)
values
  (
    'a1000000-0000-0000-0000-000000000001',
    'English for Beginners',
    'Build your English foundation with vocabulary, grammar, and conversational skills. Perfect for absolute beginners who want to start speaking from day one.',
    'English', 'beginner', 12, 3, 3, 149.00, true
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Business English',
    'Master professional English for meetings, emails, negotiations, and presentations. Accelerate your international career.',
    'English', 'intermediate', 8, 3, 3, 199.00, true
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Advanced English Fluency',
    'Achieve native-like fluency through intensive conversation practice, advanced grammar, and cultural nuance.',
    'English', 'advanced', 16, 3, 2, 249.00, true
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Spanish Basics',
    'Learn Spanish from scratch with live conversation practice. Fun, interactive sessions built around real-life scenarios.',
    'Spanish', 'beginner', 12, 3, 3, 149.00, true
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'French Immersion',
    'Immersive French learning with a focus on speaking and listening skills. Go from tourist phrases to real conversations.',
    'French', 'intermediate', 10, 2, 3, 179.00, true
  );


-- ── 2. Course Modules (Curriculum per week) ──────────────────

-- ── English for Beginners (12 weeks, 3x/week = 36 sessions) ──
insert into public.course_modules (course_id, week_number, title, topics) values
('a1000000-0000-0000-0000-000000000001', 1,  'Hello World',               ARRAY['Greetings & introductions', 'Numbers 1–20', 'Alphabet and pronunciation']),
('a1000000-0000-0000-0000-000000000001', 2,  'Everyday Objects',          ARRAY['Common nouns', 'This / That / These / Those', 'Colours and shapes']),
('a1000000-0000-0000-0000-000000000001', 3,  'My Family',                 ARRAY['Family vocabulary', 'Possessive pronouns', 'Simple present: to be']),
('a1000000-0000-0000-0000-000000000001', 4,  'Food & Drink',              ARRAY['Food vocabulary', 'Ordering in a restaurant', 'Like / Don''t like']),
('a1000000-0000-0000-0000-000000000001', 5,  'Daily Routines',            ARRAY['Time expressions', 'Simple present tense', 'Adverbs of frequency']),
('a1000000-0000-0000-0000-000000000001', 6,  'Getting Around',            ARRAY['Directions vocabulary', 'Prepositions of place', 'Asking for help']),
('a1000000-0000-0000-0000-000000000001', 7,  'Shopping',                  ARRAY['Prices and money', 'Can I / How much is…?', 'Colours & sizes']),
('a1000000-0000-0000-0000-000000000001', 8,  'Health & Body',             ARRAY['Body parts', 'I have a…', 'At the doctor''s']),
('a1000000-0000-0000-0000-000000000001', 9,  'Travel & Transport',        ARRAY['Transport vocabulary', 'Buying tickets', 'Past simple: to be']),
('a1000000-0000-0000-0000-000000000001', 10, 'Weather & Seasons',         ARRAY['Weather expressions', 'Present continuous', 'Talking about plans']),
('a1000000-0000-0000-0000-000000000001', 11, 'Hobbies & Free Time',       ARRAY['Leisure vocabulary', 'Like / Love / Hate + -ing', 'Asking questions']),
('a1000000-0000-0000-0000-000000000001', 12, 'Review & Graduation',       ARRAY['Full conversation review', 'Self-introduction speech', 'Learner reflections']);

-- ── Business English (8 weeks, 3x/week = 24 sessions) ──
insert into public.course_modules (course_id, week_number, title, topics) values
('a1000000-0000-0000-0000-000000000002', 1, 'Professional Introductions', ARRAY['Elevator pitches', 'Business card etiquette', 'Formal vs informal register']),
('a1000000-0000-0000-0000-000000000002', 2, 'Meetings & Discussions',     ARRAY['Meeting phrases', 'Agreeing & disagreeing politely', 'Taking minutes']),
('a1000000-0000-0000-0000-000000000002', 3, 'Presentations',              ARRAY['Structuring a presentation', 'Signposting language', 'Handling Q&A']),
('a1000000-0000-0000-0000-000000000002', 4, 'Emails & Reports',           ARRAY['Formal email templates', 'Report writing', 'Subject lines & tone']),
('a1000000-0000-0000-0000-000000000002', 5, 'Negotiations',               ARRAY['Negotiation phrases', 'Making offers', 'Reaching agreement']),
('a1000000-0000-0000-0000-000000000002', 6, 'Telephoning & Video Calls',  ARRAY['Phone etiquette', 'Clarifying & confirming', 'Technical difficulties']),
('a1000000-0000-0000-0000-000000000002', 7, 'Networking',                 ARRAY['Small talk', 'Conference language', 'Follow-up emails']),
('a1000000-0000-0000-0000-000000000002', 8, 'Capstone: Full Business Sim',ARRAY['Mock board meeting', 'Pitch presentation', 'Performance review roleplay']);

-- ── Advanced English Fluency (16 weeks, 3x/week = 48 sessions) ──
insert into public.course_modules (course_id, week_number, title, topics) values
('a1000000-0000-0000-0000-000000000003', 1,  'Nuance & Register',         ARRAY['Formal vs casual register', 'Hedging language', 'Understatement']),
('a1000000-0000-0000-0000-000000000003', 2,  'Idioms & Phrasal Verbs',    ARRAY['Common idioms', 'Phrasal verbs in context', 'Slang awareness']),
('a1000000-0000-0000-0000-000000000003', 3,  'Debate & Argumentation',    ARRAY['Structuring arguments', 'Counter-arguments', 'Hedging & boosting']),
('a1000000-0000-0000-0000-000000000003', 4,  'Storytelling',              ARRAY['Narrative tenses', 'Discourse markers', 'Adding drama']),
('a1000000-0000-0000-0000-000000000003', 5,  'Advanced Grammar I',        ARRAY['Inversion', 'Cleft sentences', 'Subjunctive']),
('a1000000-0000-0000-0000-000000000003', 6,  'Advanced Grammar II',       ARRAY['Mixed conditionals', 'Wish / If only', 'Emphasis']),
('a1000000-0000-0000-0000-000000000003', 7,  'Culture & Humour',          ARRAY['British vs American English', 'Irony & sarcasm', 'Cultural references']),
('a1000000-0000-0000-0000-000000000003', 8,  'News & Media',              ARRAY['Discussing current events', 'Media vocabulary', 'Bias & perspective']),
('a1000000-0000-0000-0000-000000000003', 9,  'Academic Writing',          ARRAY['Essay structure', 'Cohesion devices', 'Formal vocabulary']),
('a1000000-0000-0000-0000-000000000003', 10, 'Literature & Poetry',       ARRAY['Analysing prose', 'Poetic devices', 'Discussion & interpretation']),
('a1000000-0000-0000-0000-000000000003', 11, 'Speeches & Rhetoric',       ARRAY['Rhetorical devices', 'Tone & pace', 'Famous speeches']),
('a1000000-0000-0000-0000-000000000003', 12, 'Interview & Career',        ARRAY['Competency-based interviews', 'Salary negotiation', 'Body language']),
('a1000000-0000-0000-0000-000000000003', 13, 'Philosophy & Ethics',       ARRAY['Abstract discussion', 'Moral dilemmas', 'Conceding points']),
('a1000000-0000-0000-0000-000000000003', 14, 'Science & Technology',      ARRAY['Tech vocabulary', 'Explaining complex ideas simply', 'Predictions']),
('a1000000-0000-0000-0000-000000000003', 15, 'Free Conversation',         ARRAY['Student-chosen topics', 'Peer feedback', 'Fluency drilling']),
('a1000000-0000-0000-0000-000000000003', 16, 'Graduation & Assessment',   ARRAY['Final presentation', 'Peer evaluation', 'Portfolio review']);

-- ── Spanish Basics (12 weeks, 3x/week = 36 sessions) ──
insert into public.course_modules (course_id, week_number, title, topics) values
('a1000000-0000-0000-0000-000000000004', 1,  'Hola!',                     ARRAY['Greetings', 'Numbers 1–20', 'Gender of nouns']),
('a1000000-0000-0000-0000-000000000004', 2,  'Mi Familia',                ARRAY['Family members', 'Possessives', 'Ser vs Estar intro']),
('a1000000-0000-0000-0000-000000000004', 3,  'La Comida',                 ARRAY['Food vocabulary', 'Me gusta / No me gusta', 'Ordering in a café']),
('a1000000-0000-0000-0000-000000000004', 4,  'La Ciudad',                 ARRAY['Places in a city', 'Directions', 'Asking where things are']),
('a1000000-0000-0000-0000-000000000004', 5,  'Las Compras',               ARRAY['Shopping vocabulary', 'Prices', 'Quiero / Quisiera']),
('a1000000-0000-0000-0000-000000000004', 6,  'El Tiempo Libre',           ARRAY['Hobbies', 'Present tense -ar verbs', 'Talking about weekends']),
('a1000000-0000-0000-0000-000000000004', 7,  'La Salud',                  ARRAY['Body parts', 'Me duele…', 'At the pharmacy']),
('a1000000-0000-0000-0000-000000000004', 8,  'Los Viajes',                ARRAY['Transport', 'At the airport', 'Preterite tense basics']),
('a1000000-0000-0000-0000-000000000004', 9,  'El Trabajo',                ARRAY['Professions', 'Daily routines', 'Reflexive verbs']),
('a1000000-0000-0000-0000-000000000004', 10, 'Las Fiestas',               ARRAY['Celebrations', 'Invitations', 'Future tense basics']),
('a1000000-0000-0000-0000-000000000004', 11, 'La Naturaleza',             ARRAY['Environment vocabulary', 'Comparatives', 'Imperfect tense intro']),
('a1000000-0000-0000-0000-000000000004', 12, 'Repaso Final',              ARRAY['Full conversation roleplay', 'Self-assessment', 'Next steps in Spanish']);

-- ── French Immersion (10 weeks, 2x/week = 20 sessions) ──
insert into public.course_modules (course_id, week_number, title, topics) values
('a1000000-0000-0000-0000-000000000005', 1,  'Bonjour!',                  ARRAY['Greetings & farewells', 'Basic phrases', 'Tu vs Vous']),
('a1000000-0000-0000-0000-000000000005', 2,  'Ma Vie Quotidienne',        ARRAY['Daily routines', 'Present tense -er verbs', 'Time expressions']),
('a1000000-0000-0000-0000-000000000005', 3,  'La Nourriture',             ARRAY['Food vocabulary', 'At the market', 'Partitive article: du / de la']),
('a1000000-0000-0000-0000-000000000005', 4,  'En Ville',                  ARRAY['City places', 'Asking for directions', 'Prepositions of place']),
('a1000000-0000-0000-0000-000000000005', 5,  'Les Loisirs',               ARRAY['Hobbies', 'Vouloir / Pouvoir', 'Making plans']),
('a1000000-0000-0000-0000-000000000005', 6,  'Passé Composé',             ARRAY['Past tense with avoir', 'Past tense with être', 'Common irregular verbs']),
('a1000000-0000-0000-0000-000000000005', 7,  'Voyager en France',         ARRAY['Travel vocabulary', 'At the station / airport', 'Hotel phrases']),
('a1000000-0000-0000-0000-000000000005', 8,  'La Santé',                  ARRAY['Body vocabulary', 'At the doctor''s', 'Giving advice with Devoir']),
('a1000000-0000-0000-0000-000000000005', 9,  'La Culture Française',      ARRAY['French culture & customs', 'Cinema & art discussion', 'Opinion phrases']),
('a1000000-0000-0000-0000-000000000005', 10, 'Bilan Final',               ARRAY['Full immersion roleplay', 'Oral exam simulation', 'What next in French?']);


-- ============================================================
-- ✅ Seed complete.
-- Next steps:
--   1. Create Admin user via Supabase Auth (email/pass)
--   2. Run setup-admin.sql to set role = 'admin'
--   3. Register a Teacher account via /register
--   4. Register a Student account via /register
--   5. Follow the manual testing guide.
-- ============================================================
