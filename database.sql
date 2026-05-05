--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_leave_requests_status; Type: TYPE; Schema: public; Owner: app_user
--

CREATE TYPE public.enum_leave_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_leave_requests_status OWNER TO app_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO app_user;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date date NOT NULL,
    check_in timestamp with time zone,
    check_out timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.attendance OWNER TO app_user;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO app_user;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_user
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.leave_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    leave_type_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text NOT NULL,
    status public.enum_leave_requests_status DEFAULT 'pending'::public.enum_leave_requests_status NOT NULL,
    remark text,
    acted_by integer,
    acted_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.leave_requests OWNER TO app_user;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_requests_id_seq OWNER TO app_user;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_user
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.leave_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    annual_quota integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.leave_types OWNER TO app_user;

--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

CREATE SEQUENCE public.leave_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_types_id_seq OWNER TO app_user;

--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_user
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO app_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO app_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_user
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO app_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO app_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO app_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.sessions (
    id uuid NOT NULL,
    user_id integer NOT NULL,
    last_activity_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO app_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role_id integer NOT NULL,
    parent_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO app_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO app_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public."SequelizeMeta" VALUES ('20260504000000-create-roles-and-permissions.js');
INSERT INTO public."SequelizeMeta" VALUES ('20260504000001-create-users.js');
INSERT INTO public."SequelizeMeta" VALUES ('20260504000002-create-leave-types.js');
INSERT INTO public."SequelizeMeta" VALUES ('20260504000003-create-leave-requests.js');
INSERT INTO public."SequelizeMeta" VALUES ('20260504000004-create-attendance.js');
INSERT INTO public."SequelizeMeta" VALUES ('20260504000005-create-sessions.js');


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: app_user
--



--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: app_user
--



--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public.leave_types VALUES (1, 'Casual Leave', 12, '2026-05-05 09:33:40.066+00', '2026-05-05 09:33:40.066+00');
INSERT INTO public.leave_types VALUES (2, 'Sick Leave', 10, '2026-05-05 09:33:40.066+00', '2026-05-05 09:33:40.066+00');
INSERT INTO public.leave_types VALUES (3, 'Earned Leave', 15, '2026-05-05 09:33:40.066+00', '2026-05-05 09:33:40.066+00');


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public.permissions VALUES (1, 'attendance:read:own', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (2, 'attendance:write', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (3, 'attendance:read:team', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (4, 'attendance:read:all', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (5, 'leave:apply', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (6, 'leave:read:own', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (7, 'leave:cancel:own', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (8, 'leave:read:pending', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (9, 'leave:read:all', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (10, 'leave:approve', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (11, 'leave_type:manage', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.permissions VALUES (12, 'user:manage', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public.role_permissions VALUES (1, 1, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (1, 2, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (1, 5, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (1, 6, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (1, 7, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 1, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 2, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 3, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 5, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 6, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 7, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 8, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (2, 10, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 1, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 3, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 4, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 6, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 8, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 9, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 10, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 11, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.role_permissions VALUES (3, 12, '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public.roles VALUES (1, 'employee', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.roles VALUES (2, 'manager', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');
INSERT INTO public.roles VALUES (3, 'hr', '2026-05-05 09:33:40.055+00', '2026-05-05 09:33:40.055+00');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public.sessions VALUES ('01eaf5df-cb04-4a45-9b6c-aff8a6ab03d0', 2, '2026-05-05 10:12:18.265+00', '2026-05-05 10:12:18.205+00', '2026-05-05 10:12:18.265+00');
INSERT INTO public.sessions VALUES ('6f27c605-f49e-4633-b2bc-abbe9ed900b3', 2, '2026-05-05 10:27:06.729+00', '2026-05-05 10:27:06.704+00', '2026-05-05 10:27:06.729+00');
INSERT INTO public.sessions VALUES ('94f31e50-1b71-438f-a3f7-0f4985d26d12', 2, '2026-05-05 10:30:41.539+00', '2026-05-05 10:30:41.511+00', '2026-05-05 10:30:41.539+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public.users VALUES (1, 'hr1', '$2b$10$wvgjzrewpWkuspAwz2cFB.ssrHGp.jyasWkJfXRbEP3IiJah9Ca26', 3, NULL, true, '2026-05-05 09:33:40.069+00', '2026-05-05 09:33:40.069+00');
INSERT INTO public.users VALUES (2, 'manager1', '$2b$10$wvgjzrewpWkuspAwz2cFB.ssrHGp.jyasWkJfXRbEP3IiJah9Ca26', 2, 1, true, '2026-05-05 09:33:40.069+00', '2026-05-05 09:33:40.069+00');
INSERT INTO public.users VALUES (3, 'employee1', '$2b$10$wvgjzrewpWkuspAwz2cFB.ssrHGp.jyasWkJfXRbEP3IiJah9Ca26', 1, 2, true, '2026-05-05 09:33:40.069+00', '2026-05-05 09:33:40.069+00');


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 3, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
--

SELECT pg_catalog.setval('public.permissions_id_seq', 12, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_name_key; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_name_key UNIQUE (name);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: attendance_user_date_unique; Type: INDEX; Schema: public; Owner: app_user
--

CREATE UNIQUE INDEX attendance_user_date_unique ON public.attendance USING btree (user_id, date);


--
-- Name: role_permissions_permission_id_idx; Type: INDEX; Schema: public; Owner: app_user
--

CREATE INDEX role_permissions_permission_id_idx ON public.role_permissions USING btree (permission_id);


--
-- Name: sessions_user_id; Type: INDEX; Schema: public; Owner: app_user
--

CREATE INDEX sessions_user_id ON public.sessions USING btree (user_id);


--
-- Name: users_parent_id_idx; Type: INDEX; Schema: public; Owner: app_user
--

CREATE INDEX users_parent_id_idx ON public.users USING btree (parent_id);


--
-- Name: users_role_id_idx; Type: INDEX; Schema: public; Owner: app_user
--

CREATE INDEX users_role_id_idx ON public.users USING btree (role_id);


--
-- Name: attendance attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_acted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_acted_by_fkey FOREIGN KEY (acted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

