SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict hGgbmZrnDo1LWgEiuk87gUAe62fmDZCstTagvtGa8zWpu1JQh8AP3P5MBye4C9f

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	b5aca022-4d85-4afa-ac1c-90ea8c163778	authenticated	authenticated	teacher2@langmaster.com	$2a$10$8.GNNplqGGwl/BgrzhgYBOjb5wCH8OPQ5rFryG2jKRuEs78hUccX6	2026-05-04 17:54:09.326501+00	\N		\N		\N			\N	2026-05-11 18:32:43.854458+00	{"provider": "email", "providers": ["email"]}	{"sub": "b5aca022-4d85-4afa-ac1c-90ea8c163778", "name": "Teacher2", "role": "teacher", "email": "teacher2@langmaster.com", "email_verified": true, "phone_verified": false}	\N	2026-05-04 17:54:09.285302+00	2026-05-14 16:30:41.524154+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	authenticated	authenticated	awais123@gmail.com	$2a$10$7oHdBinVXaOsUZgbhKdGxupUZm.MK2iZSF0L3RJuMy8OAcjZW3ghG	2026-05-06 18:09:06.369156+00	\N		\N		\N			\N	2026-05-12 19:23:22.479196+00	{"provider": "email", "providers": ["email"]}	{"sub": "3d2f51de-c033-4deb-a5c9-e7a35b3dcca1", "name": "Awais", "role": "student", "email": "awais123@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-06 18:09:06.31058+00	2026-05-14 16:31:14.344628+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4f78d067-7b27-495b-b61c-2a2667da28fb	authenticated	authenticated	teacher3@langmaster.com	$2a$10$VpVnKR2pXeI0sdIXTGscr.gW1Lwr8FrRZjVc9EaCmpjQWfg/XS8bm	2026-05-07 17:48:45.771987+00	\N		\N		\N			\N	2026-05-07 18:09:16.05636+00	{"provider": "email", "providers": ["email"]}	{"sub": "4f78d067-7b27-495b-b61c-2a2667da28fb", "name": "M Zeeshan", "role": "teacher", "email": "teacher3@langmaster.com", "email_verified": true, "phone_verified": false}	\N	2026-05-07 17:48:45.722581+00	2026-05-07 18:09:16.073624+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4fcbbab7-977b-4bef-b0a9-508c20919934	authenticated	authenticated	abubakar@gmail.com	$2a$10$15jboCFiAX5dZWQ//GQnnuUsHsRU2FxGYu3DR8GsO2DbZNYtKz2Sq	2026-05-09 06:19:54.554573+00	\N		\N		\N			\N	2026-05-09 07:51:03.882147+00	{"provider": "email", "providers": ["email"]}	{"sub": "4fcbbab7-977b-4bef-b0a9-508c20919934", "name": "Abu Bakar", "role": "student", "email": "abubakar@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-09 06:19:54.520247+00	2026-05-10 07:45:10.742586+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	46321526-eac8-4848-806b-f31e8690ae3c	authenticated	authenticated	admin@langmaster.com	$2a$10$KbfQsqH5gwc4c7Srhw39/etDtrMG/hoSQdRk3wggpR5GrGQ8jBwCW	2026-05-02 20:06:43.598694+00	\N		\N		\N			\N	2026-05-14 17:04:56.155322+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-05-02 20:06:43.579446+00	2026-06-21 08:49:33.495906+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f0f988d1-076f-4d66-94f2-194e0fb51341	authenticated	authenticated	zeeshan123@gmail.com	$2a$10$hHtUCIYC0lcahyzrDby0EuIfMR9MUHcJrwO0HSEeL.TMJcGkcAVHi	2026-05-03 16:39:57.648415+00	\N		\N		\N			\N	2026-06-15 17:14:29.438936+00	{"provider": "email", "providers": ["email"]}	{"sub": "f0f988d1-076f-4d66-94f2-194e0fb51341", "name": "Zeeshan", "role": "student", "email": "zeeshan123@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-03 16:39:57.600169+00	2026-06-16 17:16:05.779594+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4e266f41-4b68-484c-a235-aa6f9e21e077	authenticated	authenticated	teacher1@langmaster.com	$2a$10$lMBf1it8puJF6wu1sqbdBeqUx8UX9nfaVYB5D3lXAh7iS4QHBRnny	2026-05-03 17:24:58.868069+00	\N		\N		\N			\N	2026-06-15 17:15:54.409388+00	{"provider": "email", "providers": ["email"]}	{"sub": "4e266f41-4b68-484c-a235-aa6f9e21e077", "name": "Teaher1", "role": "teacher", "email": "teacher1@langmaster.com", "email_verified": true, "phone_verified": false}	\N	2026-05-03 17:24:58.839363+00	2026-06-20 07:02:25.411138+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9777e488-3678-4267-8ae7-b31d3f33db8c	authenticated	authenticated	umar123@gmail.com	$2a$10$oCFB2eRjLj6x3jKEIHXDWufi3g5Q7781sWKIUltbJ7DDOqVPxzlCW	2026-05-11 17:56:31.002814+00	\N		\N		\N			\N	2026-05-11 17:56:31.010529+00	{"provider": "email", "providers": ["email"]}	{"sub": "9777e488-3678-4267-8ae7-b31d3f33db8c", "name": "Umar Ashraf", "role": "student", "email": "umar123@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-11 17:56:30.960636+00	2026-05-11 17:56:31.025139+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b0e75397-ee4b-4be3-8b54-78f457217ffa	authenticated	authenticated	aliakbargims@gmail.com	$2a$10$3wyyzjpA1by7xIDK.7Ggge46dh5de/YhJ2AmkNJJ35csQSAc8hzSO	2026-05-09 06:21:48.655491+00	\N		\N		\N			\N	2026-05-09 07:50:43.227605+00	{"provider": "email", "providers": ["email"]}	{"sub": "b0e75397-ee4b-4be3-8b54-78f457217ffa", "name": "Ali Akbar", "role": "student", "email": "aliakbargims@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-09 06:21:48.634068+00	2026-05-09 07:50:43.230704+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ffd16289-6c61-4729-b054-ee0bf3600579	authenticated	authenticated	hussnain@gmail.com	$2a$10$eyuStKkPNU0AUHklre.iieMaG1ZBQZuxheyEOB8n2FhXMDkaX3g6O	2026-05-10 07:50:55.723927+00	\N		\N		\N			\N	2026-05-10 07:50:55.731859+00	{"provider": "email", "providers": ["email"]}	{"sub": "ffd16289-6c61-4729-b054-ee0bf3600579", "name": "Hussnain", "role": "student", "email": "hussnain@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-10 07:50:55.640317+00	2026-05-11 17:51:43.89533+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	authenticated	authenticated	teacher4@langmaster.com	$2a$10$HqXDHfYSwfJCG180M8FomeUcvtGFRJ/zIGX7Bm3BBwuWWmtgWqtqy	2026-05-09 06:23:41.314413+00	\N		\N		\N			\N	2026-05-11 18:04:13.234856+00	{"provider": "email", "providers": ["email"]}	{"sub": "c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a", "name": "teacher4", "role": "teacher", "email": "teacher4@langmaster.com", "email_verified": true, "phone_verified": false}	\N	2026-05-09 06:23:41.300388+00	2026-05-11 18:04:13.250901+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	authenticated	authenticated	farhan123@gmail.com	$2a$10$BNc6YWKZZ..3e0FBO5tOF.65l52WKCq3iNsC0GQvUD.KTiRIx0sMK	2026-05-04 18:02:48.841036+00	\N		\N		\N			\N	2026-05-12 18:55:11.675068+00	{"provider": "email", "providers": ["email"]}	{"sub": "b6f76e11-48ee-4732-ac06-b32f7cc7dfc8", "name": "Farhan", "role": "student", "email": "farhan123@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-04 18:02:48.805474+00	2026-05-12 18:55:11.725159+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7bc238a8-0409-498c-9e29-515806365c1d	authenticated	authenticated	ahsan@gmail.com	$2a$10$zVJNrOFwig7gPdMs89mJCuESigYOxXtff4LVQBNAMNMXY75StbFra	2026-05-11 18:21:15.756817+00	\N		\N		\N			\N	2026-05-11 18:21:15.765781+00	{"provider": "email", "providers": ["email"]}	{"sub": "7bc238a8-0409-498c-9e29-515806365c1d", "name": "Ahsan", "role": "student", "email": "ahsan@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-11 18:21:15.723453+00	2026-05-12 17:58:40.206957+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	authenticated	authenticated	asim123@gmail.com	$2a$10$Xx86G4WEqK.xN/wVpy7og.NDj4En14qBHEzQjrF.KBg2JCzLRZV3C	2026-05-14 16:32:05.05804+00	\N		\N		\N			\N	2026-06-20 09:28:05.0204+00	{"provider": "email", "providers": ["email"]}	{"sub": "b8fff6b6-1836-4700-ac90-bfc4b66b7c76", "name": "Asim", "role": "student", "email": "asim123@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-14 16:32:05.028542+00	2026-06-22 17:54:49.613346+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	060ef569-4d4b-4490-aa22-ccb7f3b2df11	authenticated	authenticated	teacher7@langmaster.com	$2a$10$pl1dd3xdpeu4zxmxJl5NFOvpKe1V/ay4YW.KlTVqs78RfbOIfHTVm	2026-06-20 08:05:27.778165+00	\N		\N		\N			\N	2026-06-20 08:05:27.787748+00	{"provider": "email", "providers": ["email"]}	{"sub": "060ef569-4d4b-4490-aa22-ccb7f3b2df11", "name": "Teacher7", "role": "teacher", "email": "teacher7@langmaster.com", "email_verified": true, "phone_verified": false}	\N	2026-06-20 08:05:27.714426+00	2026-06-20 08:05:27.812836+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4b03d48a-c35d-453c-8427-df046e0583d7	authenticated	authenticated	muhzeeshan749@gmail.com	$2a$10$sw7rEpjRrYn0SADttmkWi.7i9Zd70tAIGSUEsEegWYb50J.bwLtvq	2026-06-16 17:55:40.976654+00	\N		\N		\N			\N	2026-06-16 17:55:40.982398+00	{"provider": "email", "providers": ["email"]}	{"sub": "4b03d48a-c35d-453c-8427-df046e0583d7", "name": "Muhammad Zeeshan", "role": "student", "email": "muhzeeshan749@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-06-16 17:55:40.942231+00	2026-06-20 09:00:02.161808+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	12bb90a9-9415-4f83-abb3-a923b4d50992	authenticated	authenticated	fb4459467@gmail.com	$2a$10$hqEgcHhIB/HzhGOhiFom9uZM.Wt3JmpxWJUbfeaTi2MIB3G5TXdjm	2026-05-14 00:12:41.264328+00	\N		\N		\N			\N	2026-05-14 07:56:41.709635+00	{"provider": "email", "providers": ["email"]}	{"sub": "12bb90a9-9415-4f83-abb3-a923b4d50992", "name": "Muhammad Farhan", "role": "student", "email": "fb4459467@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-14 00:12:41.165309+00	2026-06-10 17:46:56.460177+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	authenticated	authenticated	teacher5@langmaster.com	$2a$10$RI2aWYrn648T1nbIu.05EeTqxVzFwXYQubMQWhHFlLpV1a1Hipe4.	2026-05-14 17:09:04.621174+00	\N		\N		\N			\N	2026-05-14 17:09:04.626755+00	{"provider": "email", "providers": ["email"]}	{"sub": "7361acfe-39f1-4a58-9bdb-1eae48fbc7fd", "name": "teacher5", "role": "teacher", "email": "teacher5@langmaster.com", "email_verified": true, "phone_verified": false}	\N	2026-05-14 17:09:04.589214+00	2026-06-15 17:08:47.761526+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5c578af5-da1f-4347-9d5b-455d837990b1	authenticated	authenticated	khushiifarhan@gmail.com	$2a$10$ZEyBwQAKqf8ewb0Fh9xZx.SwPYMh2gGqNswWwSNrVAvDe3q.vNbPW	2026-05-14 07:06:15.785228+00	\N		\N		\N			\N	2026-05-14 07:06:15.791987+00	{"provider": "email", "providers": ["email"]}	{"sub": "5c578af5-da1f-4347-9d5b-455d837990b1", "name": "Shaker", "role": "teacher", "email": "khushiifarhan@gmail.com", "email_verified": true, "phone_verified": false}	\N	2026-05-14 07:06:15.762532+00	2026-05-15 08:31:41.589142+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	46655db7-e834-41c2-9e26-9472f37ef48a	authenticated	authenticated	teacher6@langmaster.com	$2a$10$V2uk8MUpDPqdioOc/WiMcuO9CJZWx4rv.qXckQt/2vCD/0UUxwvNe	2026-06-20 07:11:13.91986+00	\N		\N		\N			\N	2026-06-21 08:47:38.930655+00	{"provider": "email", "providers": ["email"]}	{"sub": "46655db7-e834-41c2-9e26-9472f37ef48a", "name": "Teacher6", "role": "teacher", "email": "teacher6@langmaster.com", "email_verified": true, "phone_verified": false}	\N	2026-06-20 07:11:13.857036+00	2026-06-21 08:47:38.982116+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
46321526-eac8-4848-806b-f31e8690ae3c	46321526-eac8-4848-806b-f31e8690ae3c	{"sub": "46321526-eac8-4848-806b-f31e8690ae3c", "email": "admin@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-05-02 20:06:43.594651+00	2026-05-02 20:06:43.594709+00	2026-05-02 20:06:43.594709+00	50ae0092-7c2c-498e-b709-fde726dc4e74
f0f988d1-076f-4d66-94f2-194e0fb51341	f0f988d1-076f-4d66-94f2-194e0fb51341	{"sub": "f0f988d1-076f-4d66-94f2-194e0fb51341", "name": "Zeeshan", "role": "student", "email": "zeeshan123@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-03 16:39:57.645095+00	2026-05-03 16:39:57.645152+00	2026-05-03 16:39:57.645152+00	c559ac8c-e154-4f87-a159-b3b92834bd5e
4e266f41-4b68-484c-a235-aa6f9e21e077	4e266f41-4b68-484c-a235-aa6f9e21e077	{"sub": "4e266f41-4b68-484c-a235-aa6f9e21e077", "name": "Teaher1", "role": "teacher", "email": "teacher1@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-05-03 17:24:58.864072+00	2026-05-03 17:24:58.864122+00	2026-05-03 17:24:58.864122+00	230a3fd2-b847-477f-be88-e1c7020a0179
b5aca022-4d85-4afa-ac1c-90ea8c163778	b5aca022-4d85-4afa-ac1c-90ea8c163778	{"sub": "b5aca022-4d85-4afa-ac1c-90ea8c163778", "name": "Teacher2", "role": "teacher", "email": "teacher2@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-05-04 17:54:09.322217+00	2026-05-04 17:54:09.32229+00	2026-05-04 17:54:09.32229+00	1458a700-79c5-4dbb-913f-ebab83c2bd03
b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	{"sub": "b6f76e11-48ee-4732-ac06-b32f7cc7dfc8", "name": "Farhan", "role": "student", "email": "farhan123@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-04 18:02:48.837728+00	2026-05-04 18:02:48.837791+00	2026-05-04 18:02:48.837791+00	18b34145-bab9-4888-bea2-40a3efc3d43f
3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	{"sub": "3d2f51de-c033-4deb-a5c9-e7a35b3dcca1", "name": "Awais", "role": "student", "email": "awais123@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-06 18:09:06.361846+00	2026-05-06 18:09:06.361894+00	2026-05-06 18:09:06.361894+00	fb29828a-50a1-4a11-b734-f90bb4200124
4f78d067-7b27-495b-b61c-2a2667da28fb	4f78d067-7b27-495b-b61c-2a2667da28fb	{"sub": "4f78d067-7b27-495b-b61c-2a2667da28fb", "name": "M Zeeshan", "role": "teacher", "email": "teacher3@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-05-07 17:48:45.768134+00	2026-05-07 17:48:45.76819+00	2026-05-07 17:48:45.76819+00	9ffc2d45-6477-426a-992b-d96d8813eade
4fcbbab7-977b-4bef-b0a9-508c20919934	4fcbbab7-977b-4bef-b0a9-508c20919934	{"sub": "4fcbbab7-977b-4bef-b0a9-508c20919934", "name": "Abu Bakar", "role": "student", "email": "abubakar@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-09 06:19:54.549538+00	2026-05-09 06:19:54.549593+00	2026-05-09 06:19:54.549593+00	ba86e423-ece3-400f-8fc3-f52b18038945
b0e75397-ee4b-4be3-8b54-78f457217ffa	b0e75397-ee4b-4be3-8b54-78f457217ffa	{"sub": "b0e75397-ee4b-4be3-8b54-78f457217ffa", "name": "Ali Akbar", "role": "student", "email": "aliakbargims@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-09 06:21:48.65297+00	2026-05-09 06:21:48.653012+00	2026-05-09 06:21:48.653012+00	610016ab-8a79-4f2a-b16e-e4220b0c0eeb
c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	{"sub": "c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a", "name": "teacher4", "role": "teacher", "email": "teacher4@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-05-09 06:23:41.311876+00	2026-05-09 06:23:41.311926+00	2026-05-09 06:23:41.311926+00	d3defab3-b59f-43cf-88b1-00f9ef02b4c9
ffd16289-6c61-4729-b054-ee0bf3600579	ffd16289-6c61-4729-b054-ee0bf3600579	{"sub": "ffd16289-6c61-4729-b054-ee0bf3600579", "name": "Hussnain", "role": "student", "email": "hussnain@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-10 07:50:55.71522+00	2026-05-10 07:50:55.715283+00	2026-05-10 07:50:55.715283+00	d2e07380-1b24-48e9-83b6-a499e9b9a49d
9777e488-3678-4267-8ae7-b31d3f33db8c	9777e488-3678-4267-8ae7-b31d3f33db8c	{"sub": "9777e488-3678-4267-8ae7-b31d3f33db8c", "name": "Umar Ashraf", "role": "student", "email": "umar123@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-11 17:56:30.998305+00	2026-05-11 17:56:30.99837+00	2026-05-11 17:56:30.99837+00	be4741d1-3f3a-4d51-a834-9e6df05b1a52
7bc238a8-0409-498c-9e29-515806365c1d	7bc238a8-0409-498c-9e29-515806365c1d	{"sub": "7bc238a8-0409-498c-9e29-515806365c1d", "name": "Ahsan", "role": "student", "email": "ahsan@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-11 18:21:15.748166+00	2026-05-11 18:21:15.748214+00	2026-05-11 18:21:15.748214+00	86baf97f-8904-4f5f-adc4-fb2933c4cc7f
12bb90a9-9415-4f83-abb3-a923b4d50992	12bb90a9-9415-4f83-abb3-a923b4d50992	{"sub": "12bb90a9-9415-4f83-abb3-a923b4d50992", "name": "Muhammad Farhan", "role": "student", "email": "fb4459467@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-14 00:12:41.253775+00	2026-05-14 00:12:41.253837+00	2026-05-14 00:12:41.253837+00	f81fff32-a78e-4684-bfaa-7d8155f294e2
5c578af5-da1f-4347-9d5b-455d837990b1	5c578af5-da1f-4347-9d5b-455d837990b1	{"sub": "5c578af5-da1f-4347-9d5b-455d837990b1", "name": "Shaker", "role": "teacher", "email": "khushiifarhan@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-14 07:06:15.779197+00	2026-05-14 07:06:15.779243+00	2026-05-14 07:06:15.779243+00	cdf4d05f-e15a-4c2d-8d0f-fe4de1313b87
b8fff6b6-1836-4700-ac90-bfc4b66b7c76	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	{"sub": "b8fff6b6-1836-4700-ac90-bfc4b66b7c76", "name": "Asim", "role": "student", "email": "asim123@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-05-14 16:32:05.054129+00	2026-05-14 16:32:05.05419+00	2026-05-14 16:32:05.05419+00	ca464083-8da1-4c26-b11e-0b865269256a
7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	{"sub": "7361acfe-39f1-4a58-9bdb-1eae48fbc7fd", "name": "teacher5", "role": "teacher", "email": "teacher5@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-05-14 17:09:04.61536+00	2026-05-14 17:09:04.615407+00	2026-05-14 17:09:04.615407+00	1ecaf89d-16e1-44b7-98e0-b4ae828d9fca
4b03d48a-c35d-453c-8427-df046e0583d7	4b03d48a-c35d-453c-8427-df046e0583d7	{"sub": "4b03d48a-c35d-453c-8427-df046e0583d7", "name": "Muhammad Zeeshan", "role": "student", "email": "muhzeeshan749@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-06-16 17:55:40.971913+00	2026-06-16 17:55:40.971963+00	2026-06-16 17:55:40.971963+00	9e670c42-7244-4b5c-8614-7ee3ca5a3ba5
46655db7-e834-41c2-9e26-9472f37ef48a	46655db7-e834-41c2-9e26-9472f37ef48a	{"sub": "46655db7-e834-41c2-9e26-9472f37ef48a", "name": "Teacher6", "role": "teacher", "email": "teacher6@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-06-20 07:11:13.91469+00	2026-06-20 07:11:13.914743+00	2026-06-20 07:11:13.914743+00	f6d429f4-e8e6-4f37-9fe3-b67b7eef8b62
060ef569-4d4b-4490-aa22-ccb7f3b2df11	060ef569-4d4b-4490-aa22-ccb7f3b2df11	{"sub": "060ef569-4d4b-4490-aa22-ccb7f3b2df11", "name": "Teacher7", "role": "teacher", "email": "teacher7@langmaster.com", "email_verified": false, "phone_verified": false}	email	2026-06-20 08:05:27.772055+00	2026-06-20 08:05:27.772108+00	2026-06-20 08:05:27.772108+00	cdf82f6d-cab4-4c17-9009-820f05a72df2
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
bfe160a3-24e8-4c03-8d99-7a1eb0874e6f	46655db7-e834-41c2-9e26-9472f37ef48a	2026-06-21 08:47:38.931799+00	2026-06-21 08:47:38.931799+00	\N	aal1	\N	\N	node	203.215.174.10	\N	\N	\N	\N	\N
21790258-aa16-40cd-831e-b14dadc1dfc2	46321526-eac8-4848-806b-f31e8690ae3c	2026-05-14 17:04:56.157032+00	2026-06-21 08:49:39.484336+00	\N	aal1	\N	2026-06-21 08:49:39.484242	node	203.215.174.10	\N	\N	\N	\N	\N
eca25a56-1321-45f4-bcf2-8c21e76b1779	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	2026-06-20 09:28:05.021617+00	2026-06-22 17:54:49.625423+00	\N	aal1	\N	2026-06-22 17:54:49.625284	node	203.215.174.10	\N	\N	\N	\N	\N
bbac3121-aab0-4c83-9c45-237562f6aa1e	5c578af5-da1f-4347-9d5b-455d837990b1	2026-05-14 07:06:15.792078+00	2026-05-15 08:31:41.602233+00	\N	aal1	\N	2026-05-15 08:31:41.602121	node	18.141.217.44	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
bbac3121-aab0-4c83-9c45-237562f6aa1e	2026-05-14 07:06:15.795071+00	2026-05-14 07:06:15.795071+00	password	43a2de22-5a25-422d-9e52-cf9d9ae5132d
21790258-aa16-40cd-831e-b14dadc1dfc2	2026-05-14 17:04:56.197623+00	2026-05-14 17:04:56.197623+00	password	ae9faa75-a39f-4e51-99a1-8a23bbd8c768
eca25a56-1321-45f4-bcf2-8c21e76b1779	2026-06-20 09:28:05.044885+00	2026-06-20 09:28:05.044885+00	password	0cde005d-f771-45ea-b6d0-daff0ab1f400
bfe160a3-24e8-4c03-8d99-7a1eb0874e6f	2026-06-21 08:47:39.002868+00	2026-06-21 08:47:39.002868+00	password	26f67210-6dcf-4860-8d36-dedd4331ffe7
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	319	aq3zjbp2asbv	46655db7-e834-41c2-9e26-9472f37ef48a	f	2026-06-21 08:47:38.972563+00	2026-06-21 08:47:38.972563+00	\N	bfe160a3-24e8-4c03-8d99-7a1eb0874e6f
00000000-0000-0000-0000-000000000000	308	xchy4jzfjhwo	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-20 08:41:48.212964+00	2026-06-21 08:49:33.476051+00	5la7grcftkg7	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	213	afyfpkyn7iks	5c578af5-da1f-4347-9d5b-455d837990b1	t	2026-05-14 12:56:39.325649+00	2026-05-15 08:31:41.543185+00	b6nwsu6ykenr	bbac3121-aab0-4c83-9c45-237562f6aa1e
00000000-0000-0000-0000-000000000000	228	eagupxggaibo	5c578af5-da1f-4347-9d5b-455d837990b1	f	2026-05-15 08:31:41.570547+00	2026-05-15 08:31:41.570547+00	afyfpkyn7iks	bbac3121-aab0-4c83-9c45-237562f6aa1e
00000000-0000-0000-0000-000000000000	298	azuoeouuqocz	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-19 18:08:38.016188+00	2026-06-19 19:09:01.775655+00	j5xbuwmk4467	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	320	26pbt2bvbz26	46321526-eac8-4848-806b-f31e8690ae3c	f	2026-06-21 08:49:33.488343+00	2026-06-21 08:49:33.488343+00	xchy4jzfjhwo	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	318	j2shkgxdbudk	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	t	2026-06-21 08:21:33.48812+00	2026-06-22 06:09:46.166307+00	itlamcokh7eq	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	321	3lnrsknukozf	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	t	2026-06-22 06:09:46.187022+00	2026-06-22 07:18:09.091223+00	j2shkgxdbudk	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	322	vmerzyknaoik	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	t	2026-06-22 07:18:09.099285+00	2026-06-22 13:30:40.789362+00	3lnrsknukozf	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	301	y6klkpl7rf34	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-19 19:09:01.790129+00	2026-06-20 07:27:46.805939+00	azuoeouuqocz	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	323	yvouuk7dbf4z	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	t	2026-06-22 13:30:40.805449+00	2026-06-22 17:54:49.594608+00	vmerzyknaoik	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	246	kyzz265v27di	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-10 17:41:12.716537+00	2026-06-15 17:06:01.47009+00	lz7y2gltky46	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	324	vwjdlwm2htga	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	f	2026-06-22 17:54:49.606335+00	2026-06-22 17:54:49.606335+00	yvouuk7dbf4z	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	305	5la7grcftkg7	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-20 07:27:46.820062+00	2026-06-20 08:41:48.205862+00	y6klkpl7rf34	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	270	ls5hxdx7bgq2	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-15 17:06:01.489384+00	2026-06-15 18:04:41.06281+00	kyzz265v27di	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	275	zpaq4flcvysv	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-15 18:04:41.074514+00	2026-06-15 19:04:08.115581+00	ls5hxdx7bgq2	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	200	zx7wbtnovinc	5c578af5-da1f-4347-9d5b-455d837990b1	t	2026-05-14 07:06:15.793142+00	2026-05-14 08:04:51.133771+00	\N	bbac3121-aab0-4c83-9c45-237562f6aa1e
00000000-0000-0000-0000-000000000000	311	tqnnamyrrojt	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	t	2026-06-20 09:28:05.038143+00	2026-06-21 06:23:59.505921+00	\N	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	315	5bdffhw2kq4x	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	t	2026-06-21 06:23:59.51386+00	2026-06-21 07:22:37.895157+00	tqnnamyrrojt	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	207	mt4w5ltahruu	5c578af5-da1f-4347-9d5b-455d837990b1	t	2026-05-14 08:04:51.134617+00	2026-05-14 11:21:12.180373+00	zx7wbtnovinc	bbac3121-aab0-4c83-9c45-237562f6aa1e
00000000-0000-0000-0000-000000000000	278	u44f35cdocbw	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-15 19:04:08.139421+00	2026-06-16 18:21:05.787368+00	zpaq4flcvysv	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	219	lz7y2gltky46	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-05-14 17:04:56.17467+00	2026-06-10 17:41:12.699651+00	\N	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	211	b6nwsu6ykenr	5c578af5-da1f-4347-9d5b-455d837990b1	t	2026-05-14 11:21:12.19676+00	2026-05-14 12:56:39.306466+00	mt4w5ltahruu	bbac3121-aab0-4c83-9c45-237562f6aa1e
00000000-0000-0000-0000-000000000000	316	itlamcokh7eq	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	t	2026-06-21 07:22:37.912415+00	2026-06-21 08:21:33.479883+00	5bdffhw2kq4x	eca25a56-1321-45f4-bcf2-8c21e76b1779
00000000-0000-0000-0000-000000000000	283	yuxpebyxgein	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-16 18:21:05.800872+00	2026-06-16 19:46:31.371837+00	u44f35cdocbw	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	286	kmo3pgdw2yta	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-16 19:46:31.386512+00	2026-06-17 05:46:25.900813+00	yuxpebyxgein	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	290	f43v7llp5vbx	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-17 05:46:25.920067+00	2026-06-17 18:32:14.877881+00	kmo3pgdw2yta	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	292	wni4twvnimje	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-17 18:32:14.886329+00	2026-06-17 19:38:00.022917+00	f43v7llp5vbx	21790258-aa16-40cd-831e-b14dadc1dfc2
00000000-0000-0000-0000-000000000000	295	j5xbuwmk4467	46321526-eac8-4848-806b-f31e8690ae3c	t	2026-06-17 19:38:00.023479+00	2026-06-19 18:08:37.997818+00	wni4twvnimje	21790258-aa16-40cd-831e-b14dadc1dfc2
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."courses" ("id", "name", "description", "language", "level", "duration_weeks", "sessions_per_week", "max_group_size", "price_pkr", "thumbnail_url", "is_active", "created_at", "outcomes") FROM stdin;
a1000000-0000-0000-0000-000000000002	Business English	Master professional English for meetings, emails, negotiations, and presentations. Accelerate your international career.	English	intermediate	8	3	3	199.00	\N	t	2026-05-02 19:49:18.266455+00	{}
a1000000-0000-0000-0000-000000000003	Advanced English Fluency	Achieve native-like fluency through intensive conversation practice, advanced grammar, and cultural nuance.	English	advanced	16	3	2	249.00	\N	t	2026-05-02 19:49:18.266455+00	{}
a1000000-0000-0000-0000-000000000004	Spanish Basics	Learn Spanish from scratch with live conversation practice. Fun, interactive sessions built around real-life scenarios.	Spanish	beginner	12	3	3	149.00	\N	f	2026-05-02 19:49:18.266455+00	{}
a1000000-0000-0000-0000-000000000001	English for Beginners	Build your English foundation with vocabulary, grammar, and conversational skills. Perfect for absolute beginners who want to start speaking from day one.	English	beginner	12	3	3	15000.00	\N	t	2026-05-02 19:49:18.266455+00	{"You will learn how to speak effectively","You will learn basic sentence structuring"}
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("id", "name", "role", "bio", "avatar_url", "languages", "created_at", "native_lang", "target_langs", "levels", "timezone", "availability", "goals", "onboarding_completed", "notification_prefs", "intro_video_url", "years_experience", "certifications", "languages_taught", "rating", "review_count", "rate_per_session", "preferences") FROM stdin;
b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	Farhan	student	\N	\N	\N	2026-05-04 18:02:48.804756+00	Hindi	{English}	{"English": "C2"}	Asia/Karachi	["Mon-01:00", "Mon-02:00", "Mon-03:00", "Mon-04:00", "Mon-05:00", "Mon-06:00", "Tue-01:00", "Tue-02:00", "Tue-03:00", "Tue-04:00", "Tue-05:00", "Tue-06:00", "Fri-01:00", "Fri-02:00", "Fri-03:00", "Fri-04:00", "Fri-05:00", "Fri-06:00"]	{travel,work,casual,exam}	t	{}	\N	0	{}	[]	0	0	25	{}
b5aca022-4d85-4afa-ac1c-90ea8c163778	Teacher2	teacher	I have over 5 years of experience teaching students from diverse backgrounds, focusing on building strong conceptual understanding rather than rote learning. My approach is interactive and student-centered, where I encourage questions, discussions, and real-life examples to make learning practical and engaging. I use simple explanations, visual aids, and regular feedback to ensure students stay motivated and confident throughout their learning journey.	\N	\N	2026-05-04 17:54:09.284906+00	\N	{}	{}	Asia/Karachi	["Mon-01:00", "Mon-02:00", "Mon-03:00", "Mon-04:00", "Mon-05:00", "Mon-06:00", "Tue-01:00", "Tue-02:00", "Tue-03:00", "Tue-04:00", "Tue-05:00", "Tue-06:00", "Wed-01:00", "Wed-02:00", "Wed-03:00", "Wed-04:00", "Wed-05:00", "Wed-06:00", "Thu-01:00", "Thu-02:00", "Thu-03:00", "Thu-04:00", "Thu-05:00", "Thu-06:00", "Fri-01:00", "Fri-02:00", "Fri-03:00", "Fri-04:00", "Fri-05:00", "Fri-06:00"]	{}	t	{}	\N	5	{CELTA,DELTA,"JLPT Instructor"}	[{"lang": "English", "proficiency": "fluent"}]	0	0	40	{"preferredLevels": ["advanced"], "preferredDuration": "60"}
f0f988d1-076f-4d66-94f2-194e0fb51341	Zeeshan	student	\N	\N	\N	2026-05-03 16:39:57.597106+00	Hindi	{English}	{"English": "A1"}	Asia/Karachi	["Mon-13:00", "Mon-14:00", "Mon-15:00", "Mon-16:00", "Mon-17:00", "Thu-13:00", "Thu-14:00", "Thu-15:00", "Thu-16:00", "Thu-17:00", "Fri-13:00", "Fri-14:00", "Fri-15:00", "Fri-16:00", "Fri-17:00"]	{work,travel,casual}	t	{}	\N	0	{}	[]	0	0	25	{}
4fcbbab7-977b-4bef-b0a9-508c20919934	Abu Bakar	student	\N	\N	\N	2026-05-09 06:19:54.519233+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Mon-01:00", "Mon-02:00", "Mon-03:00", "Mon-04:00", "Mon-05:00", "Mon-06:00", "Tue-01:00", "Tue-02:00", "Tue-03:00", "Tue-04:00", "Tue-05:00", "Tue-06:00", "Wed-01:00", "Wed-02:00", "Wed-03:00", "Wed-04:00", "Wed-05:00", "Wed-06:00"]	{travel,exam,heritage,casual}	t	{}	\N	0	{}	[]	0	0	25	{}
3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	Awais	student	\N	\N	\N	2026-05-06 18:09:06.31025+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Tue-01:00", "Tue-02:00", "Tue-03:00", "Tue-04:00", "Tue-05:00", "Tue-06:00", "Wed-01:00", "Wed-02:00", "Wed-03:00", "Wed-04:00", "Wed-05:00", "Wed-06:00", "Thu-01:00", "Thu-02:00", "Thu-03:00", "Thu-04:00", "Thu-05:00", "Thu-06:00", "Fri-01:00", "Fri-02:00", "Fri-03:00", "Fri-04:00", "Fri-05:00", "Fri-06:00"]	{work,exam,casual}	t	{}	\N	0	{}	[]	0	0	25	{}
46321526-eac8-4848-806b-f31e8690ae3c	LangMaster Admin	admin	\N	\N	\N	2026-05-02 20:06:43.57908+00	\N	{}	{}	\N	[]	{}	f	{}	\N	0	{}	[]	0	0	25	{}
4f78d067-7b27-495b-b61c-2a2667da28fb	M Zeeshan	teacher	this is a test teacher, I'm expert in english teaching.	\N	\N	2026-05-07 17:48:45.721658+00	\N	{}	{}	Asia/Karachi	["Mon-07:00", "Mon-08:00", "Mon-09:00", "Mon-10:00", "Mon-11:00", "Mon-12:00", "Tue-07:00", "Tue-08:00", "Tue-09:00", "Tue-10:00", "Tue-11:00", "Tue-12:00", "Wed-07:00", "Wed-08:00", "Wed-09:00", "Wed-10:00", "Wed-11:00", "Wed-12:00"]	{}	t	{}	\N	0	{TEFL,"JLPT Instructor","Cambridge TKT"}	[{"lang": "English", "proficiency": "native"}]	0	0	10	{"preferredLevels": ["beginner", "intermediate", "advanced"], "preferredDuration": "60"}
b0e75397-ee4b-4be3-8b54-78f457217ffa	Ali Akbar	student	\N	\N	\N	2026-05-09 06:21:48.633779+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Mon-01:00", "Mon-02:00", "Mon-03:00", "Mon-04:00", "Mon-05:00", "Mon-06:00", "Tue-01:00", "Tue-02:00", "Tue-03:00", "Tue-04:00", "Tue-05:00", "Tue-06:00", "Wed-01:00", "Wed-02:00", "Wed-03:00", "Wed-04:00", "Wed-05:00", "Wed-06:00", "Thu-01:00", "Thu-02:00", "Thu-03:00", "Thu-04:00", "Thu-05:00", "Thu-06:00"]	{travel,exam,heritage,work}	t	{}	\N	0	{}	[]	0	0	25	{}
c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	teacher4	teacher	I have over 5 years of experience teaching students from diverse backgrounds, focusing on building strong conceptual understanding rather than rote learning. My approach is interactive and student-centered, where I encourage questions, discussions, and real-life examples to make learning practical and engaging. I use simple explanations, visual aids, and regular feedback to ensure students stay motivated and confident throughout their learning journey.	\N	\N	2026-05-09 06:23:41.300051+00	\N	{}	{}	Asia/Karachi	["Mon-01:00", "Mon-02:00", "Mon-03:00", "Mon-04:00", "Mon-05:00", "Mon-06:00", "Tue-01:00", "Tue-02:00", "Tue-03:00", "Tue-04:00", "Tue-05:00", "Tue-06:00", "Wed-01:00", "Wed-02:00", "Wed-03:00", "Wed-04:00", "Wed-05:00", "Wed-06:00", "Thu-01:00", "Thu-02:00", "Thu-03:00", "Thu-04:00", "Thu-05:00", "Thu-06:00", "Fri-01:00", "Fri-02:00", "Fri-03:00", "Fri-04:00", "Fri-05:00", "Fri-06:00"]	{}	t	{}	\N	0	{"Cambridge TKT",DELF/DALF,TESOL,DELTA}	[{"lang": "English", "proficiency": "native"}]	0	0	20	{"preferredLevels": ["beginner"], "preferredDuration": "60"}
ffd16289-6c61-4729-b054-ee0bf3600579	Hussnain	student	\N	\N	\N	2026-05-10 07:50:55.639337+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Mon-13:00", "Mon-14:00", "Mon-15:00", "Mon-16:00", "Mon-17:00", "Mon-18:00", "Tue-13:00", "Tue-14:00", "Tue-15:00", "Tue-16:00", "Tue-17:00", "Tue-18:00", "Wed-13:00", "Wed-14:00", "Wed-15:00", "Wed-16:00", "Wed-17:00", "Wed-18:00"]	{casual,work,travel,exam}	t	{}	\N	0	{}	[]	0	0	25	{}
9777e488-3678-4267-8ae7-b31d3f33db8c	Umar Ashraf	student	\N	\N	\N	2026-05-11 17:56:30.959268+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Mon-13:00", "Mon-14:00", "Mon-15:00", "Mon-16:00", "Mon-17:00", "Mon-18:00", "Tue-13:00", "Tue-14:00", "Tue-15:00", "Tue-16:00", "Tue-17:00", "Tue-18:00", "Wed-13:00", "Wed-14:00", "Wed-15:00", "Wed-16:00", "Wed-17:00", "Wed-18:00"]	{travel,exam,heritage}	t	{}	\N	0	{}	[]	0	0	25	{}
7bc238a8-0409-498c-9e29-515806365c1d	Ahsan	student	\N	\N	\N	2026-05-11 18:21:15.723108+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Mon-01:00", "Mon-02:00", "Mon-03:00", "Mon-04:00", "Mon-05:00", "Mon-06:00", "Tue-01:00", "Tue-02:00", "Tue-03:00", "Tue-04:00", "Tue-05:00", "Tue-06:00", "Wed-01:00", "Wed-02:00", "Wed-03:00", "Wed-04:00", "Wed-05:00", "Wed-06:00", "Thu-01:00", "Thu-02:00", "Thu-03:00", "Thu-04:00", "Thu-05:00", "Thu-06:00", "Fri-01:00", "Fri-02:00", "Fri-03:00", "Fri-04:00", "Fri-05:00", "Fri-06:00"]	{exam,casual,work}	t	{}	\N	0	{}	[]	0	0	25	{}
12bb90a9-9415-4f83-abb3-a923b4d50992	Muhammad Farhan	student	\N	\N	\N	2026-05-14 00:12:41.164951+00	Urdu	{English}	{"English": "B2"}	Asia/Karachi	["Tue-04:00", "Tue-05:00", "Wed-04:00", "Wed-05:00", "Thu-04:00", "Thu-05:00"]	{work}	t	{}	\N	0	{}	[]	0	0	25	{}
5c578af5-da1f-4347-9d5b-455d837990b1	Shaker	teacher	I'm a English teacher having a 10  years of experience	\N	\N	2026-05-14 07:06:15.762206+00	\N	{}	{}	Asia/Karachi	["Tue-04:00", "Tue-05:00", "Wed-04:00", "Wed-05:00", "Thu-04:00", "Thu-05:00"]	{}	t	{}	\N	0	{}	[{"lang": "English", "proficiency": "native"}]	0	0	\N	{"preferredLevels": ["intermediate"], "preferredDuration": "45"}
b8fff6b6-1836-4700-ac90-bfc4b66b7c76	Asim	student	\N	\N	\N	2026-05-14 16:32:05.023882+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Mon-13:00", "Mon-14:00", "Mon-15:00", "Mon-16:00", "Mon-17:00", "Mon-18:00", "Tue-13:00", "Tue-14:00", "Tue-15:00", "Tue-16:00", "Tue-17:00", "Tue-18:00", "Wed-13:00", "Wed-14:00", "Wed-15:00", "Wed-16:00", "Wed-17:00", "Wed-18:00"]	{travel,exam,casual,work}	t	{}	\N	0	{}	[]	0	0	25	{}
7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	teacher5	teacher	I have more than 5 years of teaching experience. Teaching is my passion	\N	\N	2026-05-14 17:09:04.588867+00	\N	{}	{}	Asia/Karachi	["Mon-13:00", "Mon-14:00", "Mon-15:00", "Mon-16:00", "Mon-17:00", "Mon-18:00", "Tue-13:00", "Tue-14:00", "Tue-15:00", "Tue-16:00", "Tue-17:00", "Tue-18:00", "Wed-13:00", "Wed-14:00", "Wed-15:00", "Wed-16:00", "Wed-17:00", "Wed-18:00", "Thu-13:00", "Thu-14:00", "Thu-15:00", "Thu-16:00", "Thu-17:00", "Thu-18:00", "Fri-13:00", "Fri-14:00", "Fri-15:00", "Fri-16:00", "Fri-17:00", "Fri-18:00"]	{}	t	{}	\N	0	{CELTA,TEFL,TESOL,DELTA}	[{"lang": "English", "proficiency": "native"}]	0	0	\N	{"preferredLevels": ["advanced", "intermediate", "beginner"], "preferredDuration": "60"}
46655db7-e834-41c2-9e26-9472f37ef48a	Teacher6	teacher	this is teacher6 here , I'm a professional english teacher have more than 5 years of teaching experience	\N	\N	2026-06-20 07:11:13.85413+00	\N	{}	{}	Asia/Karachi	["Mon-13:00", "Mon-14:00", "Mon-15:00", "Mon-16:00", "Tue-13:00", "Tue-14:00", "Tue-15:00", "Tue-16:00", "Wed-13:00", "Wed-14:00", "Wed-15:00", "Wed-16:00", "Thu-13:00", "Thu-14:00", "Thu-15:00", "Thu-16:00", "Fri-13:00", "Fri-14:00", "Fri-15:00", "Fri-16:00"]	{}	t	{}	\N	0	{"MA in Education"}	[{"lang": "English", "proficiency": "native"}]	0	0	25	{"preferredLevels": ["beginner"], "preferredDuration": "60"}
4b03d48a-c35d-453c-8427-df046e0583d7	Muhammad Zeeshan	student	\N	https://zrtrsxdjfjktmgmialov.supabase.co/storage/v1/object/public/avatars/4b03d48a-c35d-453c-8427-df046e0583d7/1781723499485-repair2.jpeg	\N	2026-06-16 17:55:40.941838+00	Urdu	{English}	{"English": "A1"}	Asia/Karachi	["Mon-16:00", "Mon-17:00", "Mon-18:00", "Tue-16:00", "Tue-17:00", "Tue-18:00", "Wed-16:00", "Wed-17:00", "Wed-18:00", "Thu-16:00", "Thu-17:00", "Thu-18:00", "Fri-16:00", "Fri-17:00", "Fri-18:00"]	{travel,exam,work,casual}	t	{}	\N	0	{}	[]	0	0	25	{}
4e266f41-4b68-484c-a235-aa6f9e21e077	Teaher1	teacher	I have over 3 years of experience teaching students from diverse backgrounds, focusing on building strong conceptual understanding rather than rote learning. My approach is interactive and student-centered, where I encourage questions, discussions, and real-life examples to make learning practical and engaging. I use simple explanations, visual aids, and regular feedback to ensure students stay motivated and confident throughout their learning journey.\n	https://zrtrsxdjfjktmgmialov.supabase.co/storage/v1/object/public/avatars/4e266f41-4b68-484c-a235-aa6f9e21e077/1781723585058-repair1.jpeg	\N	2026-05-03 17:24:58.838301+00	\N	{}	{}	Asia/Karachi	["Mon-13:00", "Mon-14:00", "Mon-15:00", "Mon-16:00", "Mon-17:00", "Tue-13:00", "Tue-14:00", "Tue-15:00", "Tue-16:00", "Tue-17:00", "Wed-13:00", "Wed-14:00", "Wed-15:00", "Wed-16:00", "Wed-17:00", "Thu-13:00", "Thu-14:00", "Thu-15:00", "Thu-16:00", "Thu-17:00", "Fri-13:00", "Fri-14:00", "Fri-15:00", "Fri-16:00", "Fri-17:00"]	{}	t	{}	\N	0	{TEFL,CELTA}	[{"lang": "English", "proficiency": "fluent"}]	0.00	0	25.00	{"preferredLevels": ["beginner"], "preferredDuration": "60"}
060ef569-4d4b-4490-aa22-ccb7f3b2df11	Teacher7	teacher	\N	https://zrtrsxdjfjktmgmialov.supabase.co/storage/v1/object/public/avatars/060ef569-4d4b-4490-aa22-ccb7f3b2df11/1781943536002-models.jpeg	\N	2026-06-20 08:05:27.711897+00	\N	{}	{}	\N	[]	{}	f	{}	\N	5	{}	[]	0	0	25	{"preferredLevels": ["beginner"], "preferredDuration": "60"}
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."groups" ("id", "course_id", "teacher_id", "week_start", "status", "created_at", "acceptance_status", "proposed_at", "responded_at", "declined_teachers") FROM stdin;
b1d8e464-0012-4538-b1bd-cf3649a933b3	a1000000-0000-0000-0000-000000000001	4e266f41-4b68-484c-a235-aa6f9e21e077	2026-05-11	active	2026-05-04 17:23:21.920109+00	accepted	\N	\N	[]
7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	a1000000-0000-0000-0000-000000000001	b5aca022-4d85-4afa-ac1c-90ea8c163778	2026-05-11	active	2026-05-05 17:02:31.610882+00	accepted	\N	\N	[]
de53d55c-8dd3-4a7d-9aba-24cd514e8f63	a1000000-0000-0000-0000-000000000001	b5aca022-4d85-4afa-ac1c-90ea8c163778	2026-05-11	active	2026-05-06 20:03:56.947186+00	accepted	\N	\N	[]
0433f9a1-c324-4554-bada-f69f55aaab33	a1000000-0000-0000-0000-000000000001	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	2026-05-11	active	2026-05-09 07:21:43.208019+00	accepted	\N	\N	[]
5e963bab-61ec-4655-a216-020c996e0793	a1000000-0000-0000-0000-000000000001	4e266f41-4b68-484c-a235-aa6f9e21e077	2026-05-18	active	2026-05-11 18:03:15.392694+00	accepted	2026-05-11 18:03:15.005+00	2026-05-11 18:12:36.97+00	[]
414127e6-c0c5-4044-99bd-a16cf4d29aa7	a1000000-0000-0000-0000-000000000001	b5aca022-4d85-4afa-ac1c-90ea8c163778	2026-05-18	active	2026-05-11 20:20:03.012669+00	accepted	2026-05-11 20:20:02.625+00	2026-05-11 20:20:51.97+00	[]
2068231b-e72a-4c2e-a43b-cbc1e0becefe	a1000000-0000-0000-0000-000000000004	7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	2026-05-18	active	2026-05-14 17:31:17.149989+00	accepted	2026-05-14 17:31:16.852+00	2026-05-14 17:32:02.556+00	[]
b4db6f69-c2b8-468a-a02a-51d462543a5e	a1000000-0000-0000-0000-000000000001	4e266f41-4b68-484c-a235-aa6f9e21e077	2026-06-22	active	2026-06-16 19:06:07.188598+00	accepted	2026-06-16 19:06:06.716+00	2026-06-16 19:13:37.681+00	[]
3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	a1000000-0000-0000-0000-000000000003	46655db7-e834-41c2-9e26-9472f37ef48a	2026-06-22	active	2026-06-20 09:03:13.584432+00	accepted	2026-06-20 09:03:12.289+00	2026-06-20 09:04:25.919+00	[]
5a665f2e-b24c-4dd9-9b9b-756d953b706d	a1000000-0000-0000-0000-000000000003	46655db7-e834-41c2-9e26-9472f37ef48a	2026-06-22	active	2026-06-20 09:30:29.009681+00	accepted	2026-06-20 09:30:27.731+00	2026-06-20 09:31:36.133+00	[]
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."conversations" ("id", "type", "group_id", "created_at") FROM stdin;
c4e37015-0936-449b-b25e-d224fa29f9e3	direct	\N	2026-05-05 19:40:04.697351+00
b9f456a5-21a9-4f69-84d1-ab9b36eb7b13	group	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-06 20:03:56.947186+00
15eae65f-a23e-4c0e-b176-3c5d6956ae0b	direct	\N	2026-05-06 20:07:02.254815+00
4e0f03ee-ba05-483a-8dbb-08b5b7bb5500	group	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-09 07:21:43.208019+00
376f416a-6ddf-4de0-9761-4e1b8119502d	direct	\N	2026-05-09 07:46:12.912978+00
9cb9cb50-2ec3-4997-9ebc-43c6c3a18ae9	direct	\N	2026-05-09 07:48:55.172003+00
c03850e9-b681-4617-9fd8-a9cb41af8b71	direct	\N	2026-05-09 07:57:27.592151+00
d7f2b6ef-3075-4e53-ae89-70285eb044dc	group	5e963bab-61ec-4655-a216-020c996e0793	2026-05-11 18:03:15.392694+00
06374e17-a6b6-478a-9f13-1d3f4d830d35	direct	\N	2026-05-11 18:14:09.041016+00
e3da5439-21fa-4f1d-9687-b21f11187653	group	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-05-11 20:20:03.012669+00
dd298959-82f6-400b-a0c4-d86e98eae07a	group	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-05-14 17:31:17.149989+00
d24004d0-cf0d-4437-9ff9-bf4191bdc868	direct	\N	2026-06-10 18:03:36.087569+00
c17479bf-312f-469d-b955-bd64d3bddf74	group	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-06-16 19:06:07.188598+00
45f6a418-ea4c-4779-9022-4857cddddcae	direct	\N	2026-06-16 19:20:06.545247+00
640d215e-099a-49aa-934f-06474b439923	group	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-06-20 09:03:13.584432+00
a7e2ed2d-b715-412d-81fe-b0bcc539d027	group	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-06-20 09:30:29.009681+00
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."conversation_participants" ("id", "conversation_id", "user_id", "last_read_at", "joined_at") FROM stdin;
cacc8f14-c20d-4798-a19a-32e50ca2c508	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	2026-05-06 18:07:17.254+00	2026-05-05 19:40:04.965988+00
8f3fc0fe-1d36-42db-b562-abec77e44eb6	e3da5439-21fa-4f1d-9687-b21f11187653	b5aca022-4d85-4afa-ac1c-90ea8c163778	2026-05-11 20:20:03.012669+00	2026-05-11 20:20:03.012669+00
c86b1ef8-75d4-4420-92bd-19cc4e986c57	e3da5439-21fa-4f1d-9687-b21f11187653	7bc238a8-0409-498c-9e29-515806365c1d	2026-05-11 20:20:03.308879+00	2026-05-11 20:20:03.308879+00
b4cf583c-b4eb-46b1-b005-a49300639deb	dd298959-82f6-400b-a0c4-d86e98eae07a	7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	2026-05-14 17:31:17.149989+00	2026-05-14 17:31:17.149989+00
a30d849c-305e-47b3-a2de-11d7a9d0931f	dd298959-82f6-400b-a0c4-d86e98eae07a	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	2026-05-14 17:31:18.150877+00	2026-05-14 17:31:18.150877+00
bc10bcaa-3dc7-495d-b352-7a1ee09fe778	d7f2b6ef-3075-4e53-ae89-70285eb044dc	4e266f41-4b68-484c-a235-aa6f9e21e077	2026-06-10 18:05:48.912+00	2026-05-11 18:03:15.392694+00
1d2e806f-1068-4ace-a899-36e6f686ada0	d24004d0-cf0d-4437-9ff9-bf4191bdc868	f0f988d1-076f-4d66-94f2-194e0fb51341	2026-06-10 18:20:40.278+00	2026-06-10 18:03:36.376966+00
2d6e80c2-f336-459b-a320-5b85e03aa198	4e0f03ee-ba05-483a-8dbb-08b5b7bb5500	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	2026-05-09 07:47:35.13+00	2026-05-09 07:36:17.666258+00
6aff3bd6-0491-4fa0-bba4-95d8262dd4bc	376f416a-6ddf-4de0-9761-4e1b8119502d	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	2026-05-09 07:47:41.34+00	2026-05-09 07:46:13.231583+00
f310da73-9910-44a7-814c-ee819b9ce029	4e0f03ee-ba05-483a-8dbb-08b5b7bb5500	b0e75397-ee4b-4be3-8b54-78f457217ffa	2026-05-09 07:48:20.485+00	2026-05-09 07:21:43.63143+00
ef78ce64-f44b-4a8e-8a0a-3e971b0a7b74	376f416a-6ddf-4de0-9761-4e1b8119502d	b0e75397-ee4b-4be3-8b54-78f457217ffa	2026-05-09 07:50:17.554+00	2026-05-09 07:46:13.231583+00
cbed00b8-ad5c-4e7d-aa9d-c02036a08529	9cb9cb50-2ec3-4997-9ebc-43c6c3a18ae9	b0e75397-ee4b-4be3-8b54-78f457217ffa	2026-05-09 07:50:23.914+00	2026-05-09 07:48:55.531471+00
065c02bf-0ae7-4c4f-b453-c6767d6194d6	45f6a418-ea4c-4779-9022-4857cddddcae	4b03d48a-c35d-453c-8427-df046e0583d7	2026-06-17 18:54:48.755+00	2026-06-16 19:20:06.810238+00
d8d91f09-1b04-487b-b0a8-cb6495baab77	4e0f03ee-ba05-483a-8dbb-08b5b7bb5500	4fcbbab7-977b-4bef-b0a9-508c20919934	2026-05-09 07:51:17.696+00	2026-05-09 07:21:43.63143+00
797645f6-40ac-461b-8963-460e84cbb5c0	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	2026-05-06 20:31:31.012+00	2026-05-05 19:40:04.965988+00
e62872d9-08bd-4e15-8eb5-ff9d4942865f	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	2026-05-09 06:16:53.093+00	2026-05-06 20:07:02.529527+00
bb05edcd-406a-48f9-b1b8-afe15434167a	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	2026-05-09 06:17:16.048+00	2026-05-06 20:07:02.529527+00
72de75ac-626f-4766-ba5e-eac4203b20a5	9cb9cb50-2ec3-4997-9ebc-43c6c3a18ae9	4fcbbab7-977b-4bef-b0a9-508c20919934	2026-05-09 07:56:42.82+00	2026-05-09 07:48:55.531471+00
130841e1-0ead-44fb-b398-6f2ab4e96f5b	b9f456a5-21a9-4f69-84d1-ab9b36eb7b13	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	2026-05-09 06:18:01.361+00	2026-05-06 20:03:57.239133+00
0ea20abe-8565-4941-8e32-06759688e7ce	c03850e9-b681-4617-9fd8-a9cb41af8b71	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	2026-05-09 07:57:27.905522+00	2026-05-09 07:57:27.905522+00
fa62dad4-1e99-42d8-960b-c4b32fe05fb5	c03850e9-b681-4617-9fd8-a9cb41af8b71	4fcbbab7-977b-4bef-b0a9-508c20919934	2026-05-09 07:57:33.855+00	2026-05-09 07:57:27.905522+00
4c565576-f08e-426a-b410-683ebf41c680	d7f2b6ef-3075-4e53-ae89-70285eb044dc	9777e488-3678-4267-8ae7-b31d3f33db8c	2026-05-11 18:03:15.780683+00	2026-05-11 18:03:15.780683+00
b1243930-5a0a-4b0d-ba03-fa48afcaaa8c	d7f2b6ef-3075-4e53-ae89-70285eb044dc	ffd16289-6c61-4729-b054-ee0bf3600579	2026-05-11 18:03:15.780683+00	2026-05-11 18:03:15.780683+00
bb7619d3-6a3b-48af-854c-3fd6798c2c84	06374e17-a6b6-478a-9f13-1d3f4d830d35	ffd16289-6c61-4729-b054-ee0bf3600579	2026-05-11 18:14:09.326901+00	2026-05-11 18:14:09.326901+00
a43dbed6-0bfc-41ed-a905-a6c637e2bfeb	c17479bf-312f-469d-b955-bd64d3bddf74	4b03d48a-c35d-453c-8427-df046e0583d7	2026-06-17 19:14:37.441+00	2026-06-16 19:06:07.768837+00
0a0a6bde-5873-48c6-b193-067872aee578	06374e17-a6b6-478a-9f13-1d3f4d830d35	9777e488-3678-4267-8ae7-b31d3f33db8c	2026-05-11 18:14:14.285+00	2026-05-11 18:14:09.326901+00
f6b21ad3-89d7-4024-891f-55a15456d8f3	c17479bf-312f-469d-b955-bd64d3bddf74	4e266f41-4b68-484c-a235-aa6f9e21e077	2026-06-17 19:15:43.319+00	2026-06-16 19:06:07.188598+00
eca328dc-e7e0-4718-9d81-2ff3ae70582e	640d215e-099a-49aa-934f-06474b439923	46655db7-e834-41c2-9e26-9472f37ef48a	2026-06-20 09:03:13.584432+00	2026-06-20 09:03:13.584432+00
436c5c88-bf38-4be3-a376-0291be626646	640d215e-099a-49aa-934f-06474b439923	4b03d48a-c35d-453c-8427-df046e0583d7	2026-06-20 09:03:13.914839+00	2026-06-20 09:03:13.914839+00
efc4a94a-a5ae-4217-b1b5-9e6edb76dc0e	a7e2ed2d-b715-412d-81fe-b0bcc539d027	46655db7-e834-41c2-9e26-9472f37ef48a	2026-06-20 09:30:29.009681+00	2026-06-20 09:30:29.009681+00
bc572e55-6179-451c-a38c-261b9899d898	b9f456a5-21a9-4f69-84d1-ab9b36eb7b13	b5aca022-4d85-4afa-ac1c-90ea8c163778	2026-05-11 19:09:05.843+00	2026-05-09 07:36:17.666258+00
bfa33ca3-8029-4589-b754-71a791efb6b0	a7e2ed2d-b715-412d-81fe-b0bcc539d027	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	2026-06-20 09:30:29.278429+00	2026-06-20 09:30:29.278429+00
9fac67c4-cc35-40aa-b8a0-28133729fdda	45f6a418-ea4c-4779-9022-4857cddddcae	4e266f41-4b68-484c-a235-aa6f9e21e077	2026-06-16 19:53:11.134+00	2026-06-16 19:20:06.810238+00
92f3c315-d1c5-4003-a6a9-9038793ef010	d24004d0-cf0d-4437-9ff9-bf4191bdc868	4e266f41-4b68-484c-a235-aa6f9e21e077	2026-06-16 19:54:05.668+00	2026-06-10 18:03:36.376966+00
\.


--
-- Data for Name: course_modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."course_modules" ("id", "course_id", "week_number", "title", "topics") FROM stdin;
b851fb32-8c33-4abd-a58c-cc45bb827b0e	a1000000-0000-0000-0000-000000000002	1	Professional Introductions	{"Elevator pitches","Business card etiquette","Formal vs informal register"}
4bbfce2d-218a-4153-9bcf-adc4d64db20d	a1000000-0000-0000-0000-000000000002	2	Meetings & Discussions	{"Meeting phrases","Agreeing & disagreeing politely","Taking minutes"}
0289c0ce-894f-4e24-9e4e-1e1b61136507	a1000000-0000-0000-0000-000000000002	3	Presentations	{"Structuring a presentation","Signposting language","Handling Q&A"}
3803b4ec-059f-475e-8d26-af524434ca1b	a1000000-0000-0000-0000-000000000002	4	Emails & Reports	{"Formal email templates","Report writing","Subject lines & tone"}
98ed82d1-e6ea-448f-a58c-a94f4fecd04e	a1000000-0000-0000-0000-000000000002	5	Negotiations	{"Negotiation phrases","Making offers","Reaching agreement"}
e97f2095-108e-486c-910e-57c3312c1ae6	a1000000-0000-0000-0000-000000000002	6	Telephoning & Video Calls	{"Phone etiquette","Clarifying & confirming","Technical difficulties"}
c51e5fe6-e1be-453e-9858-326562b5f5ea	a1000000-0000-0000-0000-000000000002	7	Networking	{"Small talk","Conference language","Follow-up emails"}
059cea11-4f06-4ebc-a801-5102b112fc89	a1000000-0000-0000-0000-000000000002	8	Capstone: Full Business Sim	{"Mock board meeting","Pitch presentation","Performance review roleplay"}
f0adff7a-a1f3-47fe-9cc2-bc33478c7281	a1000000-0000-0000-0000-000000000003	1	Nuance & Register	{"Formal vs casual register","Hedging language",Understatement}
44326337-9eea-4576-bcb1-cf7903a41c56	a1000000-0000-0000-0000-000000000003	2	Idioms & Phrasal Verbs	{"Common idioms","Phrasal verbs in context","Slang awareness"}
685a8dd6-0daf-4ffb-afd9-c4ea06493d88	a1000000-0000-0000-0000-000000000003	3	Debate & Argumentation	{"Structuring arguments",Counter-arguments,"Hedging & boosting"}
46565db8-5ba0-4505-afc0-168487b0434f	a1000000-0000-0000-0000-000000000003	4	Storytelling	{"Narrative tenses","Discourse markers","Adding drama"}
8cf0ff06-8982-4bd4-82e3-5834f7d001b2	a1000000-0000-0000-0000-000000000003	5	Advanced Grammar I	{Inversion,"Cleft sentences",Subjunctive}
9f4a7652-ae92-4d41-843e-0331e524c7d6	a1000000-0000-0000-0000-000000000003	6	Advanced Grammar II	{"Mixed conditionals","Wish / If only",Emphasis}
c1d47491-c2e3-429f-b807-28542bdacb83	a1000000-0000-0000-0000-000000000003	7	Culture & Humour	{"British vs American English","Irony & sarcasm","Cultural references"}
e58cc1cc-7283-4faf-930e-56ac7be98e3a	a1000000-0000-0000-0000-000000000003	8	News & Media	{"Discussing current events","Media vocabulary","Bias & perspective"}
17f0dd8f-63c2-420b-990b-f0f6217a64ad	a1000000-0000-0000-0000-000000000003	9	Academic Writing	{"Essay structure","Cohesion devices","Formal vocabulary"}
4f5f5993-cde2-45e1-b972-23783728fbe4	a1000000-0000-0000-0000-000000000003	10	Literature & Poetry	{"Analysing prose","Poetic devices","Discussion & interpretation"}
b53c5780-d29d-4c86-aefe-d55aa83bd5fb	a1000000-0000-0000-0000-000000000003	11	Speeches & Rhetoric	{"Rhetorical devices","Tone & pace","Famous speeches"}
7c26fa21-39b2-4dba-b3df-602ca2b776c2	a1000000-0000-0000-0000-000000000003	12	Interview & Career	{"Competency-based interviews","Salary negotiation","Body language"}
ca519b01-c494-4c6d-a47e-1e00a2e5dff9	a1000000-0000-0000-0000-000000000003	13	Philosophy & Ethics	{"Abstract discussion","Moral dilemmas","Conceding points"}
434b4a8e-ebba-40d5-a878-9da845e8e88e	a1000000-0000-0000-0000-000000000003	14	Science & Technology	{"Tech vocabulary","Explaining complex ideas simply",Predictions}
009fc72e-9cb6-4cec-976d-8663f48fa9b2	a1000000-0000-0000-0000-000000000003	15	Free Conversation	{"Student-chosen topics","Peer feedback","Fluency drilling"}
86381ab2-8ab6-4922-b78f-92ceef3b0e5e	a1000000-0000-0000-0000-000000000003	16	Graduation & Assessment	{"Final presentation","Peer evaluation","Portfolio review"}
17b21a66-b021-421d-9852-91b0d542a787	a1000000-0000-0000-0000-000000000004	1	Hola!	{Greetings,"Numbers 1–20","Gender of nouns"}
995a5aff-2672-45b0-9bb3-2af45345b2ae	a1000000-0000-0000-0000-000000000004	2	Mi Familia	{"Family members",Possessives,"Ser vs Estar intro"}
ddabea6c-e376-4c1b-b507-09e453864067	a1000000-0000-0000-0000-000000000004	3	La Comida	{"Food vocabulary","Me gusta / No me gusta","Ordering in a café"}
6440e3f3-7778-40a3-b9a0-76c0cfd91d38	a1000000-0000-0000-0000-000000000004	4	La Ciudad	{"Places in a city",Directions,"Asking where things are"}
9b518400-f8a6-464b-83d9-c22a6d2b08ea	a1000000-0000-0000-0000-000000000004	5	Las Compras	{"Shopping vocabulary",Prices,"Quiero / Quisiera"}
124d7e19-9966-4540-a862-c9768eda2628	a1000000-0000-0000-0000-000000000004	6	El Tiempo Libre	{Hobbies,"Present tense -ar verbs","Talking about weekends"}
de52e7ed-4f41-4a74-add1-fe9286ad51cf	a1000000-0000-0000-0000-000000000004	7	La Salud	{"Body parts","Me duele…","At the pharmacy"}
74a31097-0280-41ea-94b5-3b3ebb879c15	a1000000-0000-0000-0000-000000000004	8	Los Viajes	{Transport,"At the airport","Preterite tense basics"}
943a6f6c-972c-4292-bd08-22d3e16b6050	a1000000-0000-0000-0000-000000000004	9	El Trabajo	{Professions,"Daily routines","Reflexive verbs"}
1b1224e4-e6b4-4f2e-94cc-36c2c26de504	a1000000-0000-0000-0000-000000000004	10	Las Fiestas	{Celebrations,Invitations,"Future tense basics"}
fa3533d4-ec0b-40a0-a236-6a485b933ccc	a1000000-0000-0000-0000-000000000004	11	La Naturaleza	{"Environment vocabulary",Comparatives,"Imperfect tense intro"}
b852935a-df2a-4aae-8e4b-61d98bb4023a	a1000000-0000-0000-0000-000000000004	12	Repaso Final	{"Full conversation roleplay",Self-assessment,"Next steps in Spanish"}
295d221b-7dd4-419b-96c4-394623be95af	a1000000-0000-0000-0000-000000000001	1	Hello World	{"Greetings & introductions","Numbers 1–20","Alphabets basics"}
be920cac-6fd0-4790-ac11-52f339eda223	a1000000-0000-0000-0000-000000000001	2	Everyday Objects	{"Common nouns","This / That / These / Those","Colours and shapes"}
d6b732b1-2470-4013-98a9-fcf298980fe7	a1000000-0000-0000-0000-000000000001	3	My Family	{"Family vocabulary","Possessive pronouns","Simple present: to be"}
8c8ba2ab-5f00-4d4f-bb4f-d45e533782f7	a1000000-0000-0000-0000-000000000001	4	Food & Drink	{"Food vocabulary","Ordering in a restaurant","Like / Don't like"}
cf4afc7e-248a-4d55-b37f-797d6fd14771	a1000000-0000-0000-0000-000000000001	5	Daily Routines	{"Time expressions","Simple present tense","Adverbs of frequency"}
6ff941ed-df04-4a2a-aa6c-e8a125268b92	a1000000-0000-0000-0000-000000000001	6	Getting Around	{"Directions vocabulary","Prepositions of place","Asking for help"}
0f4b98d7-81ca-49a1-b6dd-5d7fcc951c87	a1000000-0000-0000-0000-000000000001	7	Shopping	{"Prices and money","Can I / How much is…?","Colours & sizes"}
2e4730ea-8d38-43bd-9e8b-931808784177	a1000000-0000-0000-0000-000000000001	8	Health & Body	{"Body parts","I have a…","At the doctor's"}
822a2ba4-e388-4e4d-b4fb-a0aff17f901e	a1000000-0000-0000-0000-000000000001	9	Travel & Transport	{"Transport vocabulary","Buying tickets","Past simple: to be"}
ce872c13-fe8b-4abe-bd2a-bf6ab18e6080	a1000000-0000-0000-0000-000000000001	10	Weather & Seasons	{"Weather expressions","Present continuous","Talking about plans"}
f6c0adfc-f370-4347-9d22-4c697446289a	a1000000-0000-0000-0000-000000000001	11	Hobbies & Free Time	{"Leisure vocabulary","Like / Love / Hate + -ing","Asking questions"}
84ac2ef6-44fc-474c-81e9-3e929656f2f6	a1000000-0000-0000-0000-000000000001	12	Review & Graduation	{"Full conversation review","Self-introduction speech","Learner reflections"}
\.


--
-- Data for Name: course_teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."course_teachers" ("id", "course_id", "teacher_id", "status") FROM stdin;
4ae1f981-4b59-49c7-93f5-8f97d9b2a452	a1000000-0000-0000-0000-000000000001	b5aca022-4d85-4afa-ac1c-90ea8c163778	approved
029ed918-7c17-45b8-adaa-c9d7ce93e5ee	a1000000-0000-0000-0000-000000000001	4e266f41-4b68-484c-a235-aa6f9e21e077	approved
e294bb07-d2ac-4306-9e15-468a5120248d	a1000000-0000-0000-0000-000000000001	5c578af5-da1f-4347-9d5b-455d837990b1	approved
372cf739-6e40-402f-9b99-ef635c50c22c	a1000000-0000-0000-0000-000000000004	7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	approved
dfb82bac-0993-4098-b75b-cbcee69933fe	a1000000-0000-0000-0000-000000000003	46655db7-e834-41c2-9e26-9472f37ef48a	approved
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."enrollments" ("id", "user_id", "course_id", "status", "enrolled_at", "payment_status", "stripe_session_id", "refunded_at") FROM stdin;
4c155cd6-d951-4de6-86b1-a41b10080141	f0f988d1-076f-4d66-94f2-194e0fb51341	a1000000-0000-0000-0000-000000000001	assigned	2026-05-03 16:43:18.94525+00	paid	cs_test_b1PtszZvcAQAV4nYahOFm1CvoHaaIgKj2j3DafULzJd5JVMOPOx6b7EgYA	\N
65ca77f5-f75c-4e84-9538-34c09e5137dd	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	a1000000-0000-0000-0000-000000000001	assigned	2026-05-05 16:55:31.659126+00	paid	cs_test_b1ohcWWJuY6v3UgI4Ez9pF0ILm4NC3q4qEgrLC0Rt3CFinDbInuRGdd5wn	\N
aa172b47-c77d-4af7-8b5b-e82126161d50	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	a1000000-0000-0000-0000-000000000001	assigned	2026-05-06 19:30:17.676066+00	paid	cs_test_b1uLLbqCw9O1ikgRZntrPds8I0QHWQPCK5kf6CBQu2XUb4WKjmTUAT6IXV	\N
a9c7c0db-c449-4ecf-9516-2c5752fdc26f	b0e75397-ee4b-4be3-8b54-78f457217ffa	a1000000-0000-0000-0000-000000000001	assigned	2026-05-09 06:54:50.96367+00	paid	cs_test_b1fhq2y9Wf99bFDpYNbHQGOist3LkFgzzFVcqAJm3XJSpF1m1zGpHZ1mfQ	\N
f674dc3c-e5e0-46ae-8248-b48d6bbfb33f	4fcbbab7-977b-4bef-b0a9-508c20919934	a1000000-0000-0000-0000-000000000001	assigned	2026-05-09 07:17:21.928762+00	paid	cs_test_b1iJNLedu1XRI4rk82z7h9mQmQN5kN4GSyQ24roCKLNqOstOqonmOsdJP1	\N
abe04b67-9a00-4794-8b30-c04d46507561	ffd16289-6c61-4729-b054-ee0bf3600579	a1000000-0000-0000-0000-000000000001	assigned	2026-05-11 17:53:30.416324+00	paid	cs_test_b1djQUp6jyyfhpUmquHNalENLvoaPryFxqaHvSCN2SHBtoDS68rOCg0JS6	\N
a06bf0a4-5e0d-4086-a85a-601415845f2c	9777e488-3678-4267-8ae7-b31d3f33db8c	a1000000-0000-0000-0000-000000000001	assigned	2026-05-11 17:59:55.187889+00	paid	cs_test_b1ZhJbDugnSFe0ZWk53JKdRyviZLz34ldEvkF1YvtNlEoaAvceZuaEvBaV	\N
8b330623-0e50-42b7-b704-73961a45e725	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	a1000000-0000-0000-0000-000000000004	assigned	2026-05-14 17:01:21.195048+00	unpaid	\N	\N
a74c9d4e-2520-4371-b54a-1ee7cba1d89f	f0f988d1-076f-4d66-94f2-194e0fb51341	a1000000-0000-0000-0000-000000000004	pending	2026-05-28 09:03:39.896969+00	unpaid	\N	\N
a52c7083-e8d6-4361-8dc4-8130eca20d45	4b03d48a-c35d-453c-8427-df046e0583d7	a1000000-0000-0000-0000-000000000001	assigned	2026-06-16 18:18:16.808417+00	paid	\N	\N
379caa02-8808-41fa-bc76-faff50ac46a2	7bc238a8-0409-498c-9e29-515806365c1d	a1000000-0000-0000-0000-000000000001	assigned	2026-05-11 18:24:17.510335+00	unpaid	cs_test_b15rxglK7MoqW15To4uKF31CNL43ExYqgvXBSl83Bwad9xNaWOHQjCBJ8A	\N
eff844cb-b546-4078-a5a7-19f1c2e0bbcf	4b03d48a-c35d-453c-8427-df046e0583d7	a1000000-0000-0000-0000-000000000003	assigned	2026-06-20 09:01:02.065894+00	unpaid	\N	\N
642f840e-4ebe-42a5-9865-96806cd157c4	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	a1000000-0000-0000-0000-000000000003	assigned	2026-06-20 09:29:05.989241+00	paid	\N	\N
\.


--
-- Data for Name: group_action_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."group_action_requests" ("id", "group_id", "teacher_id", "type", "notes", "status", "created_at") FROM stdin;
9a552617-77d2-4b10-8cad-fb593c1681f8	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	b5aca022-4d85-4afa-ac1c-90ea8c163778	student_reassignment		pending	2026-05-05 18:44:38.204592+00
\.


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."group_members" ("id", "group_id", "user_id") FROM stdin;
586300ef-8fa8-414a-90f3-82eeed569398	b1d8e464-0012-4538-b1bd-cf3649a933b3	f0f988d1-076f-4d66-94f2-194e0fb51341
72396280-f37d-41c5-82a0-8c7dfd66cf82	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8
939a68a3-b06b-4bf5-a8ef-8fd594ab8a19	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1
abc967c5-9efc-4fc7-ac4e-7405e0e9accf	0433f9a1-c324-4554-bada-f69f55aaab33	b0e75397-ee4b-4be3-8b54-78f457217ffa
26808116-6a97-4f55-9062-36c19fe33370	0433f9a1-c324-4554-bada-f69f55aaab33	4fcbbab7-977b-4bef-b0a9-508c20919934
5feb1ede-edfe-47d8-b0ec-e11cce6d53d2	5e963bab-61ec-4655-a216-020c996e0793	9777e488-3678-4267-8ae7-b31d3f33db8c
d8194c61-7cf9-4e05-bf5b-37a84dea5b5a	5e963bab-61ec-4655-a216-020c996e0793	ffd16289-6c61-4729-b054-ee0bf3600579
13247bfe-c121-4150-b721-483e384ba179	414127e6-c0c5-4044-99bd-a16cf4d29aa7	7bc238a8-0409-498c-9e29-515806365c1d
1ac989eb-14c0-43d1-88e1-5ec08c35607e	2068231b-e72a-4c2e-a43b-cbc1e0becefe	b8fff6b6-1836-4700-ac90-bfc4b66b7c76
8c834648-8c2b-4763-8f80-0457ffb81a1c	b4db6f69-c2b8-468a-a02a-51d462543a5e	4b03d48a-c35d-453c-8427-df046e0583d7
9489bcf7-cd90-429f-8c60-64990ad6f9ff	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	4b03d48a-c35d-453c-8427-df046e0583d7
df6341a5-283e-4711-a0b5-9034c94bb9c1	5a665f2e-b24c-4dd9-9b9b-756d953b706d	b8fff6b6-1836-4700-ac90-bfc4b66b7c76
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."messages" ("id", "conversation_id", "sender_id", "type", "content", "file_url", "file_name", "file_size", "mime_type", "duration_seconds", "reply_to_id", "created_at", "deleted_at") FROM stdin;
269120fb-88a0-4ede-a404-2957a5f0e870	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	hello	\N	\N	\N	\N	\N	\N	2026-05-05 19:44:37.767546+00	\N
b5603f74-215e-4162-b0d7-9e42285b8a0c	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	yes sir	\N	\N	\N	\N	\N	\N	2026-05-05 19:45:29.708446+00	\N
9b085856-2f8f-40b7-887a-daa624422b64	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	how are you doing	\N	\N	\N	\N	\N	\N	2026-05-05 19:45:45.164328+00	\N
52ef2457-00d3-4729-ba4a-d581489dba62	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	??	\N	\N	\N	\N	\N	\N	2026-05-05 19:47:18.629123+00	\N
b7a497ed-b9da-41d1-baf4-03eaf7275711	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	yes beta	\N	\N	\N	\N	\N	\N	2026-05-05 19:47:42.33789+00	\N
a8012009-794b-4645-8fb4-bd547d0f2c0e	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	hy	\N	\N	\N	\N	\N	\N	2026-05-06 10:22:12.796559+00	\N
5002b61f-dca1-4571-ba11-7ab77a8ccda3	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	yes	\N	\N	\N	\N	\N	\N	2026-05-06 10:22:41.198783+00	\N
40fe96f4-872c-4354-8ae6-f07236bdf613	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	yes farhan	\N	\N	\N	\N	\N	a8012009-794b-4645-8fb4-bd547d0f2c0e	2026-05-06 10:30:22.433153+00	\N
17d48d97-4075-42b0-96f5-089dfc27d2b8	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	how are you sir?	\N	\N	\N	\N	\N	b7a497ed-b9da-41d1-baf4-03eaf7275711	2026-05-06 10:36:39.006119+00	\N
51bba17e-5f64-4eb1-9e3d-b26c2d780fd1	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	i'm fine farhan	\N	\N	\N	\N	\N	\N	2026-05-06 10:38:25.228662+00	\N
8dd6fa6b-a68b-481c-a84c-1d61fb376aaf	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	what's up	\N	\N	\N	\N	\N	\N	2026-05-06 11:59:22.665798+00	\N
72a62cfb-7040-4097-838e-784a4bc66c58	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	everything is great	\N	\N	\N	\N	\N	\N	2026-05-06 11:59:49.600347+00	\N
95dbec66-580b-42ca-aa65-6480ca688964	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	what about you	\N	\N	\N	\N	\N	\N	2026-05-06 12:00:06.917364+00	\N
fad25470-7338-474c-bf5f-faf4e22b9977	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	i'm good	\N	\N	\N	\N	\N	\N	2026-05-06 16:28:19.635387+00	\N
f912810c-0491-45af-9b60-3633fee099eb	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	great	\N	\N	\N	\N	\N	\N	2026-05-06 16:29:00.860025+00	\N
639efe21-5f19-40fb-8cb9-211c99e39150	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	hello again	\N	\N	\N	\N	\N	\N	2026-05-06 16:31:45.313753+00	\N
66129658-042a-4fd3-b848-127c2e010a32	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	yes again	\N	\N	\N	\N	\N	\N	2026-05-06 16:32:38.794465+00	\N
0ed739a2-541f-43a2-96f0-d8e46b704109	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	testing notification	\N	\N	\N	\N	\N	\N	2026-05-06 16:44:44.453538+00	\N
4ca18342-fd43-4d71-a770-a33116546895	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	hello ji	\N	\N	\N	\N	\N	\N	2026-05-06 16:47:30.959295+00	\N
e5b333ec-9dac-4762-89c3-ee8be2ec3aca	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	text	yes	\N	\N	\N	\N	\N	\N	2026-05-06 16:57:29.80324+00	\N
08420af8-cbe8-4d4b-ac54-96b27273c961	c4e37015-0936-449b-b25e-d224fa29f9e3	b5aca022-4d85-4afa-ac1c-90ea8c163778	image	\N	c4e37015-0936-449b-b25e-d224fa29f9e3/b5aca022-4d85-4afa-ac1c-90ea8c163778/1778087205796-cost error.jpeg	cost error.jpeg	78146	image/jpeg	\N	\N	2026-05-06 17:06:51.626706+00	2026-05-06 17:13:45.451+00
2bc8e02f-c57c-4cc8-9c53-b4599f659699	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	voice_note	\N	c4e37015-0936-449b-b25e-d224fa29f9e3/b6f76e11-48ee-4732-ac06-b32f7cc7dfc8/1778087809561-voice-1778087807750.webm	\N	\N	\N	6	\N	2026-05-06 17:16:55.312903+00	2026-05-06 17:42:06.114+00
5fa52ca2-25f4-497b-b64a-c030ad8e6600	c4e37015-0936-449b-b25e-d224fa29f9e3	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	image	\N	c4e37015-0936-449b-b25e-d224fa29f9e3/b6f76e11-48ee-4732-ac06-b32f7cc7dfc8/1778087692949-message.jpeg	message.jpeg	346700	image/jpeg	\N	\N	2026-05-06 17:14:58.549667+00	2026-05-06 18:06:50.397+00
b1d4b04a-ee84-4613-94a4-4247b9d6c1d3	b9f456a5-21a9-4f69-84d1-ab9b36eb7b13	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	text	hello	\N	\N	\N	\N	\N	\N	2026-05-06 20:07:25.495205+00	\N
83d32547-9c8e-4c33-922e-6ab6849514c8	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	text	hello teacher	\N	\N	\N	\N	\N	\N	2026-05-06 20:18:02.127221+00	\N
7ce8ccd2-cc63-48a3-ae6b-72f584d88eae	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	yes awais	\N	\N	\N	\N	\N	\N	2026-05-06 20:18:36.283488+00	\N
6ed4a3fd-7763-42e6-88f2-f525b671aac5	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	voice_note	\N	15eae65f-a23e-4c0e-b176-3c5d6956ae0b/3d2f51de-c033-4deb-a5c9-e7a35b3dcca1/1778099348160-voice-1778099347215.webm	\N	\N	\N	5	\N	2026-05-06 20:29:13.051784+00	\N
f21ee7a3-484e-4dbe-b728-88c738bcb888	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	text	hello	\N	\N	\N	\N	\N	\N	2026-05-07 16:46:33.453503+00	\N
3545af8a-84b9-4372-b302-e711f912d137	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	yes	\N	\N	\N	\N	\N	\N	2026-05-07 16:49:07.661898+00	\N
92c16838-5fe4-43a5-90cc-73fe318344d4	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	??	\N	\N	\N	\N	\N	\N	2026-05-07 16:55:35.985029+00	\N
903b114b-f80a-44fa-a08f-dbbe6e2fee85	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	??	\N	\N	\N	\N	\N	\N	2026-05-07 16:56:02.216582+00	\N
87202861-5ce3-48fe-a50e-0be1a56c836c	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	again	\N	\N	\N	\N	\N	\N	2026-05-07 17:07:08.587532+00	\N
cea1fefc-7c2d-49b1-9f8f-d7ec22a0a2e0	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	test again	\N	\N	\N	\N	\N	\N	2026-05-07 17:08:09.776756+00	\N
d817f07c-1c11-4a25-b5ed-b6a0fb7e3402	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	on mobile	\N	\N	\N	\N	\N	\N	2026-05-07 17:11:13.333096+00	\N
56decd1b-316e-4d5c-aa7a-5c8e40870970	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	text	hello ji	\N	\N	\N	\N	\N	\N	2026-05-07 18:10:56.885922+00	\N
35a4a935-fd4f-4b1a-947b-ed144c47a59c	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	text	jy	\N	\N	\N	\N	\N	\N	2026-05-07 18:11:24.218562+00	\N
62295074-474c-4bcb-8156-42902744eb82	15eae65f-a23e-4c0e-b176-3c5d6956ae0b	b5aca022-4d85-4afa-ac1c-90ea8c163778	text	yes	\N	\N	\N	\N	\N	\N	2026-05-07 18:11:31.096771+00	\N
074b44ae-3576-4289-a228-c6ee4e9edc85	4e0f03ee-ba05-483a-8dbb-08b5b7bb5500	4fcbbab7-977b-4bef-b0a9-508c20919934	text	hello group	\N	\N	\N	\N	\N	\N	2026-05-09 07:27:01.533929+00	\N
242b43ca-cabd-49a1-bceb-81a2650ab4d6	4e0f03ee-ba05-483a-8dbb-08b5b7bb5500	b0e75397-ee4b-4be3-8b54-78f457217ffa	text	hy abubakar	\N	\N	\N	\N	\N	\N	2026-05-09 07:28:03.480851+00	\N
582e3ae1-635f-4d9a-a4c9-381272392dd9	4e0f03ee-ba05-483a-8dbb-08b5b7bb5500	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	text	hello students	\N	\N	\N	\N	\N	\N	2026-05-09 07:37:13.010075+00	\N
7d9e02cd-4d25-4931-b729-0b0e3d0702fa	376f416a-6ddf-4de0-9761-4e1b8119502d	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	text	hy Ali	\N	\N	\N	\N	\N	\N	2026-05-09 07:46:28.073683+00	\N
052e362c-db9b-42d6-bdac-72f5783681d3	376f416a-6ddf-4de0-9761-4e1b8119502d	b0e75397-ee4b-4be3-8b54-78f457217ffa	text	yes Sir	\N	\N	\N	\N	\N	\N	2026-05-09 07:47:02.692445+00	\N
3ed48707-dac2-4bb0-b393-0dd5a8860c33	9cb9cb50-2ec3-4997-9ebc-43c6c3a18ae9	b0e75397-ee4b-4be3-8b54-78f457217ffa	text	hello Ali	\N	\N	\N	\N	\N	\N	2026-05-09 07:49:08.756534+00	2026-05-09 07:50:10.727+00
a4e0c444-418a-4aa1-afdb-43bdaad77437	9cb9cb50-2ec3-4997-9ebc-43c6c3a18ae9	4fcbbab7-977b-4bef-b0a9-508c20919934	text	yes Ali how are you	\N	\N	\N	\N	\N	\N	2026-05-09 07:51:32.043971+00	\N
b6369abc-5379-4609-a4bf-ffb2856448ac	d7f2b6ef-3075-4e53-ae89-70285eb044dc	4e266f41-4b68-484c-a235-aa6f9e21e077	text	hello	\N	\N	\N	\N	\N	\N	2026-06-10 18:03:25.233365+00	\N
c1176685-0afc-49c1-a56e-27fe4f4c989f	d24004d0-cf0d-4437-9ff9-bf4191bdc868	f0f988d1-076f-4d66-94f2-194e0fb51341	text	hi	\N	\N	\N	\N	\N	\N	2026-06-10 18:03:53.029909+00	\N
bb7bdf93-590d-435e-975d-468e2a34c161	d24004d0-cf0d-4437-9ff9-bf4191bdc868	4e266f41-4b68-484c-a235-aa6f9e21e077	text	yes zeesha	\N	\N	\N	\N	\N	\N	2026-06-10 18:04:14.323512+00	\N
607b8fbf-60d9-4f1d-9a42-c52850f2d23e	d24004d0-cf0d-4437-9ff9-bf4191bdc868	f0f988d1-076f-4d66-94f2-194e0fb51341	text	hi	\N	\N	\N	\N	\N	bb7bdf93-590d-435e-975d-468e2a34c161	2026-06-10 18:04:26.419396+00	\N
84ce014a-3331-4b3c-aac5-a4152a32be5c	d24004d0-cf0d-4437-9ff9-bf4191bdc868	f0f988d1-076f-4d66-94f2-194e0fb51341	voice_note	\N	d24004d0-cf0d-4437-9ff9-bf4191bdc868/f0f988d1-076f-4d66-94f2-194e0fb51341/1781114794774-voice-1781114793727.webm	\N	\N	\N	1	\N	2026-06-10 18:06:38.883818+00	\N
09495987-8659-40a2-9b31-b318df7e5daa	d24004d0-cf0d-4437-9ff9-bf4191bdc868	f0f988d1-076f-4d66-94f2-194e0fb51341	voice_note	\N	d24004d0-cf0d-4437-9ff9-bf4191bdc868/f0f988d1-076f-4d66-94f2-194e0fb51341/1781114810476-voice-1781114810338.webm	\N	\N	\N	1	\N	2026-06-10 18:06:54.006724+00	\N
f50a089d-a913-4ed6-b10c-de538b7e3a0c	d24004d0-cf0d-4437-9ff9-bf4191bdc868	f0f988d1-076f-4d66-94f2-194e0fb51341	voice_note	\N	d24004d0-cf0d-4437-9ff9-bf4191bdc868/f0f988d1-076f-4d66-94f2-194e0fb51341/1781114818473-voice-1781114818333.webm	\N	\N	\N	4	\N	2026-06-10 18:07:02.383706+00	\N
ee6b70bc-089a-4e88-bade-1516aa154201	d24004d0-cf0d-4437-9ff9-bf4191bdc868	4e266f41-4b68-484c-a235-aa6f9e21e077	voice_note	\N	d24004d0-cf0d-4437-9ff9-bf4191bdc868/4e266f41-4b68-484c-a235-aa6f9e21e077/1781114876237-voice-1781114873261.webm	\N	\N	\N	5	\N	2026-06-10 18:08:01.736249+00	\N
0d023898-4a79-4971-8264-6f62d1390011	d24004d0-cf0d-4437-9ff9-bf4191bdc868	4e266f41-4b68-484c-a235-aa6f9e21e077	voice_note	\N	d24004d0-cf0d-4437-9ff9-bf4191bdc868/4e266f41-4b68-484c-a235-aa6f9e21e077/1781114924546-voice-1781114922456.webm	\N	\N	\N	5	\N	2026-06-10 18:08:48.143211+00	\N
79206d27-8fdb-4605-9582-c1eafd90ef84	45f6a418-ea4c-4779-9022-4857cddddcae	4e266f41-4b68-484c-a235-aa6f9e21e077	text	hello	\N	\N	\N	\N	\N	\N	2026-06-16 19:20:45.841908+00	\N
da6d33ab-bffb-4602-9f71-aaa863dfc415	45f6a418-ea4c-4779-9022-4857cddddcae	4e266f41-4b68-484c-a235-aa6f9e21e077	text	how are you	\N	\N	\N	\N	\N	\N	2026-06-16 19:39:45.982913+00	\N
e9f0439c-c4d4-4d77-b4b5-2432be27db8d	45f6a418-ea4c-4779-9022-4857cddddcae	4e266f41-4b68-484c-a235-aa6f9e21e077	text	again	\N	\N	\N	\N	\N	\N	2026-06-16 19:42:51.322695+00	\N
4f5c48d5-9859-4390-8fa7-a1a40dc033ec	45f6a418-ea4c-4779-9022-4857cddddcae	4e266f41-4b68-484c-a235-aa6f9e21e077	text	once again	\N	\N	\N	\N	\N	\N	2026-06-16 19:43:09.750174+00	\N
75bffde6-fb2c-4cfe-b24f-76ba837fc6f4	45f6a418-ea4c-4779-9022-4857cddddcae	4b03d48a-c35d-453c-8427-df046e0583d7	text	yes	\N	\N	\N	\N	\N	\N	2026-06-16 19:43:38.870858+00	\N
69b97be0-1ca3-44e5-b223-631c3a4d6f30	45f6a418-ea4c-4779-9022-4857cddddcae	4b03d48a-c35d-453c-8427-df046e0583d7	text	what's here	\N	\N	\N	\N	\N	\N	2026-06-16 19:43:54.052089+00	\N
fdcea82b-e61a-4cf9-a510-406668954502	45f6a418-ea4c-4779-9022-4857cddddcae	4e266f41-4b68-484c-a235-aa6f9e21e077	text	all good bro	\N	\N	\N	\N	\N	\N	2026-06-16 19:44:22.084784+00	\N
e09968a2-ff4f-427c-9d39-8616c0122f1b	45f6a418-ea4c-4779-9022-4857cddddcae	4b03d48a-c35d-453c-8427-df046e0583d7	text	got it	\N	\N	\N	\N	\N	\N	2026-06-16 19:44:54.101198+00	\N
d13bc228-60a7-4e68-a04c-f78065124e23	45f6a418-ea4c-4779-9022-4857cddddcae	4b03d48a-c35d-453c-8427-df046e0583d7	text	hello teacher	\N	\N	\N	\N	\N	\N	2026-06-16 19:52:12.55286+00	\N
de7df320-b925-4ea4-9831-40598ebf1fd8	45f6a418-ea4c-4779-9022-4857cddddcae	4e266f41-4b68-484c-a235-aa6f9e21e077	text	yes Zeeshan	\N	\N	\N	\N	\N	\N	2026-06-16 19:52:43.998144+00	\N
268ae17d-34b7-4b3c-a848-e8ade81dc084	45f6a418-ea4c-4779-9022-4857cddddcae	4b03d48a-c35d-453c-8427-df046e0583d7	text	kya hal ha	\N	\N	\N	\N	\N	\N	2026-06-16 19:53:10.01455+00	\N
7c5b18a6-b237-4a68-9947-57b320320e76	c17479bf-312f-469d-b955-bd64d3bddf74	4e266f41-4b68-484c-a235-aa6f9e21e077	text	hello all	\N	\N	\N	\N	\N	\N	2026-06-16 19:53:38.322741+00	\N
c8241ac9-7b41-481c-94fb-964aa0d1cbb6	c17479bf-312f-469d-b955-bd64d3bddf74	4b03d48a-c35d-453c-8427-df046e0583d7	text	yes all	\N	\N	\N	\N	\N	\N	2026-06-16 19:53:51.447535+00	\N
557d11d8-4279-4a38-944f-88c3ebe84d3c	c17479bf-312f-469d-b955-bd64d3bddf74	4b03d48a-c35d-453c-8427-df046e0583d7	text	kya hal chal	\N	\N	\N	\N	\N	\N	2026-06-16 19:54:18.969034+00	\N
f98e464c-9a81-4a87-a01e-4e5751f693a1	c17479bf-312f-469d-b955-bd64d3bddf74	4e266f41-4b68-484c-a235-aa6f9e21e077	text	sab fit	\N	\N	\N	\N	\N	\N	2026-06-16 19:54:43.378371+00	\N
de72b484-0317-4b06-9619-41d5ecdb8ca7	c17479bf-312f-469d-b955-bd64d3bddf74	4b03d48a-c35d-453c-8427-df046e0583d7	text	or sunao	\N	\N	\N	\N	\N	f98e464c-9a81-4a87-a01e-4e5751f693a1	2026-06-16 19:55:02.042431+00	\N
980f2c29-5948-46fd-bb8e-aa8896c55d8f	c17479bf-312f-469d-b955-bd64d3bddf74	4e266f41-4b68-484c-a235-aa6f9e21e077	text	all good ha ji	\N	\N	\N	\N	\N	de72b484-0317-4b06-9619-41d5ecdb8ca7	2026-06-16 19:55:16.15089+00	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."notifications" ("id", "user_id", "type", "payload", "sent_at", "read_at") FROM stdin;
facd734a-10db-4cfc-98cf-42524b72b5da	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "hello", "messageId": "269120fb-88a0-4ede-a404-2957a5f0e870", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-05 19:44:38.681983+00	\N
e537a71c-5930-4af2-affe-ff36f8dbe072	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "yes beta", "messageId": "b7a497ed-b9da-41d1-baf4-03eaf7275711", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-05 19:47:43.087202+00	\N
5b0c2ff2-b73b-4103-80d6-50af6e838306	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "yes sir", "messageId": "b5603f74-215e-4162-b0d7-9e42285b8a0c", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-05 19:45:30.488037+00	2026-05-06 10:21:22.267+00
1f6bc4e4-69be-4e99-8c10-4ccdc4abbf78	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "how are you doing", "messageId": "9b085856-2f8f-40b7-887a-daa624422b64", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-05 19:45:45.96368+00	2026-05-06 10:21:22.267+00
045ac7cb-64ac-485b-a4d3-f698c3a30fc6	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "??", "messageId": "52ef2457-00d3-4729-ba4a-d581489dba62", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-05 19:47:19.49871+00	2026-05-06 10:21:22.267+00
7c8ac036-b1ce-4334-aa21-b3ce2a98f17a	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "yes", "messageId": "5002b61f-dca1-4571-ba11-7ab77a8ccda3", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 10:22:42.09531+00	\N
70c07789-2e77-491e-97d5-c26f41007a71	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "yes farhan", "messageId": "40fe96f4-872c-4354-8ae6-f07236bdf613", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 10:30:23.513871+00	\N
8713a751-b454-48d7-bbfb-09b9cdc9b173	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "i'm fine farhan", "messageId": "51bba17e-5f64-4eb1-9e3d-b26c2d780fd1", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 10:38:26.716821+00	\N
04ebca76-f812-4485-a1d6-e6fc0c649f16	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "everything is great", "messageId": "72a62cfb-7040-4097-838e-784a4bc66c58", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 11:59:50.520885+00	\N
7b4980c9-abcb-4c89-b671-050abaff6640	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "what about you", "messageId": "95dbec66-580b-42ca-aa65-6480ca688964", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 12:00:07.788065+00	\N
e9300810-3542-435e-b0ef-32f5e5f7ed54	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "hy", "messageId": "a8012009-794b-4645-8fb4-bd547d0f2c0e", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 10:22:13.754304+00	2026-05-06 16:28:35.515+00
623ad118-d4d0-4ce7-a58c-5854d68836d5	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "how are you sir?", "messageId": "17d48d97-4075-42b0-96f5-089dfc27d2b8", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 10:36:40.006905+00	2026-05-06 16:28:35.515+00
c5761cfd-973c-4cf2-bcfd-2022ef74a723	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "what's up", "messageId": "8dd6fa6b-a68b-481c-a84c-1d61fb376aaf", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 11:59:23.547668+00	2026-05-06 16:28:35.515+00
16842df5-70be-4331-a92b-22366c96acdb	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "i'm good", "messageId": "fad25470-7338-474c-bf5f-faf4e22b9977", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 16:28:20.563536+00	2026-05-06 16:28:35.515+00
3993eada-a82d-41c6-bc86-a4db22423468	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "great", "messageId": "f912810c-0491-45af-9b60-3633fee099eb", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 16:29:01.674554+00	\N
9dbc18f6-81d9-4159-afaf-44664fc611d1	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "hello again", "messageId": "639efe21-5f19-40fb-8cb9-211c99e39150", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 16:31:46.146865+00	\N
2c9d090c-a29b-415e-a5f0-6795a358f01c	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "hello ji", "messageId": "4ca18342-fd43-4d71-a770-a33116546895", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 16:47:32.104047+00	\N
436311e3-5624-4230-9d71-5c62a00a486b	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "yes again", "messageId": "66129658-042a-4fd3-b848-127c2e010a32", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 16:32:39.642266+00	2026-05-06 16:56:57.168+00
b2b36b25-7c99-4fb0-b8e9-2618f1ce424e	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "testing notification", "messageId": "0ed739a2-541f-43a2-96f0-d8e46b704109", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 16:44:45.583835+00	2026-05-06 16:56:57.168+00
08b26080-d51b-4f30-b212-3df40070dcf2	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "yes", "messageId": "e5b333ec-9dac-4762-89c3-ee8be2ec3aca", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 16:57:31.296183+00	2026-05-06 17:00:17.666+00
8c7fac76-236a-49fe-ba11-40dbffdc7358	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	new_message	{"preview": "🖼 Image", "messageId": "08420af8-cbe8-4d4b-ac54-96b27273c961", "senderName": "Teacher2", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 17:06:52.929209+00	\N
632d95c1-30c9-4023-a625-e2d02febe5ff	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "🖼 Image", "messageId": "5fa52ca2-25f4-497b-b64a-c030ad8e6600", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 17:14:59.777285+00	\N
cd5a9cce-ac9d-4c4a-94fa-9ab1e321ac83	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "🎤 Voice note", "messageId": "2bc8e02f-c57c-4cc8-9c53-b4599f659699", "senderName": "Farhan", "conversationId": "c4e37015-0936-449b-b25e-d224fa29f9e3"}	2026-05-06 17:16:56.51154+00	\N
6ff76fd3-1746-4ab6-8495-26b233bb7264	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_group_assigned	{"group_id": "de53d55c-8dd3-4a7d-9aba-24cd514e8f63", "students": 1}	2026-05-06 20:03:58.039767+00	\N
4cc90f34-ed8b-4615-bcb6-9284740cf778	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	group_assigned	{"group_id": "de53d55c-8dd3-4a7d-9aba-24cd514e8f63"}	2026-05-06 20:03:58.295413+00	\N
15cafd86-fe3c-4fde-b46d-6f56139b0b5c	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "hello teacher", "messageId": "83d32547-9c8e-4c33-922e-6ab6849514c8", "senderName": "Awais", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-06 20:18:02.917648+00	\N
82028f72-3287-4f5b-8f61-731785d57161	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "yes awais", "messageId": "7ce8ccd2-cc63-48a3-ae6b-72f584d88eae", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-06 20:18:37.041053+00	\N
87f1771f-340e-4756-acb2-ca84cf5e4347	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "🎤 Voice note", "messageId": "6ed4a3fd-7763-42e6-88f2-f525b671aac5", "senderName": "Awais", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-06 20:29:13.828595+00	\N
64f54931-7a59-4047-89a3-a82b41d7bcce	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "hello", "messageId": "f21ee7a3-484e-4dbe-b728-88c738bcb888", "senderName": "Awais", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 16:46:34.453481+00	\N
39b1ec6b-7b40-4fb7-a167-6780f34fceff	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "yes", "messageId": "3545af8a-84b9-4372-b302-e711f912d137", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 16:49:08.403864+00	\N
2ebda644-91c3-4865-a349-1258d3881861	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "??", "messageId": "92c16838-5fe4-43a5-90cc-73fe318344d4", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 16:55:37.033243+00	\N
f75db5f6-0a5b-4e83-999e-641471618991	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "??", "messageId": "903b114b-f80a-44fa-a08f-dbbe6e2fee85", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 16:56:02.96876+00	\N
cdadb2df-d441-4d12-83a7-ea02d89c4c5c	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "again", "messageId": "87202861-5ce3-48fe-a50e-0be1a56c836c", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 17:07:09.583086+00	\N
97da824b-8cb0-464f-b4fd-4db055f5721a	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "test again", "messageId": "cea1fefc-7c2d-49b1-9f8f-d7ec22a0a2e0", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 17:08:10.732108+00	\N
63e1d111-2d46-45ca-afce-463999b9db4d	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "on mobile", "messageId": "d817f07c-1c11-4a25-b5ed-b6a0fb7e3402", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 17:11:14.506029+00	\N
a4a0794c-9a33-4337-8857-98183e5bf27c	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "hello ji", "messageId": "56decd1b-316e-4d5c-aa7a-5c8e40870970", "senderName": "Awais", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 18:10:57.643711+00	\N
d3f909a2-63d5-4d75-bfd3-68cb456c5d15	b5aca022-4d85-4afa-ac1c-90ea8c163778	new_message	{"preview": "jy", "messageId": "35a4a935-fd4f-4b1a-947b-ed144c47a59c", "senderName": "Awais", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 18:11:25.00279+00	\N
9ed7bac5-aa4b-432a-8631-caee10eb1c14	3d2f51de-c033-4deb-a5c9-e7a35b3dcca1	new_message	{"preview": "yes", "messageId": "62295074-474c-4bcb-8156-42902744eb82", "senderName": "Teacher2", "conversationId": "15eae65f-a23e-4c0e-b176-3c5d6956ae0b"}	2026-05-07 18:11:32.024174+00	\N
edbd6f0f-97c8-411c-87dc-67f8fb8ac48e	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	new_group_assigned	{"group_id": "0433f9a1-c324-4554-bada-f69f55aaab33", "students": 2}	2026-05-09 07:21:44.564888+00	\N
158409fa-254d-4a88-bf1b-32e103d6c91a	b0e75397-ee4b-4be3-8b54-78f457217ffa	group_assigned	{"group_id": "0433f9a1-c324-4554-bada-f69f55aaab33"}	2026-05-09 07:21:44.904336+00	\N
ca8f81c5-0e83-43e8-8a2c-bde48febf78d	4fcbbab7-977b-4bef-b0a9-508c20919934	group_assigned	{"group_id": "0433f9a1-c324-4554-bada-f69f55aaab33"}	2026-05-09 07:21:45.177424+00	\N
9cd6b56a-dbaf-4990-ac58-6d06112c4d6d	b0e75397-ee4b-4be3-8b54-78f457217ffa	new_message	{"preview": "hello group", "messageId": "074b44ae-3576-4289-a228-c6ee4e9edc85", "senderName": "Abu Bakar", "conversationId": "4e0f03ee-ba05-483a-8dbb-08b5b7bb5500"}	2026-05-09 07:27:02.317188+00	\N
50446de8-8d1f-4006-ae11-53c248866bfc	4fcbbab7-977b-4bef-b0a9-508c20919934	new_message	{"preview": "hy abubakar", "messageId": "242b43ca-cabd-49a1-bceb-81a2650ab4d6", "senderName": "Ali Akbar", "conversationId": "4e0f03ee-ba05-483a-8dbb-08b5b7bb5500"}	2026-05-09 07:28:04.227254+00	\N
9ebf4b6c-a9b6-4706-9dbb-4d98abb38878	4fcbbab7-977b-4bef-b0a9-508c20919934	new_message	{"preview": "hello students", "messageId": "582e3ae1-635f-4d9a-a4c9-381272392dd9", "senderName": "teacher4", "conversationId": "4e0f03ee-ba05-483a-8dbb-08b5b7bb5500"}	2026-05-09 07:37:13.774986+00	\N
3cb6cd9c-2a33-4003-8aa7-bcf2dcb07bfd	b0e75397-ee4b-4be3-8b54-78f457217ffa	new_message	{"preview": "hello students", "messageId": "582e3ae1-635f-4d9a-a4c9-381272392dd9", "senderName": "teacher4", "conversationId": "4e0f03ee-ba05-483a-8dbb-08b5b7bb5500"}	2026-05-09 07:37:13.774986+00	\N
b75b47a7-b12d-4280-808b-0ff04d710dff	b0e75397-ee4b-4be3-8b54-78f457217ffa	new_message	{"preview": "hy Ali", "messageId": "7d9e02cd-4d25-4931-b729-0b0e3d0702fa", "senderName": "teacher4", "conversationId": "376f416a-6ddf-4de0-9761-4e1b8119502d"}	2026-05-09 07:46:29.005228+00	\N
b82e0871-fab0-41d0-9145-1f26d9f850a9	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	new_message	{"preview": "yes Sir", "messageId": "052e362c-db9b-42d6-bdac-72f5783681d3", "senderName": "Ali Akbar", "conversationId": "376f416a-6ddf-4de0-9761-4e1b8119502d"}	2026-05-09 07:47:03.752628+00	\N
4b112d23-c8b4-4a05-a5ea-f6ca6fa3d474	4fcbbab7-977b-4bef-b0a9-508c20919934	new_message	{"preview": "hello Ali", "messageId": "3ed48707-dac2-4bb0-b393-0dd5a8860c33", "senderName": "Ali Akbar", "conversationId": "9cb9cb50-2ec3-4997-9ebc-43c6c3a18ae9"}	2026-05-09 07:49:09.532671+00	\N
87967ad2-0461-4452-8af1-e4dc10b203b4	b0e75397-ee4b-4be3-8b54-78f457217ffa	new_message	{"preview": "yes Ali how are you", "messageId": "a4e0c444-418a-4aa1-afdb-43bdaad77437", "senderName": "Abu Bakar", "conversationId": "9cb9cb50-2ec3-4997-9ebc-43c6c3a18ae9"}	2026-05-09 07:51:32.787591+00	\N
50dbd27c-a926-45e2-971b-be7b49a5ba32	9777e488-3678-4267-8ae7-b31d3f33db8c	group_assigned	{"group_id": "5e963bab-61ec-4655-a216-020c996e0793"}	2026-05-11 18:08:08.500821+00	\N
4007fa18-32ba-4155-ba19-2691f181cbe5	ffd16289-6c61-4729-b054-ee0bf3600579	group_assigned	{"group_id": "5e963bab-61ec-4655-a216-020c996e0793"}	2026-05-11 18:08:08.749807+00	\N
b29e9d75-2797-44ac-bd7d-502ac61f99d5	9777e488-3678-4267-8ae7-b31d3f33db8c	group_assigned	{"group_id": "5e963bab-61ec-4655-a216-020c996e0793"}	2026-05-11 18:12:38.241213+00	\N
c8a9fc4b-d2c9-4c95-a8c3-aa52b18411e9	ffd16289-6c61-4729-b054-ee0bf3600579	group_assigned	{"group_id": "5e963bab-61ec-4655-a216-020c996e0793"}	2026-05-11 18:12:38.73576+00	\N
26550367-7c18-48ae-ae5c-bf8f4f43d549	b5aca022-4d85-4afa-ac1c-90ea8c163778	group_proposed	{"group_id": "cddb20a9-8cac-4582-b07c-bc77d8e1e275", "students": 1}	2026-05-11 18:30:57.161258+00	\N
ddfd094e-0fed-470a-a658-5ef7e84b2771	46321526-eac8-4848-806b-f31e8690ae3c	group_proposal_declined	{"reason": "not available to accept more groups", "group_id": "cddb20a9-8cac-4582-b07c-bc77d8e1e275", "teacher_id": "b5aca022-4d85-4afa-ac1c-90ea8c163778"}	2026-05-11 18:35:32.087499+00	\N
9ec83a1e-9f69-4925-ba96-f54cca6bc4f6	b5aca022-4d85-4afa-ac1c-90ea8c163778	group_proposed	{"group_id": "27a0136b-ad30-4a45-b427-d7c1c1e9ceaf", "students": 1}	2026-05-11 18:46:55.906979+00	\N
26fe15d6-58cc-4f3d-8c3d-ef9e7f9b961b	46321526-eac8-4848-806b-f31e8690ae3c	group_proposal_declined	{"reason": null, "course_id": "a1000000-0000-0000-0000-000000000001", "teacher_id": "b5aca022-4d85-4afa-ac1c-90ea8c163778", "course_name": "English for Beginners", "teacher_name": "Teacher2"}	2026-05-11 19:09:59.72141+00	\N
311fb705-3292-4300-a367-5201800362cd	b5aca022-4d85-4afa-ac1c-90ea8c163778	group_proposed	{"group_id": "4fb68bb4-5eeb-4f58-8491-8c2bb0ed3827", "students": 1}	2026-05-11 19:36:17.744703+00	\N
a78fbe67-7b53-4d4b-94d3-e4029bb0f365	46321526-eac8-4848-806b-f31e8690ae3c	group_proposal_declined	{"reason": null, "group_id": "4fb68bb4-5eeb-4f58-8491-8c2bb0ed3827", "course_id": "a1000000-0000-0000-0000-000000000001", "teacher_id": "b5aca022-4d85-4afa-ac1c-90ea8c163778", "course_name": "English for Beginners", "teacher_name": "Teacher2"}	2026-05-11 19:37:22.480366+00	\N
9b2c5f09-3251-47bd-aa32-115cf81dd39a	b5aca022-4d85-4afa-ac1c-90ea8c163778	group_proposed	{"group_id": "c483ecc3-5074-4236-853d-0d9cf0f1c936", "students": 1}	2026-05-11 19:51:52.670872+00	\N
378bfe67-beaf-4687-8cea-8959b37109a4	46321526-eac8-4848-806b-f31e8690ae3c	group_proposal_declined	{"reason": null, "group_id": "c483ecc3-5074-4236-853d-0d9cf0f1c936", "course_id": "a1000000-0000-0000-0000-000000000001", "teacher_id": "b5aca022-4d85-4afa-ac1c-90ea8c163778", "course_name": "English for Beginners", "teacher_name": "Teacher2"}	2026-05-11 19:52:23.234584+00	\N
2eaad00c-156d-4898-aeab-f01ad42111b9	b5aca022-4d85-4afa-ac1c-90ea8c163778	group_proposed	{"group_id": "414127e6-c0c5-4044-99bd-a16cf4d29aa7", "students": 1}	2026-05-11 20:20:03.845562+00	\N
9b475ae1-5bc1-429a-870e-bad4c1ec5dda	7bc238a8-0409-498c-9e29-515806365c1d	group_assigned	{"group_id": "414127e6-c0c5-4044-99bd-a16cf4d29aa7"}	2026-05-11 20:20:53.155218+00	\N
37c5b0f7-f3d4-40aa-9582-299e38d66e7d	7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	group_proposed	{"group_id": "2068231b-e72a-4c2e-a43b-cbc1e0becefe", "students": 1}	2026-05-14 17:31:19.069442+00	\N
13478e83-d400-4493-9f1d-c814cb635dfa	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	group_assigned	{"group_id": "2068231b-e72a-4c2e-a43b-cbc1e0becefe"}	2026-05-14 17:32:04.822954+00	\N
6b37ef0d-98a6-4616-8ee9-faefa4b59c2c	4e266f41-4b68-484c-a235-aa6f9e21e077	group_proposed	{"group_id": "4fb68bb4-5eeb-4f58-8491-8c2bb0ed3827", "students": 1}	2026-05-11 19:40:13.261603+00	2026-05-28 09:00:41.399+00
2536d267-8b2b-474f-936c-cc0c56d783a6	4e266f41-4b68-484c-a235-aa6f9e21e077	group_proposed	{"group_id": "5e963bab-61ec-4655-a216-020c996e0793", "students": 2}	2026-05-11 18:03:16.34662+00	2026-05-28 09:00:41.399+00
dbc6e81c-c84a-49f7-a16d-1102edc50e40	9777e488-3678-4267-8ae7-b31d3f33db8c	new_message	{"preview": "hello", "messageId": "b6369abc-5379-4609-a4bf-ffb2856448ac", "senderName": "Teaher1", "conversationId": "d7f2b6ef-3075-4e53-ae89-70285eb044dc"}	2026-06-10 18:03:26.055713+00	\N
ec0d0bb8-f3d5-460a-ac83-e774d958ca8d	ffd16289-6c61-4729-b054-ee0bf3600579	new_message	{"preview": "hello", "messageId": "b6369abc-5379-4609-a4bf-ffb2856448ac", "senderName": "Teaher1", "conversationId": "d7f2b6ef-3075-4e53-ae89-70285eb044dc"}	2026-06-10 18:03:26.055713+00	\N
e2b9f578-da04-4222-a3d2-30bab6f50ba9	f0f988d1-076f-4d66-94f2-194e0fb51341	new_message	{"preview": "yes zeesha", "messageId": "bb7bdf93-590d-435e-975d-468e2a34c161", "senderName": "Teaher1", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:04:15.130459+00	\N
0d17ec6c-a05e-46dd-b24c-0b78c1a84550	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "hi", "messageId": "607b8fbf-60d9-4f1d-9a42-c52850f2d23e", "senderName": "Zeeshan", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:04:27.277785+00	2026-06-10 18:06:07.97+00
c79f1732-47e9-4f05-bbc4-bf1ce636e6f4	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "hi", "messageId": "c1176685-0afc-49c1-a56e-27fe4f4c989f", "senderName": "Zeeshan", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:03:54.259135+00	2026-06-10 18:06:07.97+00
9ccc7e38-2376-4b1e-bfb8-067a42f9c202	f0f988d1-076f-4d66-94f2-194e0fb51341	new_message	{"preview": "🎤 Voice note", "messageId": "ee6b70bc-089a-4e88-bade-1516aa154201", "senderName": "Teaher1", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:08:03.453491+00	\N
da4fdc2e-0a33-41b0-a472-db9ae17fc401	f0f988d1-076f-4d66-94f2-194e0fb51341	new_message	{"preview": "🎤 Voice note", "messageId": "0d023898-4a79-4971-8264-6f62d1390011", "senderName": "Teaher1", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:08:48.978008+00	\N
28a46056-1c43-4f24-adcb-4849079b0191	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "🎤 Voice note", "messageId": "f50a089d-a913-4ed6-b10c-de538b7e3a0c", "senderName": "Zeeshan", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:07:03.191435+00	2026-06-10 18:19:36.59+00
ae77b070-211e-4662-b611-3c9464f22962	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "🎤 Voice note", "messageId": "09495987-8659-40a2-9b31-b318df7e5daa", "senderName": "Zeeshan", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:06:54.847168+00	2026-06-10 18:19:36.59+00
3d33d64c-36bf-4e13-ad76-4c07385fbbcb	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "🎤 Voice note", "messageId": "84ce014a-3331-4b3c-aac5-a4152a32be5c", "senderName": "Zeeshan", "conversationId": "d24004d0-cf0d-4437-9ff9-bf4191bdc868"}	2026-06-10 18:06:39.684059+00	2026-06-10 18:19:36.59+00
f3112f7e-8719-4060-95bc-58d33ffebf33	4b03d48a-c35d-453c-8427-df046e0583d7	group_assigned	{"group_id": "b4db6f69-c2b8-468a-a02a-51d462543a5e"}	2026-06-16 19:13:39.326425+00	\N
fafaa56e-0cd3-4624-a9d2-ad6530db45a4	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "hello", "messageId": "79206d27-8fdb-4605-9582-c1eafd90ef84", "senderName": "Teaher1", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:20:46.800796+00	\N
a323fcfd-5bde-426a-aad9-182bd6308946	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "how are you", "messageId": "da6d33ab-bffb-4602-9f71-aaa863dfc415", "senderName": "Teaher1", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:40:46.791347+00	\N
c7f5c527-00e5-4685-ad46-e3f2091cab30	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "again", "messageId": "e9f0439c-c4d4-4d77-b4b5-2432be27db8d", "senderName": "Teaher1", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:42:52.042318+00	\N
9147d14e-f917-40bf-93ce-4a356009fbf4	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "once again", "messageId": "4f5c48d5-9859-4390-8fa7-a1a40dc033ec", "senderName": "Teaher1", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:43:10.432984+00	\N
867044f8-89c4-4c0f-9d6d-cc392d913d87	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "all good bro", "messageId": "fdcea82b-e61a-4cf9-a510-406668954502", "senderName": "Teaher1", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:44:23.00846+00	\N
5b8dac79-bcf5-415a-90e7-dd3f0205ea02	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "yes Zeeshan", "messageId": "de7df320-b925-4ea4-9831-40598ebf1fd8", "senderName": "Teaher1", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:52:44.677756+00	\N
9abf2483-f559-4e53-a0e9-2bc81388d5f6	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "hello all", "messageId": "7c5b18a6-b237-4a68-9947-57b320320e76", "senderName": "Teaher1", "conversationId": "c17479bf-312f-469d-b955-bd64d3bddf74"}	2026-06-16 19:53:39.002357+00	\N
72e3f53e-f509-41b4-8f69-05a1836da4fb	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "sab fit", "messageId": "f98e464c-9a81-4a87-a01e-4e5751f693a1", "senderName": "Teaher1", "conversationId": "c17479bf-312f-469d-b955-bd64d3bddf74"}	2026-06-16 19:54:44.056586+00	\N
33d9c0c0-fd1a-4218-81cc-764dcfef5424	4b03d48a-c35d-453c-8427-df046e0583d7	new_message	{"preview": "all good ha ji", "messageId": "980f2c29-5948-46fd-bb8e-aa8896c55d8f", "senderName": "Teaher1", "conversationId": "c17479bf-312f-469d-b955-bd64d3bddf74"}	2026-06-16 19:55:16.828904+00	\N
c378d49c-14f3-46af-a9b5-d07daa84ae7b	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "or sunao", "messageId": "de72b484-0317-4b06-9619-41d5ecdb8ca7", "senderName": "Muhammad Zeeshan", "conversationId": "c17479bf-312f-469d-b955-bd64d3bddf74"}	2026-06-16 19:55:02.691795+00	2026-06-16 19:57:09.296+00
d69233f9-8b41-4107-9a66-8cdad2c4eeb5	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "kya hal chal", "messageId": "557d11d8-4279-4a38-944f-88c3ebe84d3c", "senderName": "Muhammad Zeeshan", "conversationId": "c17479bf-312f-469d-b955-bd64d3bddf74"}	2026-06-16 19:54:19.648192+00	2026-06-16 19:57:09.296+00
cd9d1734-6933-4b52-89fa-512b1195382e	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "yes all", "messageId": "c8241ac9-7b41-481c-94fb-964aa0d1cbb6", "senderName": "Muhammad Zeeshan", "conversationId": "c17479bf-312f-469d-b955-bd64d3bddf74"}	2026-06-16 19:53:52.135754+00	2026-06-16 19:57:09.296+00
ade2f046-41a3-44a9-aa15-f99e9e177c73	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "kya hal ha", "messageId": "268ae17d-34b7-4b3c-a848-e8ade81dc084", "senderName": "Muhammad Zeeshan", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:53:10.673773+00	2026-06-16 19:57:09.296+00
9a1c7509-3ec0-4934-b1bc-b7892b1fc470	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "hello teacher", "messageId": "d13bc228-60a7-4e68-a04c-f78065124e23", "senderName": "Muhammad Zeeshan", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:52:13.298535+00	2026-06-16 19:57:09.296+00
0a0d7732-1c56-4455-ae8c-a5d0eeb9047b	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "got it", "messageId": "e09968a2-ff4f-427c-9d39-8616c0122f1b", "senderName": "Muhammad Zeeshan", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:44:54.878314+00	2026-06-16 19:57:09.296+00
f8e850e0-b8f2-41af-a6f7-939a9a068018	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "what's here", "messageId": "69b97be0-1ca3-44e5-b223-631c3a4d6f30", "senderName": "Muhammad Zeeshan", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:43:54.708578+00	2026-06-16 19:57:09.296+00
673ad8fd-1d34-4c79-b769-d7e9ae518edc	4e266f41-4b68-484c-a235-aa6f9e21e077	new_message	{"preview": "yes", "messageId": "75bffde6-fb2c-4cfe-b24f-76ba837fc6f4", "senderName": "Muhammad Zeeshan", "conversationId": "45f6a418-ea4c-4779-9022-4857cddddcae"}	2026-06-16 19:43:39.557051+00	2026-06-16 19:57:09.296+00
d089e7ee-e0b7-42b2-be92-cc90e20efe0e	4e266f41-4b68-484c-a235-aa6f9e21e077	group_proposed	{"group_id": "b4db6f69-c2b8-468a-a02a-51d462543a5e", "students": 1}	2026-06-16 19:06:09.249966+00	2026-06-16 19:57:09.296+00
2c4e5dc7-e97c-4b3f-91d3-3c5b154f4a95	4b03d48a-c35d-453c-8427-df046e0583d7	group_assigned	{"group_id": "3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5"}	2026-06-20 09:04:28.045348+00	\N
dc456ab4-45d0-408f-8574-0651cb166b34	b8fff6b6-1836-4700-ac90-bfc4b66b7c76	group_assigned	{"group_id": "5a665f2e-b24c-4dd9-9b9b-756d953b706d"}	2026-06-20 09:31:38.204245+00	\N
3da74cd3-be3c-48f7-bd19-b533eb9f0dba	46655db7-e834-41c2-9e26-9472f37ef48a	group_proposed	{"group_id": "5a665f2e-b24c-4dd9-9b9b-756d953b706d", "students": 1}	2026-06-20 09:30:29.813528+00	2026-06-21 08:48:12.395+00
c9a1cd0e-8b7b-4201-9ebf-ef65e26b3aec	46655db7-e834-41c2-9e26-9472f37ef48a	group_proposed	{"group_id": "3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5", "students": 1}	2026-06-20 09:03:14.435296+00	2026-06-21 08:48:12.395+00
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."reviews" ("id", "course_id", "teacher_id", "student_id", "rating", "body", "created_at") FROM stdin;
9214f90d-e8b7-4d00-9704-4fdbe1d4bfb0	a1000000-0000-0000-0000-000000000001	4e266f41-4b68-484c-a235-aa6f9e21e077	f0f988d1-076f-4d66-94f2-194e0fb51341	5	good session	2026-06-15 18:12:44.426947+00
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."sessions" ("id", "group_id", "scheduled_at", "duration_minutes", "status", "room_token", "recording_url", "notes", "created_at", "topic", "prep_notes", "session_notes", "homework_text", "homework_url", "started_at", "ended_at") FROM stdin;
9b4379c2-5e0a-4e4b-9718-7995e94e259f	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-11 14:00:00+00	60	scheduled	6dd7f0b9-ad89-46e4-91d6-541d12946b18	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
3469be7f-a92e-49d4-a743-89b788d35d31	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-14 14:00:00+00	60	scheduled	73c68a44-b876-4538-a23d-fcb60199be4c	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
7ea3fb43-277c-4ed3-b06f-d12764747f89	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-15 14:00:00+00	60	scheduled	5971d316-c886-465b-b7f5-5788b4ff7667	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
fc97d210-3be4-4d82-90cb-a50fedd09e76	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-18 14:00:00+00	60	scheduled	388d588a-9791-48bc-9d75-293ca47163ab	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
23435ee7-010f-4dcb-b1e6-badefdcd90bb	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-21 14:00:00+00	60	scheduled	5724a4ad-e693-4b19-ade5-787ac1372c37	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
57516a51-a4a4-46a6-b35f-e081154d87be	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-22 14:00:00+00	60	scheduled	35d9deb8-157e-4c43-a748-be7ac110cac8	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
abf62b34-f80a-4ffd-a26c-f1421c0778ec	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-25 14:00:00+00	60	scheduled	dcf79317-263e-4564-bc7a-60a2441aca15	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
68d487cb-6b1f-49a1-8d84-5b835bbab32d	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-28 14:00:00+00	60	scheduled	a7fdd247-8757-4d8e-a0b1-eb614cca66f2	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
15b17e8c-3215-4d11-9112-8e16d6a736eb	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-05-29 14:00:00+00	60	scheduled	cbcea38d-d89a-4a69-815d-2d23ece5e533	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
40ab3995-a267-4bc2-b2d0-5c1bb337c968	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-01 14:00:00+00	60	scheduled	dc6abcff-1a79-4716-93d3-5eca74ea998f	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
f38a6f3c-9a60-4ce1-b723-589a0a99c134	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-04 14:00:00+00	60	scheduled	1a51d8b3-0724-42e4-b872-e0a363daf19f	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
5fad071c-d5e8-45fc-b42e-9ab4a3d311d5	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-05 14:00:00+00	60	scheduled	558b4837-d4ae-421f-a95f-b1e92bfd180b	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
54fdd367-8514-431e-b38a-a22e71ae38dd	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-08 14:00:00+00	60	scheduled	a0f851e8-608c-456b-a429-ab44df387bc0	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
61ee4e93-be0d-401b-8b0d-f12b6bda6435	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-11 14:00:00+00	60	scheduled	c771fac2-85c2-4c1f-ad3c-be97e6ae22f7	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
11ddfb11-5b00-48b1-be2a-a127595e69a0	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-12 14:00:00+00	60	scheduled	522eb497-72ff-4343-b6ac-3215db878517	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
85bb5460-b9d1-4168-a865-0739ddaeff18	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-15 14:00:00+00	60	scheduled	c043e147-f8b4-4e49-9322-e7d4bc6c22ef	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
eb1fd72a-08c2-466b-8b6a-3513bdf874b1	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-19 14:00:00+00	60	scheduled	98fddbdc-65c1-49a0-99a5-68c6193e6c9c	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
87e950d3-a32f-485d-812c-144022c32def	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-22 14:00:00+00	60	scheduled	af9dbeb2-fbc7-4594-a2f3-c24e56ab2578	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
6455bcc9-9d23-4e18-a611-70d9663f3590	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-25 14:00:00+00	60	scheduled	35b59cae-99b4-4a18-9a6e-8b1935832bb6	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
09dc85e8-ae36-480e-b378-8ed2bf26fab8	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-26 14:00:00+00	60	scheduled	eb2823c0-30d4-43f5-ba38-7e72539babd9	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
d8fb22e0-1dd9-4507-b787-cf287e5ba570	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-29 14:00:00+00	60	scheduled	48604993-3c62-4c93-a62c-6b272f892d8d	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
a9bb9826-53ef-48d6-bda2-2933f5c2587f	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-02 14:00:00+00	60	scheduled	6d33919a-e9bc-4e96-98bd-84c6415fb9c9	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
994bbe8f-8e3f-40da-9112-1d27f9398e41	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-03 14:00:00+00	60	scheduled	65586d7a-3e00-4fc3-b9a0-3996cef7b501	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
308d928a-4467-455e-9420-a2331765f8b0	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-06 14:00:00+00	60	scheduled	0cf1ce51-2ca5-46b2-ace7-1065ba173168	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
eb219308-e8bd-43de-9d39-37d2d807892c	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-09 14:00:00+00	60	scheduled	8ba4955e-1304-461d-8128-56ab6c117e0d	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
24dda338-4f02-42f6-b980-4311202b8dd2	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-10 14:00:00+00	60	scheduled	63397e42-8a3a-4c15-9cc1-6ca6f3ca41ed	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
2c6ace8d-55a7-463c-b40c-418885b235c1	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-13 14:00:00+00	60	scheduled	db4d0c93-0381-41bd-8dea-c308174db980	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
1d442ae6-334e-45ff-9e8e-168550046e8a	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-16 14:00:00+00	60	scheduled	e2c89f56-46b0-4699-8c41-64460037e0a9	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
8e375be2-06e8-443a-9f2f-724693f55d56	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-17 14:00:00+00	60	scheduled	6ceddbf3-6d41-4f79-8ac5-afb770a8c2f7	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
1e2e2237-881e-47b4-a55d-1aeb2b5ffa70	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-20 14:00:00+00	60	scheduled	887451fb-f340-453a-be7d-e806b25e4f00	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
8fc65997-2b18-4227-8d03-6b454a4160f4	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-23 14:00:00+00	60	scheduled	0da534b7-a3fd-414c-9f38-71de84b2c506	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
34b8dee6-117c-4dba-9b30-c6cee040c36c	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-24 14:00:00+00	60	scheduled	d4c6c623-66da-4372-b441-e5fc40737db4	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
65934b33-836c-4f4f-a106-13608fd3c98d	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-27 14:00:00+00	60	scheduled	0829d93e-95f5-4fa8-8b64-f3c1ff7a2341	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
b9cbbf63-e86d-4268-8e4f-e7bb932083b0	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-30 14:00:00+00	60	scheduled	d6fbc99f-f840-4c66-8783-6446d67ad465	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
113e8a05-c318-45d1-9901-035d03df9c7a	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-07-31 14:00:00+00	60	scheduled	5d9e072e-c9f0-421d-a29a-6a5e211178a1	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	\N	\N	\N	\N	\N
0bef12d8-93c7-42ea-88a1-46a4e8cda107	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-12 04:00:00+00	60	scheduled	41dd2f1c-a90e-4aec-a13c-edcb05ece7c4	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
88640d9a-a243-40cd-934d-7064ac715226	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-15 03:00:00+00	60	scheduled	b3b678af-a526-4a47-b349-beea453fd27f	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
de77260e-2d5c-49f2-bbd4-568ce7e62a08	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-18 02:00:00+00	60	scheduled	b8771426-c348-40f0-95d8-7566f009402d	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
d07e03bb-572e-4381-99ee-e1052395668d	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-19 04:00:00+00	60	scheduled	c47adf76-d106-4bed-ba60-e9a95968cc14	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
c4b56c1c-0109-4e5a-9378-f876fc6046fe	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-22 03:00:00+00	60	scheduled	bbdc36c4-3376-4ad6-8dcd-a46e22210f77	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
ba877fbc-ca8f-4a8c-b178-d75a87f28ad7	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-25 02:00:00+00	60	scheduled	b5c9f2c7-a030-4940-9499-af7764766ee2	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
0b245ba9-56f0-4c43-9aab-30ec2fd21f3c	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-26 04:00:00+00	60	scheduled	0173544c-6a0e-4b9e-a8e8-e6b4ca634dc7	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
fd91975f-fa4f-4644-a446-04a8b74da426	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-29 03:00:00+00	60	scheduled	fd50bdac-7b54-4d6c-a5a5-b1c4c6e6ee45	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
82235630-7526-4c2f-a6fb-9131fc1752ec	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-01 02:00:00+00	60	scheduled	1237622b-cd86-42c4-be42-91a1aa6cf235	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
e768a6ec-2eb4-4939-8183-3d5d783efc81	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-02 04:00:00+00	60	scheduled	4b7ec35e-c3ee-478f-b7d2-376831b32074	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
f555b9ef-795f-4096-8d3b-d8c04463d73e	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-05 03:00:00+00	60	scheduled	980b0bba-392b-47d3-b56e-e0adeb899e64	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
63a212b6-6aed-488c-a93a-d63c9c86b2cc	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-08 02:00:00+00	60	scheduled	1d3062ff-b964-4ff1-b3ba-31f2c0b3dcd8	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
9d178b04-f740-4eea-b1fe-cc20a83756fe	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-09 04:00:00+00	60	scheduled	0ba6395b-4311-4067-9db7-00d899b44b5e	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
98fbd997-d949-4ae2-88fb-d8c624510a9c	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-12 03:00:00+00	60	scheduled	9fe7ef93-4695-4e48-9bd7-70d66a103f92	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
4b407108-7448-45ff-975a-7da50d045372	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-15 02:00:00+00	60	scheduled	9470c9a8-12e9-48c2-9fd9-9004b93b0c12	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
b7de8b5b-04fb-4cf3-88d1-88e077783148	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-16 04:00:00+00	60	scheduled	532b12cf-7b5f-4884-b992-ba1ec959e817	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
3e31c73d-5a5e-44d9-9320-96a922b4c618	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-19 03:00:00+00	60	scheduled	e1a31de0-25ac-48cd-a48c-980653ba791f	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
b216dd75-5926-4b8d-97ff-1e82e4a79405	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-22 02:00:00+00	60	scheduled	e03151ac-c274-422c-8e10-f0d2d09c1412	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
7e08ba5f-5276-4b9d-9d91-90d75df6eca5	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-23 04:00:00+00	60	scheduled	b780c36f-b5c6-47ab-b474-95b701871c44	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
b1bc9ac2-44e1-44cf-b914-d78b57cd5252	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-26 03:00:00+00	60	scheduled	0b8f87d5-28bd-4a33-8ec6-2ee7ae2e0797	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
83038b64-f5ed-4d14-9bcc-8e8e9d185351	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-29 02:00:00+00	60	scheduled	c84fceb9-a10c-4357-a924-2aa65e76c4e9	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
28bec57a-564a-4965-bca6-f6064783bc59	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-06-30 04:00:00+00	60	scheduled	d099633d-b89d-45d8-a488-8f23cd7e3416	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
9bce0d64-f97a-4de4-8183-b52bf8ec3cf5	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-03 03:00:00+00	60	scheduled	db9f6d34-c402-4c6a-9b00-95b30068aa82	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
0e9635f6-0475-4069-bd01-f14d6ca59566	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-06 02:00:00+00	60	scheduled	76109f27-06d0-4f1e-a040-bb8d8365f933	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
1f7239d7-1213-4fe9-863d-326496d13340	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-07 04:00:00+00	60	scheduled	88673cca-9918-43ab-8966-aa4bd0737ba8	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
2e49db63-bceb-425f-9f35-7a8d4c832ded	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-10 03:00:00+00	60	scheduled	9a66ef2b-ea62-4c1b-9e74-ca0258e76bc8	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
ab70be82-0bfc-41db-a11f-d97e7a4b67f3	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-13 02:00:00+00	60	scheduled	fb645796-b941-4cd7-955e-7fece262c763	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
cac30058-6cb2-4fb4-ab34-0cafd09d98ff	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-14 04:00:00+00	60	scheduled	3c90532d-b3a6-4e26-92cb-34e3b7fc1aaf	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
e7ade74c-f96f-454f-b531-e8dbe9256485	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-17 03:00:00+00	60	scheduled	e2942c9e-e758-4fac-9a53-d20f83d0fab5	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
0a1d65c2-aa65-41fd-ac67-86caa94c5e09	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-20 02:00:00+00	60	scheduled	5b0df7a7-ff8c-483c-913a-ccc0fb9f41d0	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
21409e05-b67a-4791-b0c9-038353b9a5b7	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-21 04:00:00+00	60	scheduled	a2a3af9b-224d-4660-a2e2-37f6a28f8c50	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
0cba9baa-d679-4cfc-9eb0-746388be7f24	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-24 03:00:00+00	60	scheduled	179fd738-038d-403f-a1f1-d612f98463e1	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
f4d3a7ec-4102-40b2-97fd-ca5fef962979	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-27 02:00:00+00	60	scheduled	437484ea-e522-4eb0-a852-db68443f4153	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
e4e32ae7-313a-4705-ad65-5770503cceb8	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-28 04:00:00+00	60	scheduled	90bf8bdb-bba6-435a-a781-d2b72c7ea7d1	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
7ef88bb2-5b9c-41c6-b921-966c4f4396c1	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-07-31 03:00:00+00	60	scheduled	2af80386-ed58-4765-9ae0-8f01c1e34520	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	\N	\N	\N	\N
7f8c1a68-88f2-4a3e-aa7f-3acb740d0868	7c3435f4-20ec-4fa2-8e2f-a7e0cbd5fef5	2026-05-11 02:00:00+00	60	completed	60b214aa-b7c9-4696-8a33-882bc93b9cd5	\N	\N	2026-05-05 17:02:32.474985+00	\N	\N	\N	uifhuiefyier kjdhvoiuaef0ier kjdfhvoiaeufjiwo jkdshdiwjf kjdhvco	https://www.youtube.com/watch?v=H6WuJezzCR0&list=RDa7M4YuI-2yM&index=14	\N	2026-05-05 17:40:06.244+00
6b674d36-75d3-4164-83e7-9988acce0dca	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-12 04:00:00+00	60	scheduled	b881e5ed-1074-49d6-b49d-777212f2dc42	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
37cf2292-27ce-4d28-bafe-e29398968597	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-13 04:00:00+00	60	scheduled	d4f8fc0b-abe5-4bff-aebe-3cb27c752dd3	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
de9fe6f5-c37f-4bd0-bf17-dc99dd8a96d3	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-14 04:00:00+00	60	scheduled	e29eed26-1436-4149-bafa-515b377c28ba	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
2ccecff3-a268-42a5-bb67-b448986534b0	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-19 04:00:00+00	60	scheduled	2555893d-4592-4fd9-aae6-e59f229aafed	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
2b9bf2d3-bacb-40fa-a3d0-49c0beaf0608	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-20 04:00:00+00	60	scheduled	b1022d78-1cc0-4c08-ac4f-d4ba96cdf05d	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
8cfa10f6-9db9-43da-88b8-55aa51e951ec	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-21 04:00:00+00	60	scheduled	e87a2f68-f680-43a9-8fa9-cbcde054d376	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
d7a9ad21-9d24-4957-8bf0-b481c3c72144	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-26 04:00:00+00	60	scheduled	7b0b7b86-86d4-48f5-b44e-ddc62ff24c4d	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
ed9e85cf-40c7-4fec-92dc-6a106b95e3bf	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-27 04:00:00+00	60	scheduled	faba970a-5189-4af9-990a-b97692162e01	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
9d5bd6a9-cfbf-4942-b3ad-9da9022fc06a	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-05-28 04:00:00+00	60	scheduled	7f7b6f82-593c-4d25-bac8-235d9a3592b4	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
97fdd3a1-013b-4dd9-b4c7-f535ce5920e0	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-02 04:00:00+00	60	scheduled	4770bea3-a59c-4572-8076-acb7f326f4e3	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
7edc9c35-11e3-4996-ba75-bf2338988e22	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-03 04:00:00+00	60	scheduled	8a3654f1-c043-40f1-a2b3-36a1d092153f	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
4871c5b9-f950-40ed-be7a-34c141710713	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-04 04:00:00+00	60	scheduled	ce38c0b8-8b22-45fd-97a7-905fb0eea380	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
998bfc9b-c98a-4153-a02f-6992a1669636	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-09 04:00:00+00	60	scheduled	dd702684-d86e-4793-8761-5d78f24fcb90	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
a3a11468-3a91-459e-b0ac-52cf1cc3f881	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-10 04:00:00+00	60	scheduled	4c3c64bc-4bd7-4ac8-9a73-676b86e4d5d8	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
17fb1b4a-d0d4-4a1d-bbdc-2992857e7a45	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-11 04:00:00+00	60	scheduled	36388bcc-ece8-4bdc-b7eb-f5025ee609c9	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
4d03e8b6-6083-4054-9c23-849f2aef0b2f	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-16 04:00:00+00	60	scheduled	ebba1ec5-7ba9-41d8-afcf-72feedc9a052	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
4118ed92-b492-43c0-ba9e-eb0beb602e39	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-17 04:00:00+00	60	scheduled	c059f5bf-f669-4c95-aa5b-221c1b53d825	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
fee03dde-e940-4199-97e0-f821ea3a6978	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-18 04:00:00+00	60	scheduled	87409b53-2d52-40aa-8fbc-fcdb78f23cba	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
28fd8c3d-aca6-4673-8056-356b4a6f459a	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-23 04:00:00+00	60	scheduled	55877ca7-f507-405d-b7bf-e7f23f97d638	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
b94b708a-e519-4e3e-b327-5d882acdba7b	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-24 04:00:00+00	60	scheduled	fa3f3417-48f8-4619-bf49-e43cef65000a	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
7deb84d6-4b56-42be-9446-1b186a68777b	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-25 04:00:00+00	60	scheduled	54fb6528-4d70-4391-9e8e-d7e4ae9b70f5	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
c90a773b-9108-44c4-8b6e-c156d25688f3	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-06-30 04:00:00+00	60	scheduled	948df814-9655-4487-8c37-7888e4640ded	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
f47099e5-36c6-40b1-b502-2020203513ef	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-01 04:00:00+00	60	scheduled	d43d3a85-87c6-4976-912e-c94f319058d0	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
2887ed52-a501-42a2-8392-cfb0b1c55c67	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-02 04:00:00+00	60	scheduled	81160da3-5c36-48b3-99a7-6f7145659c6e	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
cdc64245-28ac-4dbd-a5a6-1cb279bac576	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-07 04:00:00+00	60	scheduled	201f7e0a-c413-4c6b-b764-2228aeed7c30	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
3b5ea74a-8641-49b2-beec-4e911601191d	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-08 04:00:00+00	60	scheduled	28a55024-9445-486f-9dab-103ea80d5510	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
a08e617a-68f9-42f7-ac94-95ab6584f27b	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-09 04:00:00+00	60	scheduled	9db4b9ab-834f-4a93-8826-fcd1fcea0131	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
5952142e-ecd0-4c6d-9e95-15b84a2c2b38	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-14 04:00:00+00	60	scheduled	abeffa9c-3ed0-4fb7-904d-21b3580414b3	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
ecdf03c4-310c-4ec1-8b3a-a473c066c68b	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-15 04:00:00+00	60	scheduled	54fa35cf-d3b0-4be4-b27b-7fa2db304a67	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
9e17a173-157d-4822-b20d-12d8706c3d2e	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-16 04:00:00+00	60	scheduled	0faa87a8-3570-459d-9f05-7d86b5ebb003	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
ea2b3c90-bb89-48ff-b2d0-4d5d6c27a700	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-21 04:00:00+00	60	scheduled	6f093c33-7c49-489d-b3bb-fce80364f0a4	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
08bd171d-47b9-4b70-aa54-3085ee219e1a	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-22 04:00:00+00	60	scheduled	9bfbb66a-8703-4269-96f7-109a6b8e3ba4	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
bc295230-2733-4ebb-a1a9-5e6e876dcfad	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-23 04:00:00+00	60	scheduled	55d75aa4-db83-4d5c-92a7-406c477f932f	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
e3aad7e1-9833-4f97-91c5-d80949c8c71b	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-28 04:00:00+00	60	scheduled	a43beea3-6bc9-4cde-b0da-f16c9b4c0dca	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
4e6a63dd-f9f6-456a-9b29-691b91887920	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-29 04:00:00+00	60	scheduled	fa4fdb07-06ff-4e98-833d-3b1a71f39250	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
a963d022-44fd-4c4b-96a9-bfa4df419f4d	de53d55c-8dd3-4a7d-9aba-24cd514e8f63	2026-07-30 04:00:00+00	60	scheduled	e8ee13a0-62d0-4437-abd7-6dfd9f2d9d20	\N	\N	2026-05-06 20:03:57.531404+00	\N	\N	\N	\N	\N	\N	\N
e39bc9ef-ba05-4f09-bfdd-3901b11d3093	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-11 05:00:00+00	60	scheduled	240bde98-63ee-4e0c-a967-e15428beebef	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
d4948a34-779a-421b-ba5e-64305e9dac19	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-12 05:00:00+00	60	scheduled	bb1c5cce-afa3-4cec-bb92-482168630c87	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
d5762f34-8464-4ca5-ba9c-556406ce6ca6	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-13 05:00:00+00	60	scheduled	1efd747b-24cc-42ad-927f-2436e5b89f7d	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
e265deb4-db7e-4895-ba5e-060db7414a42	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-18 05:00:00+00	60	scheduled	61002b8f-fd96-4722-a207-3f1d80ed57c7	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
4491a2ea-e2a8-435e-9e74-891653c1994b	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-19 05:00:00+00	60	scheduled	3b27ed3c-f42d-41c8-93e0-cf14fa46b82b	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
6d4fa9f1-e4b5-4f51-af7c-ac6284f27a0e	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-20 05:00:00+00	60	scheduled	e36c084d-9e2f-4007-8d74-c55e48a56840	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
a3ab387b-ee08-48d1-87d4-588079813991	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-25 05:00:00+00	60	scheduled	e7c1e67d-9990-4642-bccb-5a7aa58e8312	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
d71a9b30-eb20-4942-86bc-b30336eddcd1	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-26 05:00:00+00	60	scheduled	08a8b0e5-45d7-4132-b62e-2ae63b8aa879	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
5ca4c5f3-85b3-4896-a14a-d38d83c4a8be	0433f9a1-c324-4554-bada-f69f55aaab33	2026-05-27 05:00:00+00	60	scheduled	89d1f715-9e0c-4876-994b-27b88f0870b9	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
30642056-a0cd-4ef7-9886-230320e714fd	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-01 05:00:00+00	60	scheduled	e0f126da-94c6-4a6c-bd4e-a52cab8876d1	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
04ac2f40-6a2a-44ff-9a5c-08d196bd0285	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-02 05:00:00+00	60	scheduled	97c8f7ff-4c04-46ff-8018-6fc83b763a45	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
cbfd762e-3ac8-4e41-a11a-8c7265a92171	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-03 05:00:00+00	60	scheduled	027e2ad2-47ad-4a26-9d9b-ee1b179aaad5	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
20f842be-0768-400f-aa14-088723047dd1	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-08 05:00:00+00	60	scheduled	a0536be1-64a3-460c-9808-5aeaa47599a6	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
159a44ac-a578-45cb-9dee-2b74599ee659	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-09 05:00:00+00	60	scheduled	e78cc7e4-78a3-409f-8e76-6e58ecdab428	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
161577f6-1a24-4d22-9f60-3710b32e1bb8	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-10 05:00:00+00	60	scheduled	de531707-3260-47b0-8940-b4e33c47e373	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
e2aaf964-b7d4-4e8f-9ed5-d5c246e97fef	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-15 05:00:00+00	60	scheduled	eb71659c-66fb-4fbf-9a53-90f7a7716a12	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
d3ecd55b-a430-4003-9bc2-0b8959e02a82	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-16 05:00:00+00	60	scheduled	950bcd22-8578-485f-a418-b6faef975a32	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
71639ed2-dde4-49d0-a57b-29fa67ccc811	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-17 05:00:00+00	60	scheduled	2b79ebf8-6f5b-40ca-9a3e-9aedbb41521a	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
ba196ddb-6343-4544-a16d-27782224d2bf	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-22 05:00:00+00	60	scheduled	6ab1127a-6bd6-4126-96cb-b72a6d13eaaa	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
1d3f90e7-be54-4c1d-b518-28b23ef7c993	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-23 05:00:00+00	60	scheduled	fc8e4f9b-15a2-44c2-b6f9-1d0f5b0ccc4e	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
878b679d-b99c-4a37-8bc1-d6ec0ee9434a	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-24 05:00:00+00	60	scheduled	58532d29-9fd9-4239-ae97-f13ab104fb0d	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
6c1f7cab-ea28-411d-99ba-96f112551968	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-29 05:00:00+00	60	scheduled	ca6ec3c7-f7fe-464b-9bee-e35284ea5c7b	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
0c1bd6fd-e9e3-413d-ba7b-46c4c4a2bda5	0433f9a1-c324-4554-bada-f69f55aaab33	2026-06-30 05:00:00+00	60	scheduled	6c9bb9a6-2d80-45c3-9fde-16a900201fe3	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
820f0836-409d-40e8-ad88-7401f3baa59c	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-01 05:00:00+00	60	scheduled	e288046a-eead-4523-b462-2583807c13d4	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
0a94ec10-1dcc-4df2-ab7c-82652665c5f5	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-06 05:00:00+00	60	scheduled	fae67498-7b31-49db-9225-b6860fabd924	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
9f3d7415-e10f-4e97-921e-6ff371ad9c0b	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-07 05:00:00+00	60	scheduled	f9a3dd56-20ac-42dc-b3d4-eb87ad362b74	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
868b43ae-3ebf-4245-9228-ba20d2f08d7c	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-08 05:00:00+00	60	scheduled	018a4322-19d0-4438-8d47-8cba2f9de5b3	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
dc32a02f-17e1-475a-bd32-3463aecacf20	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-13 05:00:00+00	60	scheduled	9ea42cb2-f06c-40d8-b05a-66a997edfa58	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
f753d1f5-453e-46b2-8836-dc093f385f5e	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-14 05:00:00+00	60	scheduled	14b53a7d-daac-456d-8cd0-285ff72ff2a7	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
6264f382-e659-439f-9dac-9fc503f9d50a	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-15 05:00:00+00	60	scheduled	d697aee3-4168-432f-901f-fa5125eeb3d1	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
0b83060f-c87e-4749-a71a-bf88c23f835f	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-20 05:00:00+00	60	scheduled	e8c63854-6cfe-4a54-96ed-3d4f4108ac82	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
15e2abd9-7470-4615-a524-2f0c067ac46c	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-21 05:00:00+00	60	scheduled	d1d6cb5e-6a8d-489c-94c9-1a3b957607a0	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
c7840b4d-e93a-45af-9e5b-3b1daec0d41d	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-22 05:00:00+00	60	scheduled	77560b4b-b09f-47fa-97de-662955461588	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
864d3baa-c70d-4a19-9902-338f600f5ce0	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-27 05:00:00+00	60	scheduled	93b400b3-3cc9-42fb-a4d5-aced01653f49	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
58e1bf72-d79c-4e8a-96c7-3758edb9ca0b	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-28 05:00:00+00	60	scheduled	11b91403-2b58-4684-a307-4cee388d781b	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
12bb86bf-7613-4465-b1c8-834708a81a37	0433f9a1-c324-4554-bada-f69f55aaab33	2026-07-29 05:00:00+00	60	scheduled	f91f0aed-5412-43d6-8298-22c3feb4441c	\N	\N	2026-05-09 07:21:44.021962+00	\N	\N	\N	\N	\N	\N	\N
bbc14610-9d93-4a18-80af-525ae613b097	5e963bab-61ec-4655-a216-020c996e0793	2026-05-18 13:00:00+00	60	scheduled	2abed7ee-399d-4143-951a-6e55e4fe6ba5	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
2793e9cf-7266-4cd8-8a88-6fbc7cd4bef3	5e963bab-61ec-4655-a216-020c996e0793	2026-05-18 14:00:00+00	60	scheduled	ff057c17-cdf2-4371-9924-8daeea2594eb	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
95c750df-3d4f-40d0-972d-c85b985de146	5e963bab-61ec-4655-a216-020c996e0793	2026-05-18 15:00:00+00	60	scheduled	9cad391c-8e88-4144-afd5-a3b91e36ce1b	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
e7358ace-7bbd-4916-8a2e-e1ad7e372af4	5e963bab-61ec-4655-a216-020c996e0793	2026-05-25 13:00:00+00	60	scheduled	a44dec41-875a-46cb-9944-14b0d399a934	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
6978b8e7-9292-4260-a48b-76b15ea6f5ed	5e963bab-61ec-4655-a216-020c996e0793	2026-05-25 14:00:00+00	60	scheduled	f12a4907-362a-49e5-b87f-289fb3ac08b4	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
5d0f6c9e-361a-4ef1-aab3-9bf350fd4689	5e963bab-61ec-4655-a216-020c996e0793	2026-05-25 15:00:00+00	60	scheduled	e6cd622c-d59b-4558-853d-9d94c525108a	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
cdc9bbc1-4992-48b4-87df-3fee01e41a4a	5e963bab-61ec-4655-a216-020c996e0793	2026-06-01 13:00:00+00	60	scheduled	c327c05e-4329-48c1-9c92-23857951f8eb	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
8db6c3af-3322-43d6-99a1-c8b624327c9b	5e963bab-61ec-4655-a216-020c996e0793	2026-06-01 14:00:00+00	60	scheduled	dc24588a-a869-4428-86a9-44b4ff01a4fc	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
79c5fff7-fbbc-430c-8237-bc4cebcd7941	5e963bab-61ec-4655-a216-020c996e0793	2026-06-01 15:00:00+00	60	scheduled	f00465ed-13af-45e5-bb29-adc84b1c0637	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
f22fda6c-41d7-4123-956b-5b954e5b8eda	5e963bab-61ec-4655-a216-020c996e0793	2026-06-08 13:00:00+00	60	scheduled	d09e203a-68bd-48a6-a88b-93a9441d3826	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
4cd8d8af-332a-4e6c-a735-baaa917f5c91	5e963bab-61ec-4655-a216-020c996e0793	2026-06-08 14:00:00+00	60	scheduled	3d4ccdd8-0426-4dce-a9de-c338b48dc106	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
c143aa6a-29cf-4a3b-be62-54a607c7cccc	5e963bab-61ec-4655-a216-020c996e0793	2026-06-08 15:00:00+00	60	scheduled	20c3808a-b1af-4bdf-a173-a8b53a0c1d6b	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
811bb602-1456-4179-86d0-bbbfa83bae7b	5e963bab-61ec-4655-a216-020c996e0793	2026-06-15 13:00:00+00	60	scheduled	a9206620-66b8-4a30-a163-9e6f713c7f52	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
119c5b15-e30c-4b6d-9758-bcc4df66e7a9	5e963bab-61ec-4655-a216-020c996e0793	2026-06-15 14:00:00+00	60	scheduled	8483c174-9d5d-4d58-9bba-1cf0637fcc6f	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
bb501269-c488-4772-952c-1735b9315f73	5e963bab-61ec-4655-a216-020c996e0793	2026-06-15 15:00:00+00	60	scheduled	b0387583-2986-43e8-9747-c27b24507caf	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
6864c64c-eca0-4a9a-aaff-e970f70da510	5e963bab-61ec-4655-a216-020c996e0793	2026-06-22 13:00:00+00	60	scheduled	87957670-2da2-4880-9452-2fe11134e978	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
aa8366a2-0cbc-4733-9b21-4c32dbd6c590	5e963bab-61ec-4655-a216-020c996e0793	2026-06-22 14:00:00+00	60	scheduled	d7cc68d6-0c4b-41e2-a03a-a3584c5665e8	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
133fd836-e334-4f6b-a1ff-645c252121bd	5e963bab-61ec-4655-a216-020c996e0793	2026-06-22 15:00:00+00	60	scheduled	ce9c1850-c90a-4c05-9404-9cfd6bc79b1a	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
1a64bac7-6662-4a9c-ac3e-b98af0ac8d79	5e963bab-61ec-4655-a216-020c996e0793	2026-06-29 13:00:00+00	60	scheduled	6bdb6e2c-0290-4882-b662-3044357594a8	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
7fdbc9ab-20aa-4964-9e86-d0bdac0599cd	5e963bab-61ec-4655-a216-020c996e0793	2026-06-29 14:00:00+00	60	scheduled	c5bba5fb-2101-47bd-816b-24ab44c99f2e	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
7a9b557e-8346-4776-907b-21ed59a14948	5e963bab-61ec-4655-a216-020c996e0793	2026-06-29 15:00:00+00	60	scheduled	24d8ea08-f845-4d9a-be4b-0cfd7c1432f8	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
b4a7ca93-97f0-42e1-9b4f-a6ad30c72c2c	5e963bab-61ec-4655-a216-020c996e0793	2026-07-06 13:00:00+00	60	scheduled	8816b021-d348-4e16-90ef-20d48ca2c5c8	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
5c9d2176-54a3-4ee3-9659-cbe06d2fa38f	5e963bab-61ec-4655-a216-020c996e0793	2026-07-06 14:00:00+00	60	scheduled	29deed67-7c1e-497a-8a76-308d41e8e9f9	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
9535a119-e665-4991-93b4-406d7d7a90f1	5e963bab-61ec-4655-a216-020c996e0793	2026-07-06 15:00:00+00	60	scheduled	bbb81a33-cf20-4599-b921-7d4c2b5b509f	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
c97938b3-744f-4048-b491-7b306e260c38	5e963bab-61ec-4655-a216-020c996e0793	2026-07-13 13:00:00+00	60	scheduled	27b95c2f-021c-4fcf-8e43-334a9ce6eaa3	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
e81687ef-8aa3-41f4-afbc-8a17b423ea71	5e963bab-61ec-4655-a216-020c996e0793	2026-07-13 14:00:00+00	60	scheduled	9e913f26-a0f8-411e-aa34-62e5987dfcac	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
5ffdb27a-04b9-4cd2-a4c1-4c6a4d1ec4b4	5e963bab-61ec-4655-a216-020c996e0793	2026-07-13 15:00:00+00	60	scheduled	1f5fc3b9-8acf-4c8f-9097-19c43aeb5ffc	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
e6eb8001-7e06-40f5-abfd-f09a6b024422	5e963bab-61ec-4655-a216-020c996e0793	2026-07-20 13:00:00+00	60	scheduled	99be194a-691e-4353-b68b-94471d6ef8eb	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
3e72a0ef-ea05-42d8-b2f1-dc05d2de9f6e	5e963bab-61ec-4655-a216-020c996e0793	2026-07-20 14:00:00+00	60	scheduled	01c29ca3-2e0d-4a53-a933-4ba237db2c71	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
51af97e6-a92b-4394-a638-090e5e33f143	5e963bab-61ec-4655-a216-020c996e0793	2026-07-20 15:00:00+00	60	scheduled	0b2b22a0-0386-4fc9-8f85-7875ad557857	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
a4c0aee8-83c9-4840-a444-7a536707d21d	5e963bab-61ec-4655-a216-020c996e0793	2026-07-27 13:00:00+00	60	scheduled	6ff7e831-dad4-4ac2-be92-2f24cbf583f3	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
b60135e9-d72c-4213-aeac-593d5abe58e6	5e963bab-61ec-4655-a216-020c996e0793	2026-07-27 14:00:00+00	60	scheduled	e758aebf-cbd3-473a-8848-8b089e225f7d	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
ebb1bbf3-d7eb-4049-a1fb-8e7c00fe6974	5e963bab-61ec-4655-a216-020c996e0793	2026-07-27 15:00:00+00	60	scheduled	981d85ac-51e4-4582-9ac0-4778e3e5ebe3	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
a70e76ee-b1dd-4995-95fb-710f7ec6a94d	5e963bab-61ec-4655-a216-020c996e0793	2026-08-03 13:00:00+00	60	scheduled	f3e13d14-e36b-449b-989a-094eeaaf31ec	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
ad626a3e-1729-440c-9cbd-10d341ee215a	5e963bab-61ec-4655-a216-020c996e0793	2026-08-03 14:00:00+00	60	scheduled	e9c33bfe-3e5e-4441-a4c2-4a2e2eab519a	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
211e999f-47dd-49e7-b225-6378038a41e1	5e963bab-61ec-4655-a216-020c996e0793	2026-08-03 15:00:00+00	60	scheduled	68ff980f-c16e-4b8d-afcf-8d96be9cade1	\N	\N	2026-05-11 18:03:16.092534+00	\N	\N	\N	\N	\N	\N	\N
bb70a03e-a35b-4eb1-8b54-046ad13ff9b2	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-05-19 02:00:00+00	60	scheduled	b492f1ca-e08b-4c5c-a094-877b4c0aa1f6	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
5baa6241-0d51-4730-8db0-63ac0e9baa64	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-05-20 02:00:00+00	60	scheduled	aacc97e1-605a-40b6-a6a2-7e0d3baa6d79	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
ebf5a268-bfb4-4ef2-9ae4-199655334bdc	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-05-21 02:00:00+00	60	scheduled	52601f42-c75c-4771-86e1-79781d59c2ae	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
bcace3b9-e6a5-44c0-8819-0e9cb1c65745	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-05-26 02:00:00+00	60	scheduled	8d032c7b-4b67-4e5c-bd21-21d59688a223	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
a157431d-7427-4d43-83dc-ff7157ab6fe9	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-05-27 02:00:00+00	60	scheduled	c8665435-bab6-4e60-ab5f-23cf6fa996d1	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
a8f32621-7ba9-4be0-88e8-235fe17b6174	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-05-28 02:00:00+00	60	scheduled	bfbd65a6-1dc5-4ec1-a217-68522be32743	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
b29cb65a-ae0c-4ed1-ab35-0f4f433d6be9	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-02 02:00:00+00	60	scheduled	c095644a-eee5-4a9e-aed1-2ea52610d4c5	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
097acc30-186c-4804-b0d2-5e836ba27ffa	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-03 02:00:00+00	60	scheduled	1fb169c3-f175-4318-94f5-c4f025521a17	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
e10712f0-0f56-4ba3-a432-12919902f333	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-04 02:00:00+00	60	scheduled	bea58411-5db7-4d34-bb62-d038bc73fd54	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
c77942c2-57d7-4f5d-a9db-37d29bbc32b1	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-09 02:00:00+00	60	scheduled	c113f49f-5b6c-4aa3-be43-c6eaf691859d	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
06e42a4c-28db-430f-b2fd-d9831ece15d2	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-10 02:00:00+00	60	scheduled	2c2b3bd5-8c05-4aaf-b4a0-d456c34d4794	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
2031b9de-bdd8-41a0-b62e-5d30de199331	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-11 02:00:00+00	60	scheduled	5030bb77-e455-481d-95cc-a4a811d1e7b6	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
1f04bd4e-0471-42e6-89c9-6218c5c59077	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-16 02:00:00+00	60	scheduled	eb246fc3-3db1-47a5-bbf3-60d42b1a5dc4	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
a7aa9d0d-d482-4d90-9bdd-2b4026e716ea	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-17 02:00:00+00	60	scheduled	839abbf9-31c9-4742-b932-309fdcf16e1a	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
62319a28-dc4b-4d1c-888c-47851f5bc290	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-18 02:00:00+00	60	scheduled	b2aefcfe-e8d4-4c6e-bb44-138f73209ccf	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
c056e13b-e7a4-48db-9760-98759c165a87	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-23 02:00:00+00	60	scheduled	77c39f29-846a-49b8-ab29-cb9390ca3eaa	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
b73fa17b-5776-4473-9001-429b481249de	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-24 02:00:00+00	60	scheduled	f94058ec-1740-4852-85ae-fa8c7c383956	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
7858591d-5068-4cae-8056-2074fe35403b	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-25 02:00:00+00	60	scheduled	f2b73767-c07b-4aec-8c27-dd378c9a03f2	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
a7879f19-adfa-48ce-b66e-25c15a5e2cce	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-06-30 02:00:00+00	60	scheduled	6d207666-c318-472c-b129-2562b82044a2	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
6dc54a16-86d7-499f-a67f-5e8f6d2fe3df	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-01 02:00:00+00	60	scheduled	46b11293-4fae-45e6-8092-b340ed2738d1	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
9c64d85c-c72b-4857-b6f6-7c197a763b6a	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-02 02:00:00+00	60	scheduled	bccca70e-610e-4997-ba18-9004d6ebf42a	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
f4a3d5c6-eb2c-45c1-b9fa-0d3906ce239f	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-07 02:00:00+00	60	scheduled	6f70cc09-b296-4326-98ce-f641c8d69cea	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
aa6be5d7-f615-42f8-a1b3-97d6ab235630	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-08 02:00:00+00	60	scheduled	1ab06938-dc30-4167-a5e0-12d3b1c39ffd	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
00558f82-eb6b-4a28-974f-062e7c903e22	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-09 02:00:00+00	60	scheduled	7599a282-433d-47de-a924-7eccf37ebbd8	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
7664c2ef-2c0f-403a-9222-9c6585bff53b	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-14 02:00:00+00	60	scheduled	f2974943-070c-47c4-98a9-8866711f0a12	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
62c82ed5-94a1-4971-8f75-5c55d7cc97c2	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-15 02:00:00+00	60	scheduled	23df8f17-dd02-4574-b53f-87265f1ebd89	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
95229855-f262-4d3b-bbb5-6e73932f6a3c	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-16 02:00:00+00	60	scheduled	5f1ff7c9-161d-42f7-a8b1-12fbadef78a9	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
8978f59d-8149-400d-adcf-413d783eaa96	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-21 02:00:00+00	60	scheduled	51a960a4-253f-4217-85dc-dbf30e341431	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
054be86e-db31-409c-b1dc-64f160ce3ed4	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-22 02:00:00+00	60	scheduled	485128ff-5576-476d-9674-60be32028011	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
a4b7a555-d826-4e50-89e4-8f6b483f2ba7	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-23 02:00:00+00	60	scheduled	20938119-22f4-433a-85ac-3c3ac454b8ac	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
5237ce4a-d806-4aa3-96ca-96cd17db3f35	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-28 02:00:00+00	60	scheduled	021753b8-23cc-4616-a4f0-ab4bdda0fd80	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
183fd33d-7421-429f-8e0a-45f351a8da6e	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-29 02:00:00+00	60	scheduled	ac28d273-eb24-4319-b8fb-ebd5d556a055	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
1ef25267-baed-42f2-a550-b0cd244a367b	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-07-30 02:00:00+00	60	scheduled	25eb0095-5f95-4b73-8951-6f99e64e611f	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
a0843f11-5d4e-446e-b097-40fc2a454b0c	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-08-04 02:00:00+00	60	scheduled	c7497bf1-e94b-4603-9bc4-517dd84b1faa	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
d13cc2fe-caae-448b-86d8-8a460c86498e	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-08-05 02:00:00+00	60	scheduled	29639da0-d2c6-482a-98f0-4993f82729fb	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
d730a2ae-f2d9-4ba9-b92b-2df0e87cab78	414127e6-c0c5-4044-99bd-a16cf4d29aa7	2026-08-06 02:00:00+00	60	scheduled	63762404-d65c-4fe1-acee-a90ad9c6fd28	\N	\N	2026-05-11 20:20:03.567668+00	\N	\N	\N	\N	\N	\N	\N
7d53156a-a104-4670-abf4-bfe24b632d0f	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-05-18 16:00:00+00	60	scheduled	81ba274d-d2e9-4c75-aa76-e03b6f8ca46a	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
ca635886-72b6-433f-a1cc-7bdd1fd050ba	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-05-19 16:00:00+00	60	scheduled	8b0b0127-9d57-4f1f-91d7-f69e7a19c68e	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
64f83c4a-a79c-4fd8-b9f3-9a11d84cca5c	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-05-20 16:00:00+00	60	scheduled	80cef760-1a63-4558-a0dc-ffff91466fa4	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
a31a7627-599e-414e-9b06-5b0bdadcd3e6	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-05-25 16:00:00+00	60	scheduled	e6958098-ff08-42c3-b7b4-0a67fde564a6	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
e1bbad57-0f94-4bc0-83ad-7bced6fcceec	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-05-26 16:00:00+00	60	scheduled	6e92ffd4-d7e7-48f4-8776-2e1ed0ffe7f3	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
7b55aa06-4405-4f0a-af1f-f16d370fb215	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-05-27 16:00:00+00	60	scheduled	46dbc6db-158f-4aa1-9cce-dcbdda225c14	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
9b940611-ccfa-4966-a1e5-9b0d6bf908ce	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-01 16:00:00+00	60	scheduled	2c8bd0b9-52c6-402a-877c-1fba4b079b5d	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
2496a7e1-67ae-4fe8-865a-f62894f918e3	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-02 16:00:00+00	60	scheduled	90ade8ad-dead-4ba6-8a35-5146fd525a20	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
93d914a5-0086-4ef9-8e51-5df2f5ee7308	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-03 16:00:00+00	60	scheduled	22e9c10e-1a38-4383-8d8e-5d4f3ed0a6b3	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
a3521c78-de51-4d71-90f3-549b19c2c103	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-08 16:00:00+00	60	scheduled	4131ed52-f65a-40b3-872a-cad159e931ae	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
1b545e73-6b63-4b07-9144-a4176593220c	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-09 16:00:00+00	60	scheduled	e7643b7d-8934-484b-a106-4d8ba0ccc3f2	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
4009ecd8-bafd-4afb-8033-04ed3dd86133	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-10 16:00:00+00	60	scheduled	26aacf72-aa39-4390-9eea-9ff6da8c2f77	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
62af3c3d-a24b-42ef-9283-d11a4468f903	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-15 16:00:00+00	60	scheduled	0e552161-5d16-49cf-a6da-0be955b97b5b	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
2ad93409-0927-43e0-8917-b0febcea0819	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-16 16:00:00+00	60	scheduled	74493135-c487-42db-bb79-268d096aacf5	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
06c0dca6-1ef5-4431-8cd2-477d060134df	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-17 16:00:00+00	60	scheduled	525c987d-b152-4083-856e-633c8f409870	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
54f6a2e0-69fe-41f5-a027-270eb8193a2c	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-22 16:00:00+00	60	scheduled	0af4efda-4a84-48c3-85d3-08efd4e1b0e5	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
7f81c901-a4ba-4db8-bbc8-7b0b456d4315	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-23 16:00:00+00	60	scheduled	ae2ce6b5-4c8b-4ea3-8347-35ed2f4c4b8a	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
6097bf18-3e7d-4bc5-bde0-a2f1a6dc3aa1	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-24 16:00:00+00	60	scheduled	87caac54-5b2f-4937-8c1a-acfd20769c72	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
0c16561b-e32e-4eea-9780-8568932fc6ce	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-29 16:00:00+00	60	scheduled	96bdce09-2846-4811-a20c-2b6b3981cb6a	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
70cdcb68-20bc-4a5c-b49f-db24b548ad9d	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-06-30 16:00:00+00	60	scheduled	c9fc7dd5-5212-42ff-8c95-09d732c14d70	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
093e80c7-74f8-4007-a811-2a37de72eb44	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-01 16:00:00+00	60	scheduled	043e5d06-8dac-4dc2-b6f9-ff7559cbbe6f	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
6b57cfd2-077c-4722-97df-8440c31362bf	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-06 16:00:00+00	60	scheduled	67207c3b-8c34-422b-80a8-2e4c000a368b	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
d3f34a9e-d920-4129-9261-8a4436df3e86	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-07 16:00:00+00	60	scheduled	af522460-7604-4a78-8b3b-0c633d4bdf76	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
8ca34c77-06bb-4a17-8166-1c23ddabc103	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-08 16:00:00+00	60	scheduled	5e409dfc-d169-4e37-8f83-4117cc897d20	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
58f1f269-5fca-43ed-b757-c3d7b47d0178	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-13 16:00:00+00	60	scheduled	7498265b-8868-4bac-8e15-41a58a79f189	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
f9ebf305-6d8d-4b9d-9a40-f85826758a3e	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-14 16:00:00+00	60	scheduled	afaf27f8-7e01-4391-9064-4216e75fc0b1	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
101302db-bd61-433c-b7bc-78e2f8f0d510	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-15 16:00:00+00	60	scheduled	f5cf9b64-3126-405a-90f4-8dabf69e92cc	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
b864fca6-a626-49d4-87c8-747562318166	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-20 16:00:00+00	60	scheduled	71bc6d0b-b685-4248-8139-9e2cf07e27e0	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
030d310b-91f2-4e18-b9d5-4397bd0e9105	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-21 16:00:00+00	60	scheduled	3c759ca2-b2da-4c6d-aa88-5d86f2ef88c2	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
1185c828-e3af-48b2-927d-f28c869270ad	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-22 16:00:00+00	60	scheduled	754d8d84-6cb7-47d0-9c5d-fa5f53c08af0	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
0ac01d80-7af7-464d-8d22-c7ea58d81809	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-27 16:00:00+00	60	scheduled	ba3d7ea9-fd4f-4f91-a4f6-0334fbcf609b	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
04997519-b091-4da4-a330-83eddfae8cae	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-28 16:00:00+00	60	scheduled	5f09032b-9c91-467e-b634-5c0eecc476dc	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
014a304d-e824-4595-890e-181a1e36157b	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-07-29 16:00:00+00	60	scheduled	baadbb08-57d1-42e9-b3a8-02895f9a21dd	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
6a26c7b5-dd37-4381-a80d-d3ff243f116e	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-08-03 16:00:00+00	60	scheduled	5e83e1b2-caa8-4c2b-a3d3-31ebfa7844dd	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
a2eebcae-0d46-4031-848e-ad6c07dc9df2	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-08-04 16:00:00+00	60	scheduled	97155c0d-e86c-483d-8e38-4cd9ffb7d2b2	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
384ef972-5685-4ac2-bdbb-dd0501b7a885	2068231b-e72a-4c2e-a43b-cbc1e0becefe	2026-08-05 16:00:00+00	60	scheduled	26d55ad7-96cc-46fe-9bc7-206608633fb6	\N	\N	2026-05-14 17:31:18.584362+00	\N	\N	\N	\N	\N	\N	\N
f83097f2-6115-4c71-aa48-a74baa53d201	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-06 16:00:00+00	60	scheduled	eba4cfcc-e18e-42de-ac96-c5351f4b126d	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
2ff00a46-5bef-49fa-ab27-f806b14e8be9	b1d8e464-0012-4538-b1bd-cf3649a933b3	2026-06-18 14:00:00+00	60	completed	713910cd-8d98-43a6-8f48-74bd7c040e20	\N	\N	2026-05-04 17:23:22.503746+00	\N	\N	this is testing sesssion how was it 	please fix the grammer	\N	\N	2026-06-15 18:12:22.831+00
f75a49ec-d5a0-4a45-8074-ba2047b7382c	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-06-22 16:00:00+00	60	scheduled	fd9122e1-eb5e-456d-bc04-fe77ac8cf15a	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
4c7d2542-a943-4b0f-9bf9-344601d4b069	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-06-23 16:00:00+00	60	scheduled	be891948-1e9e-4e43-9b37-a56874f48dc9	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
11827ed5-fcfc-4121-b7ab-f29a4f72e56f	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-06-24 16:00:00+00	60	scheduled	9a3a27ad-5c15-4cc0-a7cd-4268c185be27	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
f0009157-726d-4b15-afb0-b1bbe2189eab	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-06-29 16:00:00+00	60	scheduled	99630da6-12e4-4603-9eea-b46d73a83902	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
dc9b397e-301c-4655-9c36-de98694d345f	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-06-30 16:00:00+00	60	scheduled	1190c885-59bc-4ce1-89f6-22a45084ff3c	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
659e38f5-9827-4adb-998f-ddc08878b215	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-01 16:00:00+00	60	scheduled	a01fddb4-9aa8-4d2d-90f0-29af3f00a3e4	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
be1663ed-f07b-4bb4-9749-03780c25d4f7	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-06 16:00:00+00	60	scheduled	6cb61f15-1529-4052-89cf-ae94cd9ba9a6	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
d02d01aa-5167-431d-9307-c0012e25159d	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-07 16:00:00+00	60	scheduled	6f794d48-16b9-48ba-b437-aecb5c3b15df	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
65b6338a-265d-4340-988d-b96a0875d068	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-08 16:00:00+00	60	scheduled	870bd8c7-371d-4ec8-8d91-f2e2bcb91f60	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
59038991-55ac-4e4c-808a-9952b55a9802	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-13 16:00:00+00	60	scheduled	1bcec141-6064-4808-956d-988009a4e51c	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
db7d0f18-3053-4172-863f-23b3ed368efb	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-14 16:00:00+00	60	scheduled	3d54e5cc-3982-4cd7-9e3d-002559b207e6	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
65607cca-9b33-4996-af41-2f77ae52448c	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-15 16:00:00+00	60	scheduled	dfeb7e3e-1ff5-4784-a900-1eaf8cbc393b	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
3985d99e-a12f-4c99-bf72-09df05cdbdcd	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-20 16:00:00+00	60	scheduled	0cd371b3-a91b-46ee-9ddd-9948fdd1aed3	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
4b0fc548-a9e7-4c07-9114-4e78bca81292	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-21 16:00:00+00	60	scheduled	cef6131c-3c22-4486-865c-f92424a9d94b	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
df97d713-e13c-4a52-aab1-1fea06d9c9f5	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-22 16:00:00+00	60	scheduled	e483202c-11e9-473c-9770-069eab4ee9d4	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
478f513e-a94b-4540-87da-978b4a1ab4d2	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-27 16:00:00+00	60	scheduled	5732b17a-4e65-40d6-b46d-5ee9c6bce50b	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
499ccc9c-24d5-41f6-9d2b-532468c648a3	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-28 16:00:00+00	60	scheduled	6e0b98f7-50a7-4c36-8883-edd6c5d31a46	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
213cbbd8-f8cb-4f01-8d4f-c806310b9ce1	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-07-29 16:00:00+00	60	scheduled	d37b432e-eaa8-41be-843f-9a2c0285541c	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
b490abab-59d9-447a-a298-fbfa3f77ebea	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-03 16:00:00+00	60	scheduled	d1e9fe4b-351b-480d-95a3-ace47c836a2a	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
06b63766-f3c4-4ebf-9152-9d3fd932dda9	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-04 16:00:00+00	60	scheduled	3319c8d7-48bb-43e2-9b15-9199ec72c754	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
b21e9357-61a5-4321-b8b1-ca9016c759a3	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-05 16:00:00+00	60	scheduled	e141e443-5a17-4c74-aa14-e9af34dfeae2	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
309d7288-88c8-4026-aaf3-df1a4e8e27c8	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-10 16:00:00+00	60	scheduled	d1a52b79-6f1a-487e-8176-21cea820d812	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
8d149060-71a5-4ef7-bfd7-d5605b4ff0f4	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-11 16:00:00+00	60	scheduled	583bfeb0-3ef2-485d-ad94-3909f1b5a9c8	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
0c924f09-79e7-425f-a57a-81087ebf73bc	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-12 16:00:00+00	60	scheduled	949fec7c-57a0-44cc-9c67-3c3f18c1453b	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
967dd09c-7590-49e7-ad52-4b1aefd80cce	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-17 16:00:00+00	60	scheduled	43e70465-a857-4d0e-a98b-bfcaebdb0d50	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
aaa25a0b-ecaf-44bc-a7ef-b268aa10f72f	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-18 16:00:00+00	60	scheduled	271305f2-0a7c-4e74-9318-eb28627e13a4	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
230049a0-2cc8-4e6b-984b-2b53bb508b6c	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-19 16:00:00+00	60	scheduled	470ca7ae-9a26-465b-b7af-50dc76481f13	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
fb99c178-b173-498a-b4d5-57e93655f626	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-24 16:00:00+00	60	scheduled	2ba83ad5-7ade-45c2-9103-abb01295156a	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
673af8be-50ff-4919-87b3-a68977d6c008	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-25 16:00:00+00	60	scheduled	7f567c37-66a8-4207-be8a-e385897c8f3f	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
1493729d-28e1-4f55-a865-b1aabc17f0d5	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-26 16:00:00+00	60	scheduled	88386465-826c-47d3-a858-c9702a0792eb	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
79c86475-920f-4a95-978a-a4b875b01c52	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-08-31 16:00:00+00	60	scheduled	77e274a4-756b-4439-bd91-d200c63347c6	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
5cdb3b4e-2a9a-4be7-acf5-61e696579db7	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-09-01 16:00:00+00	60	scheduled	8454fb79-3b16-49a1-aa16-92b3643ce6c2	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
6ba45dde-6ffb-4902-b135-1d524a06e2e5	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-09-02 16:00:00+00	60	scheduled	9a0112b7-7a07-46e6-82ec-74179024e1b6	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
1232b6d8-0691-41f0-8648-1060ecd5f17a	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-09-07 16:00:00+00	60	scheduled	570edf0c-7494-484d-b16a-ad2291331b08	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
de9c7c83-561e-4224-bc4c-e3686390dbf2	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-09-08 16:00:00+00	60	scheduled	8b566130-0f85-4054-87a9-69f1f1438a78	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
1b789483-6083-498e-9460-39ab7f1fd77e	b4db6f69-c2b8-468a-a02a-51d462543a5e	2026-09-09 16:00:00+00	60	scheduled	72190766-3419-40a7-b82f-e28085692f95	\N	\N	2026-06-16 19:06:08.854858+00	\N	\N	\N	\N	\N	\N	\N
7d03fabe-0df4-4200-a0a5-d468440e5cd8	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-06-23 16:00:00+00	60	scheduled	78cfd95b-cb4c-4f12-9a0c-be8ce2a16949	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
4dc8490f-25dd-4299-ab9e-ee69768a61ab	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-06-24 16:00:00+00	60	scheduled	79646544-998a-44a6-b111-c481116cb103	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
fb5fe712-848e-4622-ad1f-34b62c75ff3b	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-06-25 16:00:00+00	60	scheduled	b5086f59-9a7c-43d9-af2f-295665ab50ae	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
77a3460d-0f5d-42f6-9dcb-c6eaa043bc4a	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-06-30 16:00:00+00	60	scheduled	af6124e8-5ea0-4334-800e-c59e05ed1702	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
6b2ec1c3-fb10-4258-9cd7-1e1d3155b9fe	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-01 16:00:00+00	60	scheduled	84690804-5243-4951-b2ad-7e4f6e88cc5b	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
791c3c79-55bc-45a9-8ce2-28880d5626f0	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-02 16:00:00+00	60	scheduled	a1819f22-c54c-46c8-81cc-02bc5fe8006f	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
14dced0c-aaea-4d0e-95ae-b2e4dcf243fc	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-07 16:00:00+00	60	scheduled	400fdf46-be9b-4a3e-9ecd-463f21e2e872	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
caa8cac7-e9b9-40c9-85e0-6ae28dc59ae7	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-08 16:00:00+00	60	scheduled	e777fb86-341b-4003-bfce-dc53281ce3f1	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
4647893e-5060-423f-82b8-40e38470dfca	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-09 16:00:00+00	60	scheduled	f303a597-e078-4c51-b5a0-a61430decbc3	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
225439e1-8fcd-47d1-be60-ee08dc5a70f0	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-14 16:00:00+00	60	scheduled	f6a2a881-a849-48d0-871f-30cbc701afd2	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
196ae443-515b-4457-adce-f15111821ff3	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-15 16:00:00+00	60	scheduled	109e7ab5-c92b-412e-af8e-3a6e2e540c85	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
86ec1b69-a112-4397-9a24-8942d38fdc40	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-16 16:00:00+00	60	scheduled	ffb5cf66-4787-4f5b-8dc6-3edce35ffeb9	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
ccd93d47-688d-4cfa-a56e-a9a09e70d5b1	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-21 16:00:00+00	60	scheduled	563637de-0363-494a-8996-9db0302e4e57	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
1fa668d6-2ff7-4044-b305-226135d572d5	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-22 16:00:00+00	60	scheduled	15c8edfe-f5cc-42df-87f5-bcbb41d23a03	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
5675bdb4-1f3e-41dc-8c24-6bd4aad3c016	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-23 16:00:00+00	60	scheduled	5fff0dc5-103d-4d79-bab6-6f3720c58782	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
b55179fd-bc56-4826-bd1b-400c91dc0f6c	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-28 16:00:00+00	60	scheduled	f6e5a9be-41e7-4c56-9f0e-e1ab23a8919d	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
03a38a0f-9bc0-48bd-8f52-425f904f5847	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-29 16:00:00+00	60	scheduled	14b1ff2a-dd9b-4b7e-8b3e-5969ce69895d	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
2eb4b5b3-5a22-4640-8826-677f880872ec	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-07-30 16:00:00+00	60	scheduled	095dc0c1-9d9b-4df2-b4e6-262e359af870	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
a55cf47b-df3b-4f8c-856a-6e5f0092965d	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-04 16:00:00+00	60	scheduled	a1ed1baa-657b-498e-a500-a574064484d8	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
bef33591-0f7d-4cd9-8045-4b1ccfda962b	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-05 16:00:00+00	60	scheduled	9ee855db-406b-4c5d-98f0-8d43e9e6d1d7	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
9a4bbfa9-c0a0-4ab2-b97f-6c02e6cc1e9c	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-11 16:00:00+00	60	scheduled	4b9915a6-83a2-4bda-90f1-b893c2f962e5	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
67868311-0006-4481-802c-0e4a9b6c803b	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-12 16:00:00+00	60	scheduled	db79edd4-8a6a-484b-ac6a-ccb23532a2fb	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
3e9cbc4b-b342-462e-b047-8114bafefcc6	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-13 16:00:00+00	60	scheduled	f2b7e904-8210-4e42-a91f-cf0099a259dc	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
5ee59cfc-2cf0-476b-b70e-eb626d3d887f	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-18 16:00:00+00	60	scheduled	56be24c8-79a6-4934-820d-3e0485913c75	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
715293d1-199e-4adb-86f5-f1f2bb612533	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-19 16:00:00+00	60	scheduled	63bd45ed-e518-46e5-a50b-f4bea52650c5	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
99f9e71a-dd3c-445a-9ece-021b57d04637	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-20 16:00:00+00	60	scheduled	6ecb9466-1c07-4440-9e4c-804f75845bbf	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
6f0ba057-7b0a-4efd-9926-7ebd022565da	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-25 16:00:00+00	60	scheduled	97cf230c-b96a-4d30-be5c-5a1d1cc3f9e6	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
3a8110db-94d0-4490-bab2-4fd8331a4c7e	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-26 16:00:00+00	60	scheduled	f7a4e053-cb34-466d-ac5a-fc04e4bf194f	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
192bcccd-125a-435d-ad61-500291c52492	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-08-27 16:00:00+00	60	scheduled	d8fa3afd-c7a6-4029-997f-536c8e50ea52	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
5b3f2f1d-0aad-414f-bf48-0f5fd6b4cd30	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-01 16:00:00+00	60	scheduled	83939d7d-b566-4e2c-b1aa-b31dd21363c3	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
65cd135c-d759-4108-8713-7096f6703eef	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-02 16:00:00+00	60	scheduled	68fa7a1d-2bdd-43e2-ab03-7d98eb4a0680	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
e67878bf-0362-4436-b58a-e68d5c656b50	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-03 16:00:00+00	60	scheduled	f7b6977b-1770-45f5-b6e8-0f9af78cb952	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
e1451884-0efa-454b-82b8-8e508ff8b6e1	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-08 16:00:00+00	60	scheduled	a83a91ec-7a82-48ff-91ff-a7c5ba5f45b9	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
ffac623d-1b2c-442e-acf4-68c9e54800eb	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-09 16:00:00+00	60	scheduled	a6b524c3-6f15-4218-ae7b-4685e7fbb814	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
0f61d1d7-2e10-43f0-9744-e3b5fa7a262c	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-10 16:00:00+00	60	scheduled	f67340c0-1501-49b3-88cc-7a4e1b4995f7	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
06f90c9b-d0bd-4e52-82c6-27b3fa1d75c1	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-15 16:00:00+00	60	scheduled	c96e90af-b891-4231-9af8-f18bc310046b	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
72c2e09c-29b1-47b9-91a8-f6ae790d85c8	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-16 16:00:00+00	60	scheduled	9afa75af-e46e-450f-92b8-8f60a64b195c	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
abd103dc-d55f-45cd-a83b-32f3cc565108	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-17 16:00:00+00	60	scheduled	4f9aa8e5-dc09-453c-a42c-7b39345d87ce	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
1f08a757-7fce-4d17-880e-2f3b577d702d	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-22 16:00:00+00	60	scheduled	474bef8c-0387-47a6-8c65-23b604522998	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
908dd6a7-72be-42dc-975c-6124b4a5ec39	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-23 16:00:00+00	60	scheduled	4f0c7acf-4246-4f73-9bd2-99fd5820975e	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
f9202cc3-0326-4a4e-b03a-024eb6fd1d46	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-24 16:00:00+00	60	scheduled	4a9caada-a591-4064-9281-20f07a11624d	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
ee4a1546-20c0-475b-9f97-437c5ee8c989	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-29 16:00:00+00	60	scheduled	8ab9bce8-713f-4258-8781-87b0b84437c0	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
e6c4fd87-94f5-472a-89a7-02c0a9ef4343	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-09-30 16:00:00+00	60	scheduled	c017e8f8-4174-4b97-a3bc-2908626c951e	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
bed5ee66-d5f8-42a3-84c9-f7bca18f4fcf	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-10-01 16:00:00+00	60	scheduled	46327a05-1901-4819-a9c5-3632325ad835	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
25762da4-c32b-44e6-9300-0bd2de5154e3	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-10-06 16:00:00+00	60	scheduled	c8a8f20a-9ac0-4aba-811e-df7805d183e6	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
02a410fe-6b2e-4abd-a368-eec497004027	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-10-07 16:00:00+00	60	scheduled	9f2105f1-8160-486d-8ec4-b6542e0214d4	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
90320aac-89ec-4bcb-b50c-82f70c1fb4ad	3cb144ea-8cbc-4d2e-b1c6-d116d8e257d5	2026-10-08 16:00:00+00	60	scheduled	bc02391c-5391-4a7f-9118-3c632828c558	\N	\N	2026-06-20 09:03:14.170515+00	\N	\N	\N	\N	\N	\N	\N
470b69b2-c889-40a8-ab69-cc69bd04ed6d	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-06-22 14:00:00+00	60	scheduled	3508ff6e-3d01-4e89-a9cd-a86f2f5ad283	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
f8852fb6-9f3f-48ac-b7d7-c05e36f90dd5	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-06-23 14:00:00+00	60	scheduled	80664f13-2eb3-4d89-9f9e-9c555b6f61f7	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
ff11c31f-f003-4955-87c9-8e387b16b260	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-06-24 14:00:00+00	60	scheduled	2f971782-8dd1-431e-b3ce-e4dffd0371ec	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
d4bb455a-78fe-4c03-b2ee-0a594ddae2dc	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-06-29 14:00:00+00	60	scheduled	c9e28b8a-b1f3-40d1-99e0-0fb6eb555a76	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
adbb8961-12e9-45c6-8454-a5ef5d07ef9d	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-06-30 14:00:00+00	60	scheduled	5fbce2c2-6539-45cd-9059-5c27e5bb8553	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
4c536f24-b975-4763-a9df-a19472ef14f8	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-01 14:00:00+00	60	scheduled	0e6750cf-6d54-4aa1-92e2-a99f8fe5ffb5	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
35140b77-11c4-418b-865c-82b44cce8f5e	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-06 14:00:00+00	60	scheduled	b73321eb-9e40-44bf-8bc2-7010e5e77892	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
68e784f2-a8c3-4173-b0b2-b8dbc4ab84e8	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-07 14:00:00+00	60	scheduled	ccda18ce-137b-44b8-991c-df34a5b57a40	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
3035c4b0-e139-472a-9156-f6cd852da2f9	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-08 14:00:00+00	60	scheduled	0eeac600-02d6-452a-af7e-5c250c1cdf33	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
43cda848-b3fb-4520-9b84-4a699bb69f32	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-13 14:00:00+00	60	scheduled	7e7c2599-6768-400a-931f-9aba9c91e20a	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
18b69834-af41-4e40-af30-17300291cb0e	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-14 14:00:00+00	60	scheduled	e883ee35-ebdc-4c23-9a4d-4a2c70277d90	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
63177e6b-5a71-483b-9fda-2d4f00d30a1b	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-15 14:00:00+00	60	scheduled	7d8a34af-40db-4515-b704-2d983d1e3688	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
a36e64de-689a-4885-af3f-62cd9dd66426	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-20 14:00:00+00	60	scheduled	25d1c0a9-4c50-4941-912c-dc72bd4895e2	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
8641046d-be65-46e6-b9e2-21d032b4499a	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-21 14:00:00+00	60	scheduled	8048cc7c-8700-46bf-a6f5-181c447bc015	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
096348d4-11cc-4e81-91df-31359e19316f	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-22 14:00:00+00	60	scheduled	5c74a208-6f95-47fc-8baa-f1bf0ae92340	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
55c563e0-8a98-49b5-b496-f05ac4f9e35f	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-27 14:00:00+00	60	scheduled	1f4fd67d-d1e2-440a-8a49-1323c35b721f	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
1ff6704d-7b91-4f4e-b491-739d0e282a85	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-28 14:00:00+00	60	scheduled	0db2cf28-1419-4332-a9c7-dd7f60f46a11	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
286ed168-864d-4e94-bfc1-d0421b0dd0ee	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-07-29 14:00:00+00	60	scheduled	2340a6f2-fc19-45c5-821d-2486b01e13ac	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
10c03f3d-15c9-464c-a3fc-09e100ec5618	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-03 14:00:00+00	60	scheduled	29ce6f14-d9a0-4c12-977a-098c8e2127cf	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
d0bb6abd-e525-4609-b5f1-f760a373434a	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-04 14:00:00+00	60	scheduled	ae71e73b-cd71-4d18-9178-6da5c032ac47	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
4b21a32d-f0df-4167-8bdb-396a4b31b59b	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-05 14:00:00+00	60	scheduled	79093929-3b2b-45fc-943c-2ea9ff79684f	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
68d36eb4-80db-42dd-b124-f8cb64d8aac2	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-10 14:00:00+00	60	scheduled	f632d904-c45f-4b85-847e-6d5578a23fc3	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
be628b32-5aef-4007-bbb0-5d1901af3291	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-11 14:00:00+00	60	scheduled	31612f01-20f9-4ce0-af26-e08ac0aa69ae	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
7f0db37d-3007-4339-b771-0871a24566fc	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-12 14:00:00+00	60	scheduled	c2dc81fc-0ac6-4b99-9246-f8e972ecc3e6	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
d9237683-0c50-49bd-bfae-b1beb77e7de9	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-17 14:00:00+00	60	scheduled	bbe9e435-3d4d-4345-8fd4-f682883c32d2	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
b785cf65-685e-40ff-995d-d802c59c81c8	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-18 14:00:00+00	60	scheduled	97fcc07f-f521-47fb-b403-c3a507633ed7	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
03c224dd-f145-4859-b62a-8becc19ee99f	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-19 14:00:00+00	60	scheduled	d35e194d-de07-4e54-9d33-df2cc3867d9b	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
90a16a33-4ac0-4875-8fad-ba90620a9883	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-24 14:00:00+00	60	scheduled	364e1846-f446-47c0-9d2f-dc48bcf0a864	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
536e7fd1-a2d2-49ac-b80c-747d37a7e547	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-25 14:00:00+00	60	scheduled	d9d20198-0988-480b-8d72-f3c8b74f0a87	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
4cd15a90-6a9d-4ab6-9399-7daec7f00b4f	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-26 14:00:00+00	60	scheduled	6325b883-d9fe-4ec9-ab29-72f0a8900ab8	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
a59fed9f-74ac-41ab-9a6f-8219157b1fd8	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-08-31 14:00:00+00	60	scheduled	3b1bb44f-2908-4b2f-871d-b8b22f63e11b	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
7a9a75ee-cc6f-4a0f-9145-2521ec6303bf	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-01 14:00:00+00	60	scheduled	c75696ce-aa29-47be-805d-de279d7a4e95	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
54d4c51f-2cf7-44e7-954c-fd2a4b946763	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-02 14:00:00+00	60	scheduled	efe92316-48cd-4a25-a6e3-05223dad463f	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
b7ce6ea1-250e-4afc-9676-673ae832e416	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-07 14:00:00+00	60	scheduled	32df319b-c2a0-42a9-a796-de05bc042a72	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
981b04a7-86cf-4039-a1d0-778a16ed36d7	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-08 14:00:00+00	60	scheduled	e0a705a1-81a2-4f9b-8aa9-e651e8e23a16	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
1712f63d-49c0-40fc-a166-90a3b8d87887	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-09 14:00:00+00	60	scheduled	71ae369d-2be5-45fa-9ffb-4a6c94afd6de	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
1d85cd5d-d999-4386-9948-02fc8decc4b6	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-14 14:00:00+00	60	scheduled	11bec791-7186-4a73-ab82-13d7b6d77091	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
fcd1ff4f-0103-4b66-b0e4-f2596bdd9114	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-15 14:00:00+00	60	scheduled	cf32b271-f491-48d4-a42f-3a8624b9cf57	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
783448e8-e0cc-417f-a341-d1efaa84b82d	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-16 14:00:00+00	60	scheduled	8dae9259-2420-4c78-952f-88de5b7a05e0	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
361e5650-2719-4717-aa25-9cd4ced86457	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-21 14:00:00+00	60	scheduled	37dacc43-ab48-47bc-b75c-07edc922c04d	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
b182fbf5-6713-45e9-a803-5a9446b877a5	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-22 14:00:00+00	60	scheduled	87345766-a8a0-4078-8922-8b24c9446d7c	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
c31c4658-2367-45b4-88c6-49ee13efcd0d	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-23 14:00:00+00	60	scheduled	f6eea450-e220-4b6a-be77-9561ee989df6	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
fd8e88b5-4fd0-4085-8a38-e833c9b163ec	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-28 14:00:00+00	60	scheduled	7f692a7b-1571-49a9-bb5c-92aacb7131ee	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
2a96ee74-3c1a-46d8-affa-2e950312a0c1	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-29 14:00:00+00	60	scheduled	062d8d07-f93f-4a93-89d8-8307b067b12c	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
1dfd6740-c43f-482a-890a-2f2f9790fd07	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-09-30 14:00:00+00	60	scheduled	9d280e45-41d6-4662-a66b-ba64867bbeaa	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
2b2b016d-4087-4c43-80b8-8575084c339f	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-10-05 14:00:00+00	60	scheduled	c94a7964-0adc-4284-b321-569a641509cd	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
2aab6c62-056e-4340-9132-d66ab37a2353	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-10-06 14:00:00+00	60	scheduled	c2f0a3e1-7108-4b9f-a811-fb1ab1ee7a8d	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
683ca5b4-69ff-477f-99aa-91da47997cdd	5a665f2e-b24c-4dd9-9b9b-756d953b706d	2026-10-07 14:00:00+00	60	scheduled	1ce6e84f-dc8c-4325-8841-06846316bbab	\N	\N	2026-06-20 09:30:29.556864+00	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: session_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."session_attendance" ("id", "session_id", "student_id", "status") FROM stdin;
cbe7de71-0ded-4199-88eb-5b94c5ea967a	7f8c1a68-88f2-4a3e-aa7f-3acb740d0868	b6f76e11-48ee-4732-ac06-b32f7cc7dfc8	present
58ee3b68-e7db-4e3a-b13c-31f5d7121427	2ff00a46-5bef-49fa-ab27-f806b14e8be9	f0f988d1-076f-4d66-94f2-194e0fb51341	present
\.


--
-- Data for Name: signaling; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."signaling" ("id", "room_token", "from_user", "to_user", "type", "payload", "created_at") FROM stdin;
\.


--
-- Data for Name: teacher_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."teacher_applications" ("id", "user_id", "languages_taught", "certifications", "intro_video_url", "teaching_bio", "availability", "timezone", "rate_expectation", "status", "admin_notes", "submitted_at", "reviewed_at") FROM stdin;
562076d5-385c-4088-9a99-c570fc4bafde	b5aca022-4d85-4afa-ac1c-90ea8c163778	[{"lang": "English", "proficiency": "fluent"}]	{CELTA,DELTA,"JLPT Instructor"}	\N	I have over 5 years of experience teaching students from diverse backgrounds, focusing on building strong conceptual understanding rather than rote learning. My approach is interactive and student-centered, where I encourage questions, discussions, and real-life examples to make learning practical and engaging. I use simple explanations, visual aids, and regular feedback to ensure students stay motivated and confident throughout their learning journey.	{Mon-01:00,Mon-02:00,Mon-03:00,Mon-04:00,Mon-05:00,Mon-06:00,Tue-01:00,Tue-02:00,Tue-03:00,Tue-04:00,Tue-05:00,Tue-06:00,Wed-01:00,Wed-02:00,Wed-03:00,Wed-04:00,Wed-05:00,Wed-06:00,Thu-01:00,Thu-02:00,Thu-03:00,Thu-04:00,Thu-05:00,Thu-06:00,Fri-01:00,Fri-02:00,Fri-03:00,Fri-04:00,Fri-05:00,Fri-06:00}	Asia/Karachi	40.00	approved		2026-05-04 17:56:15.95+00	2026-05-04 17:57:02.884+00
295bc024-09bf-49cf-a609-a64da5ad294a	4f78d067-7b27-495b-b61c-2a2667da28fb	[{"lang": "English", "proficiency": "fluent"}]	{TEFL,"JLPT Instructor","Cambridge TKT"}	\N	this is a test teacher, I'm expert in english teaching.	{Mon-07:00,Mon-08:00,Mon-09:00,Mon-10:00,Mon-11:00,Mon-12:00,Tue-07:00,Tue-08:00,Tue-09:00,Tue-10:00,Tue-11:00,Tue-12:00,Wed-07:00,Wed-08:00,Wed-09:00,Wed-10:00,Wed-11:00,Wed-12:00}	Asia/Karachi	10.00	approved		2026-05-07 18:00:25.758+00	2026-05-07 18:01:31.158+00
4b2366d1-4d5d-493c-8788-30ec242bccfd	4e266f41-4b68-484c-a235-aa6f9e21e077	[{"lang": "English", "proficiency": "fluent"}]	{TEFL,CELTA}	\N	I have over 3 years of experience teaching students from diverse backgrounds, focusing on building strong conceptual understanding rather than rote learning. My approach is interactive and student-centered, where I encourage questions, discussions, and real-life examples to make learning practical and engaging. I use simple explanations, visual aids, and regular feedback to ensure students stay motivated and confident throughout their learning journey.\n	{mon-evening,tue-evening,fri-evening}	Asia/Karachi	25.00	approved		2026-05-03 17:35:10.474+00	2026-05-03 17:41:58.42+00
e38e70c4-aa17-4cd5-ac1e-c8512cb9dbd1	c5bb3d03-a4e1-4ab6-8575-d29ccef4c68a	[{"lang": "English", "proficiency": "fluent"}]	{"Cambridge TKT",DELF/DALF,TESOL,DELTA}	\N	I have over 5 years of experience teaching students from diverse backgrounds, focusing on building strong conceptual understanding rather than rote learning. My approach is interactive and student-centered, where I encourage questions, discussions, and real-life examples to make learning practical and engaging. I use simple explanations, visual aids, and regular feedback to ensure students stay motivated and confident throughout their learning journey.	{Mon-01:00,Mon-02:00,Mon-03:00,Mon-04:00,Mon-05:00,Mon-06:00,Tue-01:00,Tue-02:00,Tue-03:00,Tue-04:00,Tue-05:00,Tue-06:00,Wed-01:00,Wed-02:00,Wed-03:00,Wed-04:00,Wed-05:00,Wed-06:00,Thu-01:00,Thu-02:00,Thu-03:00,Thu-04:00,Thu-05:00,Thu-06:00,Fri-01:00,Fri-02:00,Fri-03:00,Fri-04:00,Fri-05:00,Fri-06:00}	Asia/Karachi	20.00	approved		2026-05-09 06:26:20.01+00	2026-05-09 06:43:24.997+00
15852c98-27b4-4910-8839-bbea57b74f26	5c578af5-da1f-4347-9d5b-455d837990b1	[{"lang": "English", "proficiency": "near_native"}]	{}	\N	I'm a English teacher having a 10  years of experience	{Tue-04:00,Wed-04:00,Tue-05:00,Wed-05:00,Thu-04:00,Thu-05:00}	Asia/Karachi	\N	approved	Congratulation Shaker Your are selected	2026-05-14 07:10:54.16+00	2026-05-14 07:15:35.395+00
b748629f-c00a-463e-88d8-e568b840e160	46655db7-e834-41c2-9e26-9472f37ef48a	[{"lang": "English", "proficiency": "fluent"}]	{"MA in Education"}	\N	this is teacher6 here , I'm a professional english teacher have more than 5 years of teaching experience	{Mon-13:00,Mon-14:00,Mon-15:00,Tue-13:00,Tue-14:00,Tue-15:00,Tue-16:00,Wed-13:00,Wed-14:00,Wed-15:00,Wed-16:00,Thu-13:00,Thu-14:00,Thu-15:00,Thu-16:00,Fri-13:00,Fri-14:00,Fri-15:00,Fri-16:00,Mon-16:00}	Asia/Karachi	\N	approved		2026-06-20 07:21:59.014+00	2026-06-20 07:50:52.178+00
eb62d811-b486-469a-b45f-cf3af1729249	7361acfe-39f1-4a58-9bdb-1eae48fbc7fd	[{"lang": "English", "proficiency": "native"}]	{CELTA,DELTA,TESOL,DELF/DALF}	\N	i'm english teaher expert have been teaching for more than 5 years	{Mon-01:00,Mon-02:00,Mon-03:00,Mon-04:00,Mon-05:00,Mon-06:00,Tue-01:00,Tue-02:00,Tue-03:00,Tue-04:00,Tue-05:00,Tue-06:00,Wed-01:00,Wed-02:00,Wed-03:00,Wed-04:00,Wed-05:00,Wed-06:00,Mon-13:00,Mon-14:00,Mon-15:00,Mon-16:00,Mon-17:00,Mon-18:00,Tue-13:00,Tue-14:00,Tue-15:00,Tue-16:00,Tue-17:00,Tue-18:00,Wed-13:00,Wed-14:00,Wed-15:00,Wed-16:00,Wed-17:00,Wed-18:00}	Asia/Karachi	\N	approved		2026-06-10 17:40:54.656+00	2026-06-10 17:42:09.339+00
d530e035-26ff-4b6e-9ba3-831358783dc4	060ef569-4d4b-4490-aa22-ccb7f3b2df11	[{"lang": "English", "proficiency": "fluent"}]	{TESOL,DELTA,CELTA,"JLPT Instructor","MA in Education"}	\N	I am passionate about helping students learn in a clear, practical, and engaging way. My teaching style focuses on breaking down complex topics into simple concepts, encouraging questions, and creating an interactive learning environment. I tailor sessions to each student's needs, ensuring they build confidence and develop a strong understanding of the subject. My goal is to make learning enjoyable, effective, and focused on real-world application.\n	{Mon-13:00,Mon-14:00,Mon-15:00,Mon-16:00,Mon-17:00,Mon-18:00,Tue-13:00,Tue-14:00,Tue-15:00,Tue-16:00,Tue-17:00,Tue-18:00,Wed-13:00,Wed-14:00,Wed-15:00,Wed-16:00,Wed-17:00,Wed-18:00}	Asia/Karachi	\N	rejected		2026-06-20 08:19:29.955+00	2026-06-20 08:25:41.008+00
\.


--
-- Data for Name: teacher_payouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."teacher_payouts" ("id", "teacher_id", "amount", "status", "payout_date", "method", "stripe_transfer_id", "admin_notes", "created_at") FROM stdin;
\.


--
-- Data for Name: teacher_unavailability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."teacher_unavailability" ("id", "teacher_id", "date", "reason") FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") FROM stdin;
chat-attachments	chat-attachments	\N	2026-05-05 19:11:45.585609+00	2026-05-05 19:11:45.585609+00	f	f	\N	\N	\N	STANDARD
chat-voice-notes	chat-voice-notes	\N	2026-05-05 19:12:10.046315+00	2026-05-05 19:12:10.046315+00	f	f	\N	\N	\N	STANDARD
avatars	avatars	\N	2026-06-17 19:09:35.302934+00	2026-06-17 19:09:35.302934+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") FROM stdin;
a111a8ac-87d6-424b-8be8-b31703c1e20d	chat-attachments	c4e37015-0936-449b-b25e-d224fa29f9e3/b6f76e11-48ee-4732-ac06-b32f7cc7dfc8/1778087692949-message.jpeg	\N	2026-05-06 17:14:56.24507+00	2026-05-06 17:14:56.24507+00	2026-05-06 17:14:56.24507+00	{"eTag": "\\"bdc0ad55c7be90f536906e57977430ba\\"", "size": 346700, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-06T17:14:57.000Z", "contentLength": 346700, "httpStatusCode": 200}	df0f57e7-ac0c-45f0-8712-c94c8b6b366b	\N	{}
1be7123d-a601-45d0-8589-bbca5cee4ec0	chat-voice-notes	c4e37015-0936-449b-b25e-d224fa29f9e3/b6f76e11-48ee-4732-ac06-b32f7cc7dfc8/1778087809561-voice-1778087807750.webm	\N	2026-05-06 17:16:53.016194+00	2026-05-06 17:16:53.016194+00	2026-05-06 17:16:53.016194+00	{"eTag": "\\"4479742bae3841800d8db2176e007c0d\\"", "size": 88041, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-05-06T17:16:53.000Z", "contentLength": 88041, "httpStatusCode": 200}	3488fc3c-9f8b-4141-97d5-d17bf21629a1	\N	{}
01742670-38fd-4ec3-a429-06eb10c2e105	chat-voice-notes	15eae65f-a23e-4c0e-b176-3c5d6956ae0b/3d2f51de-c033-4deb-a5c9-e7a35b3dcca1/1778099348160-voice-1778099347215.webm	\N	2026-05-06 20:29:11.229131+00	2026-05-06 20:29:11.229131+00	2026-05-06 20:29:11.229131+00	{"eTag": "\\"d5d6bf63b8ec061f6046e68b2cb237a0\\"", "size": 76401, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-05-06T20:29:12.000Z", "contentLength": 76401, "httpStatusCode": 200}	b173d2b4-fc9e-41d2-82cc-15e234f52746	\N	{}
1ec37b25-5e0d-440b-8488-a8a73912aef2	chat-voice-notes	d24004d0-cf0d-4437-9ff9-bf4191bdc868/f0f988d1-076f-4d66-94f2-194e0fb51341/1781114794774-voice-1781114793727.webm	\N	2026-06-10 18:06:36.499742+00	2026-06-10 18:06:36.499742+00	2026-06-10 18:06:36.499742+00	{"eTag": "\\"0934e0190eac08ab47b7a27eccc5c9d2\\"", "size": 1127, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T18:06:37.000Z", "contentLength": 1127, "httpStatusCode": 200}	9d5ef476-0221-405f-b48c-349db6818187	\N	{}
6eec236e-6cfd-4563-8d65-eece9e975ef4	chat-voice-notes	d24004d0-cf0d-4437-9ff9-bf4191bdc868/f0f988d1-076f-4d66-94f2-194e0fb51341/1781114810476-voice-1781114810338.webm	\N	2026-06-10 18:06:51.916176+00	2026-06-10 18:06:51.916176+00	2026-06-10 18:06:51.916176+00	{"eTag": "\\"27d85c066672db8d64dd3b19905b049f\\"", "size": 2093, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T18:06:52.000Z", "contentLength": 2093, "httpStatusCode": 200}	9d0d2a52-170d-4c29-bf6a-7a5dbd03eff5	\N	{}
9529681d-4226-4ca2-8c55-1f31653e4c18	chat-voice-notes	d24004d0-cf0d-4437-9ff9-bf4191bdc868/f0f988d1-076f-4d66-94f2-194e0fb51341/1781114818473-voice-1781114818333.webm	\N	2026-06-10 18:07:00.077184+00	2026-06-10 18:07:00.077184+00	2026-06-10 18:07:00.077184+00	{"eTag": "\\"567bb3b4420685b505ecc1646c24aa23\\"", "size": 64125, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T18:07:01.000Z", "contentLength": 64125, "httpStatusCode": 200}	d1f8c2f6-25f7-4260-be96-fbef36a487ca	\N	{}
78bcf0ab-4473-4994-89fd-b8c91a3d6bd9	chat-voice-notes	d24004d0-cf0d-4437-9ff9-bf4191bdc868/4e266f41-4b68-484c-a235-aa6f9e21e077/1781114876237-voice-1781114873261.webm	\N	2026-06-10 18:07:58.313899+00	2026-06-10 18:07:58.313899+00	2026-06-10 18:07:58.313899+00	{"eTag": "\\"975d8bd53f677b79651dbd88911a61d9\\"", "size": 78363, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T18:07:59.000Z", "contentLength": 78363, "httpStatusCode": 200}	44dfea89-018f-474f-ab00-5b065d6d5f6c	\N	{}
595ebeec-a28f-4643-b1ef-0b14b46536d5	chat-voice-notes	d24004d0-cf0d-4437-9ff9-bf4191bdc868/4e266f41-4b68-484c-a235-aa6f9e21e077/1781114924546-voice-1781114922456.webm	\N	2026-06-10 18:08:46.071088+00	2026-06-10 18:08:46.071088+00	2026-06-10 18:08:46.071088+00	{"eTag": "\\"f51533179fb1d510d18c373bb223a763\\"", "size": 72521, "mimetype": "audio/webm", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T18:08:47.000Z", "contentLength": 72521, "httpStatusCode": 200}	f29101ad-55fe-4c84-bb32-0586c818aeff	\N	{}
360e9269-eafd-4f6c-8fc7-ef1adc570508	avatars	4b03d48a-c35d-453c-8427-df046e0583d7/1781723499485-repair2.jpeg	\N	2026-06-17 19:11:41.489413+00	2026-06-17 19:11:41.489413+00	2026-06-17 19:11:41.489413+00	{"eTag": "\\"3184bf8a1193cafe2ae80a232f429b98\\"", "size": 92523, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-17T19:11:42.000Z", "contentLength": 92523, "httpStatusCode": 200}	9e1e2a3b-317e-41ab-9836-f38b8562729e	\N	{}
582733dc-b836-41e8-9276-dab89d282dcb	avatars	4e266f41-4b68-484c-a235-aa6f9e21e077/1781723585058-repair1.jpeg	\N	2026-06-17 19:13:07.09681+00	2026-06-17 19:13:07.09681+00	2026-06-17 19:13:07.09681+00	{"eTag": "\\"36491749d4d8e90aad2069590d9a2a42\\"", "size": 74184, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-17T19:13:08.000Z", "contentLength": 74184, "httpStatusCode": 200}	5359d1f5-af18-4216-ba4d-2047732459f4	\N	{}
01baf985-0628-40b0-a1c4-049d57f33c2b	avatars	060ef569-4d4b-4490-aa22-ccb7f3b2df11/1781943515709-models.jpeg	\N	2026-06-20 08:18:38.402417+00	2026-06-20 08:18:38.402417+00	2026-06-20 08:18:38.402417+00	{"eTag": "\\"48f693f4327294c838482fe23fa6deed\\"", "size": 136285, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-20T08:18:39.000Z", "contentLength": 136285, "httpStatusCode": 200}	cf78c199-9fa3-4083-b4f5-604c6a9d6331	\N	{}
f1f5671d-08ef-465d-aa08-fdb47be408d1	avatars	060ef569-4d4b-4490-aa22-ccb7f3b2df11/1781943536002-models.jpeg	\N	2026-06-20 08:18:58.498062+00	2026-06-20 08:18:58.498062+00	2026-06-20 08:18:58.498062+00	{"eTag": "\\"48f693f4327294c838482fe23fa6deed\\"", "size": 136285, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-20T08:18:59.000Z", "contentLength": 136285, "httpStatusCode": 200}	2be7da9e-4789-4ce1-8d89-0bf01f117839	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 324, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict hGgbmZrnDo1LWgEiuk87gUAe62fmDZCstTagvtGa8zWpu1JQh8AP3P5MBye4C9f

RESET ALL;
