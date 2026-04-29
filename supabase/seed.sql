-- =============================================================================
-- LangMaster Seed Data
-- Run AFTER schema.sql AND stage3-migration.sql in the Supabase SQL editor.
-- Idempotent: uses ON CONFLICT DO NOTHING everywhere.
-- =============================================================================

-- Fixed UUIDs so re-running is safe
-- Teachers: a0000000-0000-0000-0000-00000000000{1-4}
-- Students: b0000000-0000-0000-0000-00000000000{1-3}

-- =============================================================================
-- 1. TEACHER AUTH ACCOUNTS
-- =============================================================================

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data
) values
(
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'sofia.martinez@langmaster.dev',
  crypt('TeacherPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Sofia Martinez","role":"teacher"}',
  '{"provider":"email","providers":["email"]}'
),
(
  'a0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'liam.kennedy@langmaster.dev',
  crypt('TeacherPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Liam Kennedy","role":"teacher"}',
  '{"provider":"email","providers":["email"]}'
),
(
  'a0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'amara.osei@langmaster.dev',
  crypt('TeacherPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Amara Osei","role":"teacher"}',
  '{"provider":"email","providers":["email"]}'
),
(
  'a0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'noah.bauer@langmaster.dev',
  crypt('TeacherPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Noah Bauer","role":"teacher"}',
  '{"provider":"email","providers":["email"]}'
)
on conflict (id) do nothing;

-- The handle_new_user trigger auto-creates profiles with role='student'.
-- Update them to role='teacher' and add bios.
update public.profiles set
  role = 'teacher',
  bio  = 'Native Spanish speaker from Madrid. 8 years teaching Spanish to English-speaking adults. Specialises in conversational fluency and grammar clarity.',
  languages = array['Spanish','English']
where id = 'a0000000-0000-0000-0000-000000000001';

update public.profiles set
  role = 'teacher',
  bio  = 'Native English speaker from Dublin. CELTA certified, 6 years teaching Business and Academic English. Former corporate trainer.',
  languages = array['English','French']
where id = 'a0000000-0000-0000-0000-000000000002';

update public.profiles set
  role = 'teacher',
  bio  = 'Native French speaker from Lyon. Masters in Applied Linguistics. 5 years teaching immersive French. Former Alliance Française instructor.',
  languages = array['French','English']
where id = 'a0000000-0000-0000-0000-000000000003';

update public.profiles set
  role = 'teacher',
  bio  = 'Native German speaker from Munich. 9 years teaching German to international professionals. Specialises in technical and business German.',
  languages = array['German','English']
where id = 'a0000000-0000-0000-0000-000000000004';

-- =============================================================================
-- 2. TEACHER PROFILES (extended data)
-- =============================================================================

insert into public.teacher_profiles
  (user_id, years_experience, certifications, languages_taught, rating, review_count)
values
(
  'a0000000-0000-0000-0000-000000000001',
  8,
  array['DELE Examiner','University of Salamanca TEFL'],
  array['Spanish','English'],
  4.9, 0
),
(
  'a0000000-0000-0000-0000-000000000002',
  6,
  array['CELTA','Cambridge ESOL'],
  array['English','French'],
  4.9, 0
),
(
  'a0000000-0000-0000-0000-000000000003',
  5,
  array['DALF C2','Alliance Française Certified'],
  array['French','English'],
  4.8, 0
),
(
  'a0000000-0000-0000-0000-000000000004',
  9,
  array['TestDaF Examiner','Goethe Institut Certified'],
  array['German','English'],
  4.9, 0
)
on conflict (user_id) do nothing;

-- =============================================================================
-- 3. COURSE OUTCOMES
-- =============================================================================

update public.courses set outcomes = array[
  'Introduce yourself and hold basic conversations in English',
  'Ask and answer questions about everyday topics with confidence',
  'Understand common vocabulary for travel, shopping, and daily life',
  'Read and write simple sentences with correct grammar',
  'Use present, past, and future tenses correctly',
  'Build the foundation needed for intermediate English study'
] where name = 'English for Beginners';

update public.courses set outcomes = array[
  'Lead and participate in professional meetings and calls',
  'Write clear emails, reports, and presentations in English',
  'Handle negotiations, interviews, and client conversations',
  'Master business idioms and formal register',
  'Present data and ideas to international audiences',
  'Improve listening comprehension of native-speed business English'
] where name = 'Business English';

update public.courses set outcomes = array[
  'Speak with near-native fluency across any topic',
  'Understand regional accents, slang, and colloquial speech',
  'Discuss abstract and nuanced subjects with precision',
  'Write formal and informal texts with minimal errors',
  'Self-correct in real time during conversation',
  'Engage comfortably at C1–C2 level in professional or academic settings'
] where name = 'Advanced English Fluency';

update public.courses set outcomes = array[
  'Introduce yourself and have basic conversations in Spanish',
  'Order food, ask for directions, and navigate travel situations',
  'Understand and use common Spanish grammar patterns',
  'Build a vocabulary of 500+ everyday words and phrases',
  'Read simple Spanish texts and messages',
  'Develop the confidence to speak without freezing'
] where name = 'Spanish Basics';

update public.courses set outcomes = array[
  'Hold fluid conversations in French on familiar topics',
  'Understand French speakers at natural speed',
  'Express opinions and describe experiences clearly',
  'Master key grammar: subjunctive, conditional, and compound tenses',
  'Read French news articles and literature with confidence',
  'Prepare for DELF B1–B2 examination'
] where name = 'French Immersion';

-- =============================================================================
-- 4. COURSE MODULES
-- =============================================================================

-- English for Beginners (12 weeks — seeding 6 representative)
insert into public.course_modules (course_id, week_number, title, topics)
select c.id, v.week_number, v.title, v.topics
from public.courses c
cross join (values
  (1, 'Introductions & Greetings',      array['Saying hello and goodbye','Introducing yourself','Numbers 1–20','Days of the week and months']),
  (2, 'Family & Home',                  array['Family vocabulary','Describing your home','Possessive pronouns','Simple present tense']),
  (3, 'Food & Drink',                   array['Restaurant and menu vocabulary','Ordering food and drinks','Countable vs uncountable nouns','Prices and currency']),
  (4, 'Getting Around',                 array['Transport vocabulary','Asking for and giving directions','Prepositions of place','Modal verbs: can / could']),
  (5, 'Daily Routines & Time',          array['Telling the time','Frequency adverbs','Present simple for habits','Morning and evening routine vocabulary']),
  (6, 'Shopping & Money',               array['Clothes and size vocabulary','Shopping dialogues','Comparatives and superlatives','Handling money expressions']),
  (7, 'Health & the Body',              array['Body parts and symptoms','Talking to a doctor','Should / shouldn''t for advice','Common health idioms']),
  (8, 'Past Experiences',               array['Simple past tense regular verbs','Simple past irregular verbs','Telling a story','Weekend and holiday vocabulary']),
  (9, 'Future Plans',                   array['Going to vs will','Making plans and arrangements','Travel and accommodation vocabulary','Writing a simple email']),
  (10,'Work & Study',                   array['Job titles and workplaces','Talking about your job','Present perfect introduction','CV and interview basics']),
  (11,'Entertainment & Hobbies',        array['Free-time activities','Expressing likes and dislikes','Gerunds and infinitives','Discussing films and music']),
  (12,'Review & Real Conversation',     array['Consolidation of all tenses','Fluency practice dialogues','Common errors workshop','Final speaking assessment'])
) as v(week_number, title, topics)
where c.name = 'English for Beginners'
on conflict (course_id, week_number) do nothing;

-- Business English (8 weeks)
insert into public.course_modules (course_id, week_number, title, topics)
select c.id, v.week_number, v.title, v.topics
from public.courses c
cross join (values
  (1, 'Professional Introductions',     array['Small talk and networking','Introducing yourself and your company','Email openings and closings','Formal vs informal register']),
  (2, 'Meetings & Discussions',         array['Meeting vocabulary and phrases','Agreeing, disagreeing, and interrupting politely','Taking and writing meeting minutes','Chairing a meeting']),
  (3, 'Presentations',                  array['Structuring a presentation','Signposting language','Describing charts and data','Handling Q&A sessions']),
  (4, 'Negotiations & Deals',           array['Negotiation phrases and strategies','Making and responding to offers','Conditionals in business','Contract and legal vocabulary']),
  (5, 'Emails & Reports',              array['Email structure and tone','Writing formal reports','Complaint and apology emails','Concise professional writing']),
  (6, 'Telephone & Video Calls',       array['Starting and ending calls','Clarifying and confirming','Leaving voicemails','Troubleshooting call vocabulary']),
  (7, 'Job Interviews & Careers',      array['Interview question types','Describing skills and experience','Salary negotiation','Career development vocabulary']),
  (8, 'Fluency & Consolidation',       array['Speed and accuracy drills','Common business idioms','Cross-cultural communication','Final business case presentation'])
) as v(week_number, title, topics)
where c.name = 'Business English'
on conflict (course_id, week_number) do nothing;

-- Advanced English Fluency (16 weeks — seeding 8)
insert into public.course_modules (course_id, week_number, title, topics)
select c.id, v.week_number, v.title, v.topics
from public.courses c
cross join (values
  (1,  'Diagnostic & Goal Setting',    array['Fluency assessment','Identifying personal weak points','Setting measurable goals','Advanced vocabulary audit']),
  (2,  'Accent & Pronunciation',       array['Phonemic chart mastery','Connected speech patterns','Intonation for meaning','Accent reduction techniques']),
  (3,  'Idiomatic English',            array['Phrasal verbs in context','British vs American idioms','Collocations and chunks','Slang and informal speech']),
  (4,  'Complex Grammar',              array['Subjunctive mood','Inversion for emphasis','Cleft sentences','Advanced modal verbs']),
  (5,  'Debate & Argumentation',       array['Structuring an argument','Counterargument techniques','Hedging and qualifying','Academic discussion vocabulary']),
  (6,  'Media & Culture',             array['Analysing news articles','Discussing film and literature','Understanding cultural references','Critical thinking in English']),
  (7,  'Storytelling & Narrative',    array['Narrative tenses','Building suspense and engagement','Personal anecdote techniques','Creative writing workshop']),
  (8,  'Mastery Assessment',          array['C1/C2 mock exam practice','Error analysis and correction','Speed reading and listening','Final fluency showcase'])
) as v(week_number, title, topics)
where c.name = 'Advanced English Fluency'
on conflict (course_id, week_number) do nothing;

-- Spanish Basics (12 weeks — seeding 6)
insert into public.course_modules (course_id, week_number, title, topics)
select c.id, v.week_number, v.title, v.topics
from public.courses c
cross join (values
  (1, 'Hola — First Words',             array['Greetings and farewells','Alphabet and pronunciation','Numbers 1–30','¿Cómo te llamas?']),
  (2, 'Mi Familia',                     array['Family and relationship vocabulary','Describing people','Ser vs Estar introduction','Adjectival agreement']),
  (3, 'La Comida',                      array['Food and drink vocabulary','Ordering in a restaurant','Indefinite articles','Gustar construction']),
  (4, 'La Ciudad',                      array['Places in a city','Asking for directions','Ir + a + infinitive','Transport vocabulary']),
  (5, 'El Tiempo Libre',                array['Hobbies and free time','Telling the time','Present tense irregular verbs','Weekend plans']),
  (6, 'El Pasado',                      array['Preterite tense regular verbs','Key irregular preterites','Narrating past events','Time expressions: ayer, la semana pasada'])
) as v(week_number, title, topics)
where c.name = 'Spanish Basics'
on conflict (course_id, week_number) do nothing;

-- French Immersion (10 weeks)
insert into public.course_modules (course_id, week_number, title, topics)
select c.id, v.week_number, v.title, v.topics
from public.courses c
cross join (values
  (1,  'Révision & Immersion',          array['Diagnostic speaking assessment','Key phonetics review','Avoiding false friends','Setting conversation goals']),
  (2,  'La Vie Quotidienne',            array['Daily routine vocabulary','Reflexive verbs','Depuis + present tense','Talking about habits']),
  (3,  'Voyages & Transports',          array['Travel vocabulary','Booking and reservations','Future simple tense','Formal vs informal requests']),
  (4,  'Opinions & Débats',            array['Expressing opinions','Agreeing and disagreeing','Subjunctive introduction','Discourse connectors']),
  (5,  'Le Travail & Les Études',       array['Professional and academic vocabulary','CV and cover letter phrases','Conditional tense','Job interview simulation']),
  (6,  'Culture & Médias',             array['Discussing French films and books','Reading press articles','Relative pronouns','Cultural references']),
  (7,  'Grammaire Avancée',            array['Subjonctif in depth','Gérondif and participe présent','Pronoun stacking','Common error correction']),
  (8,  'Narration & Récit',            array['Imparfait vs passé composé in stories','Building narrative tension','Literary tenses overview','Short story exercise']),
  (9,  'Expression Écrite',            array['Formal email and letter writing','Essay structure','Connectors and cohesion','Academic vocabulary']),
  (10, 'Bilan & Évaluation',           array['DELF B1/B2 mock practice','Comprehensive error analysis','Speed comprehension drills','Final oral presentation'])
) as v(week_number, title, topics)
where c.name = 'French Immersion'
on conflict (course_id, week_number) do nothing;

-- =============================================================================
-- 5. COURSE TEACHERS (who teaches what)
-- =============================================================================

-- Sofia → Spanish Basics
insert into public.course_teachers (course_id, teacher_id)
select c.id, 'a0000000-0000-0000-0000-000000000001'
from public.courses c where c.name = 'Spanish Basics'
on conflict (course_id, teacher_id) do nothing;

-- Liam → English for Beginners, Business English, Advanced English Fluency
insert into public.course_teachers (course_id, teacher_id)
select c.id, 'a0000000-0000-0000-0000-000000000002'
from public.courses c where c.name in ('English for Beginners','Business English','Advanced English Fluency')
on conflict (course_id, teacher_id) do nothing;

-- Amara → French Immersion
insert into public.course_teachers (course_id, teacher_id)
select c.id, 'a0000000-0000-0000-0000-000000000003'
from public.courses c where c.name = 'French Immersion'
on conflict (course_id, teacher_id) do nothing;

-- Noah has no course yet (German courses to be created)

-- =============================================================================
-- 6. STUDENT ACCOUNTS (for review data only)
-- =============================================================================

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data
) values
(
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'priya.singh@example.com',
  crypt('StudentPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Priya S.","role":"student"}',
  '{"provider":"email","providers":["email"]}'
),
(
  'b0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'daniel.adeyemi@example.com',
  crypt('StudentPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Daniel A.","role":"student"}',
  '{"provider":"email","providers":["email"]}'
),
(
  'b0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'mei.lin@example.com',
  crypt('StudentPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Mei L.","role":"student"}',
  '{"provider":"email","providers":["email"]}'
)
on conflict (id) do nothing;

-- Mark seed students as onboarding-complete so they don't block admin views
update public.profiles set
  onboarding_completed = true,
  native_lang = 'English',
  target_langs = array['Spanish'],
  levels = '{"Spanish":"A2"}'::jsonb,
  timezone = 'America/New_York',
  goals = array['travel','casual']
where id = 'b0000000-0000-0000-0000-000000000001';

update public.profiles set
  onboarding_completed = true,
  native_lang = 'Yoruba',
  target_langs = array['English'],
  levels = '{"English":"B2"}'::jsonb,
  timezone = 'Europe/London',
  goals = array['work','exam']
where id = 'b0000000-0000-0000-0000-000000000002';

update public.profiles set
  onboarding_completed = true,
  native_lang = 'Mandarin',
  target_langs = array['French'],
  levels = '{"French":"A2"}'::jsonb,
  timezone = 'Asia/Singapore',
  goals = array['travel','culture']
where id = 'b0000000-0000-0000-0000-000000000003';

-- =============================================================================
-- 7. REVIEWS
-- =============================================================================

-- Spanish Basics reviews
insert into public.reviews (course_id, teacher_id, student_id, rating, body)
select
  c.id,
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  5,
  'After 6 weeks I was holding real conversations on holiday in Madrid. The group of 2 format means you cannot hide — you speak every single session. Sofia''s corrections were always kind but precise.'
from public.courses c where c.name = 'Spanish Basics'
on conflict (course_id, student_id) do nothing;

insert into public.reviews (course_id, teacher_id, student_id, rating, body)
select
  c.id,
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  5,
  'I tried apps for two years. One month here beats all of it. Being corrected live, in context, is irreplaceable. My study partner pushed me to keep up — in the best way.'
from public.courses c where c.name = 'Spanish Basics'
on conflict (course_id, student_id) do nothing;

-- Business English reviews
insert into public.reviews (course_id, teacher_id, student_id, rating, body)
select
  c.id,
  'a0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  5,
  'Liam corrected pronunciation patterns I had carried for 10 years without realising. My confidence in client calls is completely different now. Worth every dollar.'
from public.courses c where c.name = 'Business English'
on conflict (course_id, student_id) do nothing;

-- English for Beginners reviews
insert into public.reviews (course_id, teacher_id, student_id, rating, body)
select
  c.id,
  'a0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  5,
  'I was terrified to speak English before this course. By week 3 I was making jokes with my study partner. The small group made all the difference — no hiding.'
from public.courses c where c.name = 'English for Beginners'
on conflict (course_id, student_id) do nothing;

-- French Immersion reviews
insert into public.reviews (course_id, teacher_id, student_id, rating, body)
select
  c.id,
  'a0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  4,
  'Amara is an excellent teacher — patient and very structured. The curriculum goes deep into grammar which I needed. Would have liked more informal conversation practice but overall fantastic.'
from public.courses c where c.name = 'French Immersion'
on conflict (course_id, student_id) do nothing;

insert into public.reviews (course_id, teacher_id, student_id, rating, body)
select
  c.id,
  'a0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000002',
  5,
  'Best learning decision I made this year. Amara tailored every session to what my partner and I actually struggled with. By week 8 I was reading Le Monde without a dictionary.'
from public.courses c where c.name = 'French Immersion'
on conflict (course_id, student_id) do nothing;

-- =============================================================================
-- 8. UPDATE teacher review counts to match seeded reviews
-- =============================================================================

update public.teacher_profiles tp set
  review_count = (
    select count(*) from public.reviews r where r.teacher_id = tp.user_id
  ),
  rating = coalesce((
    select round(avg(r.rating)::numeric, 2) from public.reviews r where r.teacher_id = tp.user_id
  ), tp.rating);
