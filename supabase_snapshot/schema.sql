--
-- PostgreSQL database dump
--

\restrict wHHu30W2rUIDAs5qZNz98lcGqa5W0GOwTdb5mYhijwndmJlyoh65CKjVXRgNPx8

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.7 (Homebrew)

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
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA public;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: internship_domain; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.internship_domain AS ENUM (
    'Web Development',
    'Python',
    'Artificial Intelligence',
    'Machine Learning',
    'Java'
);


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: aggregate_company_analytics(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.aggregate_company_analytics(p_company_id uuid, p_start_date date, p_end_date date) RETURNS TABLE(total_views bigint, total_clicks bigint, total_registrations bigint, total_participants bigint, total_events_created bigint, total_events_published bigint, total_hackathons_created bigint, total_hackathons_published bigint, total_revenue numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(ca.total_views), 0)::BIGINT,
    COALESCE(SUM(ca.total_clicks), 0)::BIGINT,
    COALESCE(SUM(ca.total_registrations), 0)::BIGINT,
    COALESCE(SUM(ca.total_participants), 0)::BIGINT,
    COALESCE(SUM(ca.events_created), 0)::BIGINT,
    COALESCE(SUM(ca.events_published), 0)::BIGINT,
    COALESCE(SUM(ca.hackathons_created), 0)::BIGINT,
    COALESCE(SUM(ca.hackathons_published), 0)::BIGINT,
    COALESCE(SUM(ca.revenue_generated), 0)::DECIMAL
  FROM company_analytics ca
  WHERE ca.company_id = p_company_id
    AND ca.date >= p_start_date
    AND ca.date <= p_end_date;
END;
$$;


--
-- Name: auto_assign_username(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_assign_username(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
    profile_record RECORD;
    safe_username VARCHAR(50);
BEGIN
    -- Get current profile
    SELECT * INTO profile_record FROM profiles WHERE id = user_id;
    
    -- Check if profile exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;
    
    -- Check if username is already set
    IF profile_record.username_set THEN
        RETURN TRUE; -- Already set
    END IF;
    
    -- Generate safe username
    safe_username := generate_safe_username();
    
    -- Update profile
    UPDATE profiles 
    SET username = safe_username, 
        username_set = TRUE,
        profile_complete = TRUE,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$;


--
-- Name: auto_generate_codeunia_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_codeunia_id() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
    -- Only set codeunia_id if it's not already set
    IF NEW.codeunia_id IS NULL THEN
        NEW.codeunia_id := generate_codeunia_id();
    END IF;
    
    -- Set profile_complete to false for new profiles
    IF NEW.profile_complete IS NULL THEN
        NEW.profile_complete := FALSE;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: award_points_for_activity(uuid, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.award_points_for_activity(p_user_id uuid, p_activity_type text, p_related_id uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  -- Define point values for different activities
  CASE p_activity_type
    WHEN 'daily_login' THEN points_to_award := 5;
    WHEN 'test_registration' THEN points_to_award := 5;
    WHEN 'test_completion' THEN points_to_award := 10;
    WHEN 'hackathon_registration' THEN points_to_award := 5;
    WHEN 'hackathon_participation' THEN points_to_award := 10;
    WHEN 'blog_read' THEN points_to_award := 2;
    WHEN 'blog_like' THEN points_to_award := 1;
    WHEN 'blog_share' THEN points_to_award := 5;
    WHEN 'profile_update' THEN points_to_award := 2;
    WHEN 'certificate_earned' THEN points_to_award := 15;
    WHEN 'top_3_rank' THEN points_to_award := 15;
    WHEN 'user_referral' THEN points_to_award := 10;
    ELSE points_to_award := 0;
  END CASE;

  -- If no points to award, return false
  IF points_to_award = 0 THEN
    RETURN FALSE;
  END IF;

  -- Log the activity
  INSERT INTO user_activity_log (user_id, activity_type, related_id, points_awarded)
  VALUES (p_user_id, p_activity_type, p_related_id, points_to_award);

  -- Award points
  PERFORM increment_points(p_user_id, points_to_award);

  RETURN TRUE;
END;
$$;


--
-- Name: can_message_user(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_message_user(sender_id uuid, recipient_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  recipient_settings RECORD;
  are_mutual_connections BOOLEAN;
BEGIN
  -- Get recipient's privacy settings
  SELECT allow_messages_from_anyone, allow_messages_from_connections
  INTO recipient_settings
  FROM profiles
  WHERE id = recipient_id;

  -- If recipient allows messages from anyone, return true
  IF recipient_settings.allow_messages_from_anyone THEN
    RETURN true;
  END IF;

  -- If recipient allows messages from connections, check if they're mutual connections
  IF recipient_settings.allow_messages_from_connections THEN
    -- Check if they follow each other (mutual connection)
    SELECT EXISTS (
      SELECT 1 FROM user_connections 
      WHERE follower_id = sender_id AND following_id = recipient_id
    ) AND EXISTS (
      SELECT 1 FROM user_connections 
      WHERE follower_id = recipient_id AND following_id = sender_id
    ) INTO are_mutual_connections;
    
    RETURN are_mutual_connections;
  END IF;

  -- Default: cannot message
  RETURN false;
END;
$$;


--
-- Name: FUNCTION can_message_user(sender_id uuid, recipient_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.can_message_user(sender_id uuid, recipient_id uuid) IS 'Checks if sender can message recipient based on privacy settings';


--
-- Name: check_username_availability(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_username_availability(username_param character varying) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
    -- Validate username format
    IF NOT validate_username(username_param) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if username is available
    RETURN NOT EXISTS (SELECT 1 FROM profiles WHERE username = username_param);
END;
$$;


--
-- Name: cleanup_expired_certificates(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_certificates() RETURNS void
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cert_record RECORD;
BEGIN
  -- Find expired certificates
  FOR cert_record IN 
    SELECT id, certificate_url, qr_code_url 
    FROM certificates 
    WHERE expires_at < NOW() AND is_valid = true
  LOOP
    -- Mark certificate as invalid
    UPDATE certificates 
    SET is_valid = false 
    WHERE id = cert_record.id;
    
    -- Note: You might want to also delete the actual files from storage
    -- This would require additional storage API calls
  END LOOP;
END;
$$;


--
-- Name: cleanup_old_notifications(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_notifications() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete read notifications older than 90 days
    DELETE FROM notifications
    WHERE read = true 
    AND read_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


--
-- Name: codeunia_cleanup_expired_payments(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.codeunia_cleanup_expired_payments() RETURNS void
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  UPDATE pending_payments 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'pending';
END;
$$;


--
-- Name: codeunia_get_pending_payments_for_contact(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.codeunia_get_pending_payments_for_contact() RETURNS TABLE(id uuid, user_id uuid, order_id text, plan_id text, amount integer, created_at timestamp with time zone, contact_attempts integer)
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.user_id,
    pp.order_id,
    pp.plan_id,
    pp.amount,
    pp.created_at,
    pp.contact_attempts
  FROM pending_payments pp
  WHERE pp.status = 'pending' 
    AND pp.expires_at > NOW()
    AND (pp.contact_attempts = 0 OR pp.last_contact_at < NOW() - INTERVAL '1 hour')
  ORDER BY pp.created_at ASC;
END;
$$;


--
-- Name: create_email_profile(uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_email_profile(user_id uuid, email text, user_metadata jsonb DEFAULT '{}'::jsonb) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    generated_username TEXT;
    existing_profile BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO existing_profile;
    
    IF existing_profile THEN
        -- Profile exists, just update
        UPDATE profiles 
        SET auth_provider = 'email',
            updated_at = NOW()
        WHERE id = user_id;
        RETURN TRUE;
    END IF;

    -- Extract first and last name from metadata
    first_name := COALESCE(
        user_metadata->>'first_name',
        user_metadata->>'given_name',
        ''
    );
    
    last_name := COALESCE(
        user_metadata->>'last_name',
        user_metadata->>'family_name',
        ''
    );
    
    -- Generate safe username
    generated_username := generate_safe_username(first_name, last_name, user_id);
    
    -- Insert new profile for email user
    INSERT INTO profiles (
        id,
        email,
        auth_provider,
        first_name,
        last_name,
        username,
        username_editable,
        email_confirmed_at,
        codeunia_id,
        username_set,
        profile_complete,
        is_public,
        email_notifications,
        profile_completion_percentage,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        email,
        'email',
        first_name,
        last_name,
        generated_username,
        TRUE,
        NULL,
        generate_codeunia_id(),
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        0,
        NOW(),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the authentication
        RAISE LOG 'Error creating email profile for user %: %', user_id, SQLERRM;
        RETURN FALSE;
END;
$$;


--
-- Name: create_notification(uuid, text, text, text, uuid, text, text, bigint, bigint, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_company_id uuid DEFAULT NULL::uuid, p_action_url text DEFAULT NULL::text, p_action_label text DEFAULT NULL::text, p_event_id bigint DEFAULT NULL::bigint, p_hackathon_id bigint DEFAULT NULL::bigint, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        company_id,
        type,
        title,
        message,
        action_url,
        action_label,
        event_id,
        hackathon_id,
        metadata
    ) VALUES (
        p_user_id,
        p_company_id,
        p_type,
        p_title,
        p_message,
        p_action_url,
        p_action_label,
        p_event_id,
        p_hackathon_id,
        p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;


--
-- Name: create_oauth_profile(uuid, text, character varying, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_oauth_profile(user_id uuid, email text, auth_provider character varying, user_metadata jsonb DEFAULT '{}'::jsonb) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    generated_username TEXT;
    existing_profile BOOLEAN;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO existing_profile;
    
    IF existing_profile THEN
        -- Profile exists, just update auth provider
        UPDATE profiles 
        SET auth_provider = create_oauth_profile.auth_provider,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = user_id;
        RETURN TRUE;
    END IF;

    -- Extract first and last name from metadata
    first_name := COALESCE(
        user_metadata->>'first_name',
        user_metadata->>'given_name',
        ''
    );
    
    last_name := COALESCE(
        user_metadata->>'last_name',
        user_metadata->>'family_name',
        ''
    );
    
    -- Generate safe username
    generated_username := generate_safe_username(first_name, last_name, user_id);
    
    -- Insert new profile for OAuth user
    INSERT INTO profiles (
        id,
        email,
        auth_provider,
        first_name,
        last_name,
        username,
        username_editable,
        email_confirmed_at,
        codeunia_id,
        username_set,
        profile_complete,
        is_public,
        email_notifications,
        profile_completion_percentage,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        email,
        auth_provider,
        first_name,
        last_name,
        generated_username,
        TRUE,
        NOW(),
        generate_codeunia_id(),
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        0,
        NOW(),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the authentication
        RAISE LOG 'Error creating OAuth profile for user %: %', user_id, SQLERRM;
        RETURN FALSE;
END;
$$;


--
-- Name: create_organization(text, text, text, text, text, text, text, text, text, text, text, text, text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_organization(org_name text, org_domain text, org_description text DEFAULT NULL::text, org_phone text DEFAULT NULL::text, org_email text DEFAULT NULL::text, org_website text DEFAULT NULL::text, org_address_line1 text DEFAULT NULL::text, org_address_line2 text DEFAULT NULL::text, org_city text DEFAULT NULL::text, org_state text DEFAULT NULL::text, org_country text DEFAULT NULL::text, org_postal_code text DEFAULT NULL::text, org_industry text DEFAULT NULL::text, org_size text DEFAULT NULL::text, org_founded_year integer DEFAULT NULL::integer) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
    admin_user_id UUID;
    new_org_id UUID;
BEGIN
    -- Check if current user is admin
    SELECT id INTO admin_user_id
    FROM profiles 
    WHERE id = auth.uid() AND is_admin = true;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can create organizations';
    END IF;
    
    -- Validate required fields
    IF org_name IS NULL OR org_name = '' THEN
        RAISE EXCEPTION 'Organization name is required';
    END IF;
    
    IF org_domain IS NULL OR org_domain = '' THEN
        RAISE EXCEPTION 'Organization domain is required';
    END IF;
    
    -- Basic domain validation
    IF org_domain !~ '^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid domain format';
    END IF;
    
    -- Insert the organization
    INSERT INTO organizations (
        name, domain, description, phone, email, website,
        address_line1, address_line2, city, state, country, postal_code,
        industry, size, founded_year, is_active, is_verified, created_by
    ) VALUES (
        org_name, LOWER(org_domain), org_description, org_phone, org_email, org_website,
        org_address_line1, org_address_line2, org_city, org_state, org_country, org_postal_code,
        org_industry, org_size, org_founded_year, true, false, admin_user_id
    ) RETURNING id INTO new_org_id;
    
    RETURN new_org_id;
END;
$_$;


--
-- Name: deactivate_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.deactivate_organization(org_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if current user is admin
    SELECT id INTO admin_user_id
    FROM profiles 
    WHERE id = auth.uid() AND is_admin = true;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can deactivate organizations';
    END IF;
    
    -- Deactivate the organization
    UPDATE organizations
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE id = org_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Organization not found: %', org_id;
    END IF;
    
    -- Set all users from this organization to pending status
    UPDATE profiles
    SET 
        status = 'pending',
        is_org_verified = false,
        updated_at = NOW()
    WHERE organization_id = org_id;
    
    RETURN true;
END;
$$;


--
-- Name: determine_user_status(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.determine_user_status(email_address text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    domain_name TEXT;
    is_public BOOLEAN;
    org_verified BOOLEAN;
BEGIN
    -- Extract domain from email
    domain_name := extract_email_domain(email_address);
    
    IF domain_name IS NULL THEN
        RETURN 'pending';
    END IF;
    
    -- Check if it's a public domain
    is_public := is_public_domain(domain_name);
    
    IF is_public THEN
        RETURN 'pending';
    END IF;
    
    -- Check if organization exists and is verified
    SELECT is_verified INTO org_verified
    FROM organizations
    WHERE domain = domain_name AND is_active = true;
    
    IF org_verified IS NULL THEN
        -- Organization doesn't exist, create it
        PERFORM find_or_create_organization(domain_name);
        RETURN 'pending';
    ELSIF org_verified THEN
        RETURN 'active';
    ELSE
        RETURN 'pending';
    END IF;
END;
$$;


--
-- Name: extract_email_domain(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.extract_email_domain(email_address text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    IF email_address IS NULL OR email_address = '' THEN
        RETURN NULL;
    END IF;
    
    -- Extract domain from email (everything after @)
    RETURN LOWER(SPLIT_PART(email_address, '@', 2));
END;
$$;


--
-- Name: find_or_create_organization(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.find_or_create_organization(domain_name text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    org_id UUID;
    org_record RECORD;
BEGIN
    -- First, try to find existing organization
    SELECT id INTO org_id
    FROM organizations
    WHERE domain = LOWER(domain_name) AND is_active = true;
    
    -- If found, return the ID
    IF org_id IS NOT NULL THEN
        RETURN org_id;
    END IF;
    
    -- If not found, create a new organization
    INSERT INTO organizations (
        name, domain, is_active, is_verified
    ) VALUES (
        INITCAP(REPLACE(domain_name, '.', ' ')) || ' Organization', -- Generate name from domain
        LOWER(domain_name),
        true,
        false -- New organizations start as unverified
    ) RETURNING id INTO org_id;
    
    RETURN org_id;
END;
$$;


--
-- Name: generate_certificate_path(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_certificate_path(cert_id text, file_type text DEFAULT 'pdf'::text) RETURNS text
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  -- Create a structured path: certificates/{cert_id}/{timestamp}.{file_type}
  RETURN 'certificates/' || cert_id || '/' || 
         EXTRACT(EPOCH FROM NOW())::TEXT || '.' || file_type;
END;
$$;


--
-- Name: generate_codeunia_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_codeunia_id() RETURNS character varying
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
    new_id VARCHAR(20);
    counter INTEGER := 1;
BEGIN
    LOOP
        -- Generate ID with format: CD-YYYYMMDD-XXXX
        new_id := 'CD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                  LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if ID already exists
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE codeunia_id = new_id) THEN
            RETURN new_id;
        END IF;
        
        -- Prevent infinite loop
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique Codeunia ID after 100 attempts';
        END IF;
    END LOOP;
END;
$$;


--
-- Name: generate_safe_username(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_safe_username() RETURNS character varying
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
    new_username VARCHAR(50);
    counter INTEGER := 1;
BEGIN
    LOOP
        -- Generate username with format: userXXXX
        new_username := 'user' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if username already exists
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = new_username) THEN
            RETURN new_username;
        END IF;
        
        -- Prevent infinite loop
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique username after 100 attempts';
        END IF;
    END LOOP;
END;
$$;


--
-- Name: generate_safe_username(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_safe_username(display_name text, user_id uuid) RETURNS text
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert display name to safe username format
    base_username := LOWER(REGEXP_REPLACE(display_name, '[^a-zA-Z0-9]', '', 'g'));
    
    -- If empty after cleaning, use 'user' as base
    IF base_username = '' THEN
        base_username := 'user';
    END IF;
    
    -- Limit length to 30 characters
    base_username := LEFT(base_username, 30);
    
    -- Try base username first
    final_username := base_username;
    
    -- If username exists, add random suffix
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
        counter := counter + 1;
        final_username := base_username || '_' || LPAD(counter::TEXT, 3, '0');
        
        -- Prevent infinite loop
        IF counter > 999 THEN
            final_username := base_username || '_' || SUBSTRING(user_id::TEXT, 1, 8);
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_username;
END;
$$;


--
-- Name: generate_safe_username(text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_safe_username(first_name text, last_name text, user_id uuid) RETURNS text
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 0;
    full_name TEXT;
BEGIN
    -- Combine first_name and last_name
    full_name := CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''));
    full_name := TRIM(full_name);

    -- If no name provided, use 'user' as base
    IF full_name = '' THEN
        full_name := 'user';
    END IF;

    -- Convert to safe username format
    base_username := LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]', '', 'g'));

    -- If empty after cleaning, use 'user' as base
    IF base_username = '' THEN
        base_username := 'user';
    END IF;

    -- Limit length to 30 characters
    base_username := LEFT(base_username, 30);

    -- Try base username first
    final_username := base_username;

    -- If username exists, add random suffix
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
        counter := counter + 1;
        final_username := base_username || '_' || LPAD(counter::TEXT, 3, '0');

        -- Prevent infinite loop
        IF counter > 999 THEN
            final_username := base_username || '_' || SUBSTRING(user_id::TEXT, 1, 8);
            EXIT;
        END IF;
    END LOOP;

    RETURN final_username;
END;
$$;


--
-- Name: get_active_rounds(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_active_rounds(test_uuid uuid) RETURNS TABLE(id uuid, round_number integer, name text, description text, start_date timestamp with time zone, end_date timestamp with time zone, round_type text, is_elimination_round boolean)
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.id,
    tr.round_number,
    tr.name,
    tr.description,
    tr.start_date,
    tr.end_date,
    tr.round_type,
    tr.is_elimination_round
  FROM test_rounds tr
  WHERE tr.test_id = test_uuid
    AND NOW() >= tr.start_date 
    AND NOW() <= tr.end_date
  ORDER BY tr.round_number;
END;
$$;


--
-- Name: get_certificate_url(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_certificate_url(file_path text) RETURNS text
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  -- This will be replaced with actual Supabase storage URL
  -- The actual URL format depends on your Supabase project
  RETURN 'https://yocnorlktyfswjqqvzrve.supabase.co/storage/v1/object/public/certificates/' || file_path;
END;
$$;


--
-- Name: get_company_role(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_company_role(p_user_id uuid, p_company_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM company_members
    WHERE user_id = p_user_id 
    AND company_id = p_company_id 
    AND status = 'active';
    
    RETURN user_role;
END;
$$;


--
-- Name: get_organization_details(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_organization_details(org_id uuid) RETURNS TABLE(id uuid, name text, domain text, description text, phone text, email text, website text, address_line1 text, address_line2 text, city text, state text, country text, postal_code text, industry text, size text, founded_year integer, is_active boolean, is_verified boolean, verification_notes text, created_at timestamp with time zone, updated_at timestamp with time zone, user_count bigint, active_users bigint, pending_users bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if current user is admin
    SELECT id INTO admin_user_id
    FROM profiles 
    WHERE id = auth.uid() AND is_admin = true;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can view organization details';
    END IF;
    
    RETURN QUERY
    SELECT 
        o.id, o.name, o.domain, o.description, o.phone, o.email, o.website,
        o.address_line1, o.address_line2, o.city, o.state, o.country, o.postal_code,
        o.industry, o.size, o.founded_year, o.is_active, o.is_verified, o.verification_notes,
        o.created_at, o.updated_at,
        COUNT(p.id) as user_count,
        COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_users
    FROM organizations o
    LEFT JOIN profiles p ON p.organization_id = o.id
    WHERE o.id = org_id
    GROUP BY o.id, o.name, o.domain, o.description, o.phone, o.email, o.website,
             o.address_line1, o.address_line2, o.city, o.state, o.country, o.postal_code,
             o.industry, o.size, o.founded_year, o.is_active, o.is_verified, o.verification_notes,
             o.created_at, o.updated_at;
END;
$$;


--
-- Name: get_organization_statistics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_organization_statistics() RETURNS TABLE(total_organizations bigint, active_organizations bigint, verified_organizations bigint, organizations_by_industry jsonb, organizations_by_size jsonb, total_users bigint, active_users bigint, pending_users bigint, users_by_organization jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if current user is admin
    SELECT id INTO admin_user_id
    FROM profiles 
    WHERE id = auth.uid() AND is_admin = true;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can view organization statistics';
    END IF;
    
    RETURN QUERY
    SELECT 
        COUNT(o.id) as total_organizations,
        COUNT(CASE WHEN o.is_active = true THEN 1 END) as active_organizations,
        COUNT(CASE WHEN o.is_verified = true THEN 1 END) as verified_organizations,
        
        -- Organizations by industry
        COALESCE(
            jsonb_object_agg(
                o.industry, 
                industry_count
            ) FILTER (WHERE o.industry IS NOT NULL),
            '{}'::jsonb
        ) as organizations_by_industry,
        
        -- Organizations by size
        COALESCE(
            jsonb_object_agg(
                o.size, 
                size_count
            ) FILTER (WHERE o.size IS NOT NULL),
            '{}'::jsonb
        ) as organizations_by_size,
        
        COUNT(p.id) as total_users,
        COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_users,
        
        -- Users by organization
        COALESCE(
            jsonb_object_agg(
                o.name, 
                org_user_count
            ) FILTER (WHERE o.name IS NOT NULL),
            '{}'::jsonb
        ) as users_by_organization
        
    FROM organizations o
    LEFT JOIN profiles p ON p.organization_id = o.id
    LEFT JOIN (
        SELECT industry, COUNT(*) as industry_count
        FROM organizations
        WHERE industry IS NOT NULL
        GROUP BY industry
    ) industry_stats ON industry_stats.industry = o.industry
    LEFT JOIN (
        SELECT size, COUNT(*) as size_count
        FROM organizations
        WHERE size IS NOT NULL
        GROUP BY size
    ) size_stats ON size_stats.size = o.size
    LEFT JOIN (
        SELECT o2.id, COUNT(p2.id) as org_user_count
        FROM organizations o2
        LEFT JOIN profiles p2 ON p2.organization_id = o2.id
        GROUP BY o2.id
    ) user_stats ON user_stats.id = o.id;
END;
$$;


--
-- Name: get_unread_notification_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_unread_notification_count(p_user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM notifications
    WHERE user_id = p_user_id AND read = false;
    
    RETURN unread_count;
END;
$$;


--
-- Name: get_upcoming_rounds(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_upcoming_rounds(test_uuid uuid) RETURNS TABLE(id uuid, round_number integer, name text, description text, start_date timestamp with time zone, end_date timestamp with time zone, round_type text)
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.id,
    tr.round_number,
    tr.name,
    tr.description,
    tr.start_date,
    tr.end_date,
    tr.round_type
  FROM test_rounds tr
  WHERE tr.test_id = test_uuid
    AND NOW() < tr.start_date
  ORDER BY tr.round_number;
END;
$$;


--
-- Name: get_user_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_profile(user_id uuid) RETURNS TABLE(id uuid, first_name character varying, last_name character varying, username character varying, codeunia_id character varying, username_set boolean, profile_complete boolean, is_public boolean, created_at timestamp without time zone, updated_at timestamp without time zone)
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.username,
        p.codeunia_id,
        p.username_set,
        p.profile_complete,
        p.is_public,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.id = user_id;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    provided_username TEXT;
    final_username TEXT;
    username_exists BOOLEAN;
    uuid_part TEXT;
    auth_provider TEXT;
BEGIN
    -- Extract first and last name from user metadata
    first_name := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'given_name',
        ''
    );
    
    last_name := COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'family_name',
        ''
    );
    
    -- Extract username from metadata (if provided during signup)
    provided_username := NEW.raw_user_meta_data->>'username';
    
    -- Determine auth provider
    auth_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    
    -- Determine final username
    IF provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 THEN
        -- Check if provided username is available (case-insensitive)
        SELECT EXISTS(SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(provided_username)) INTO username_exists;
        
        IF username_exists THEN
            -- Username taken, generate a fallback
            uuid_part := SUBSTRING(NEW.id::TEXT, 1, 8);
            final_username := 'user-' || uuid_part;
        ELSE
            -- Use provided username
            final_username := provided_username;
        END IF;
    ELSE
        -- No username provided, generate a fallback
        uuid_part := SUBSTRING(NEW.id::TEXT, 1, 8);
        final_username := 'user-' || uuid_part;
    END IF;
    
    -- Ensure username is unique
    WHILE EXISTS (SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
        uuid_part := SUBSTRING(NEW.id::TEXT, 1, 8);
        final_username := 'user-' || uuid_part || '_' || FLOOR(RANDOM() * 1000)::TEXT;
    END LOOP;
    
    -- Insert new profile
    INSERT INTO profiles (
        id,
        email,
        auth_provider,
        first_name,
        last_name,
        username,
        username_editable,
        username_set,
        email_confirmed_at,
        codeunia_id,
        profile_complete,
        setup_completed_at,
        is_public,
        email_notifications,
        profile_completion_percentage,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        auth_provider,
        first_name,
        last_name,
        final_username,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN FALSE
            ELSE TRUE
        END,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN auth_provider != 'email' THEN NOW()
            ELSE NULL
        END,
        generate_codeunia_id(),
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN TRUE
            ELSE FALSE
        END,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN NOW()
            ELSE NULL
        END,
        TRUE,
        TRUE,
        CASE 
            WHEN provided_username IS NOT NULL AND LENGTH(TRIM(provided_username)) > 0 AND NOT username_exists THEN 100
            ELSE 50
        END,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_company_role(uuid, uuid, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_company_role(p_user_id uuid, p_company_id uuid, p_required_roles text[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM company_members
        WHERE user_id = p_user_id 
        AND company_id = p_company_id 
        AND role = ANY(p_required_roles)
        AND status = 'active'
    );
END;
$$;


--
-- Name: increment_company_analytics(uuid, date, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_company_analytics(p_company_id uuid, p_date date, p_field text, p_increment integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Insert or update the analytics record for the given date
    INSERT INTO company_analytics (
        company_id,
        date,
        events_created,
        events_published,
        hackathons_created,
        hackathons_published,
        total_views,
        total_clicks,
        total_registrations,
        total_participants,
        revenue_generated
    )
    VALUES (
        p_company_id,
        p_date,
        CASE WHEN p_field = 'events_created' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'events_published' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'hackathons_created' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'hackathons_published' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'total_views' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'total_clicks' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'total_registrations' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'total_participants' THEN p_increment ELSE 0 END,
        CASE WHEN p_field = 'revenue_generated' THEN p_increment ELSE 0 END
    )
    ON CONFLICT (company_id, date)
    DO UPDATE SET
        events_created = company_analytics.events_created + 
            CASE WHEN p_field = 'events_created' THEN p_increment ELSE 0 END,
        events_published = company_analytics.events_published + 
            CASE WHEN p_field = 'events_published' THEN p_increment ELSE 0 END,
        hackathons_created = company_analytics.hackathons_created + 
            CASE WHEN p_field = 'hackathons_created' THEN p_increment ELSE 0 END,
        hackathons_published = company_analytics.hackathons_published + 
            CASE WHEN p_field = 'hackathons_published' THEN p_increment ELSE 0 END,
        total_views = company_analytics.total_views + 
            CASE WHEN p_field = 'total_views' THEN p_increment ELSE 0 END,
        total_clicks = company_analytics.total_clicks + 
            CASE WHEN p_field = 'total_clicks' THEN p_increment ELSE 0 END,
        total_registrations = company_analytics.total_registrations + 
            CASE WHEN p_field = 'total_registrations' THEN p_increment ELSE 0 END,
        total_participants = company_analytics.total_participants + 
            CASE WHEN p_field = 'total_participants' THEN p_increment ELSE 0 END,
        revenue_generated = company_analytics.revenue_generated + 
            CASE WHEN p_field = 'revenue_generated' THEN p_increment ELSE 0 END;
END;
$$;


--
-- Name: FUNCTION increment_company_analytics(p_company_id uuid, p_date date, p_field text, p_increment integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_company_analytics(p_company_id uuid, p_date date, p_field text, p_increment integer) IS 'Increments a specific analytics field for a company on a given date';


--
-- Name: increment_event_clicks(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_event_clicks(event_id integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE events
    SET clicks = COALESCE(clicks, 0) + 1
    WHERE id = event_id;
END;
$$;


--
-- Name: FUNCTION increment_event_clicks(event_id integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_event_clicks(event_id integer) IS 'Atomically increments the click count for an event';


--
-- Name: increment_event_views(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_event_views(event_id integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE events
    SET views = COALESCE(views, 0) + 1
    WHERE id = event_id;
END;
$$;


--
-- Name: FUNCTION increment_event_views(event_id integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_event_views(event_id integer) IS 'Atomically increments the view count for an event';


--
-- Name: increment_hackathon_clicks(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_hackathon_clicks(hackathon_id integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE hackathons
    SET clicks = COALESCE(clicks, 0) + 1
    WHERE id = hackathon_id;
END;
$$;


--
-- Name: FUNCTION increment_hackathon_clicks(hackathon_id integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_hackathon_clicks(hackathon_id integer) IS 'Atomically increments the click count for a hackathon';


--
-- Name: increment_hackathon_views(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_hackathon_views(hackathon_id integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE hackathons
    SET views = COALESCE(views, 0) + 1
    WHERE id = hackathon_id;
END;
$$;


--
-- Name: FUNCTION increment_hackathon_views(hackathon_id integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.increment_hackathon_views(hackathon_id integer) IS 'Atomically increments the view count for a hackathon';


--
-- Name: increment_points(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_points(user_id uuid, points_to_add integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  UPDATE user_points 
  SET total_points = total_points + points_to_add,
      last_updated = NOW()
  WHERE user_points.user_id = increment_points.user_id;
  
  -- If user doesn't have points record, create one
  IF NOT FOUND THEN
    INSERT INTO user_points (user_id, total_points, rank)
    VALUES (increment_points.user_id, points_to_add, 0);
  END IF;
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO ''
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    );
$$;


--
-- Name: is_company_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_company_member(p_user_id uuid, p_company_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM company_members
        WHERE user_id = p_user_id 
        AND company_id = p_company_id 
        AND status = 'active'
    );
END;
$$;


--
-- Name: is_profile_complete(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_profile_complete(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM profiles WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN profile_record.profile_complete = TRUE;
END;
$$;


--
-- Name: is_public_domain(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_public_domain(domain_name text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    IF domain_name IS NULL THEN
        RETURN false;
    END IF;
    
    -- List of common public email domains
    RETURN domain_name IN (
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
        'aol.com', 'icloud.com', 'protonmail.com', 'yandex.com', 'mail.com',
        'zoho.com', 'fastmail.com', 'tutanota.com', 'gmx.com', 'web.de'
    );
END;
$$;


--
-- Name: list_organizations(boolean, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_organizations(include_inactive boolean DEFAULT false, industry_filter text DEFAULT NULL::text, verified_only boolean DEFAULT false) RETURNS TABLE(id uuid, name text, domain text, description text, phone text, email text, website text, industry text, size text, is_active boolean, is_verified boolean, created_at timestamp with time zone, user_count bigint, active_users bigint, pending_users bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if current user is admin
    SELECT id INTO admin_user_id
    FROM profiles 
    WHERE id = auth.uid() AND is_admin = true;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can list organizations';
    END IF;
    
    RETURN QUERY
    SELECT 
        o.id, o.name, o.domain, o.description, o.phone, o.email, o.website,
        o.industry, o.size, o.is_active, o.is_verified, o.created_at,
        COUNT(p.id) as user_count,
        COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_users
    FROM organizations o
    LEFT JOIN profiles p ON p.organization_id = o.id
    WHERE 
        (include_inactive = true OR o.is_active = true)
        AND (industry_filter IS NULL OR o.industry = industry_filter)
        AND (verified_only = false OR o.is_verified = true)
    GROUP BY o.id, o.name, o.domain, o.description, o.phone, o.email, o.website,
             o.industry, o.size, o.is_active, o.is_verified, o.created_at
    ORDER BY o.name;
END;
$$;


--
-- Name: log_event_creation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_event_creation() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO event_audit_log (event_id, company_id, user_id, action, event_title, event_date)
  VALUES (NEW.id, NEW.company_id, NEW.created_by, 'created', NEW.title, NEW.date);
  RETURN NEW;
END;
$$;


--
-- Name: log_event_deletion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_event_deletion() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO event_audit_log (event_id, company_id, user_id, action, event_title, event_date)
  VALUES (OLD.id, OLD.company_id, COALESCE(auth.uid(), OLD.created_by), 'deleted', OLD.title, OLD.date);
  RETURN OLD;
END;
$$;


--
-- Name: log_user_activity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_user_activity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if user_activity table exists before trying to insert
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_activity'
  ) THEN
    -- Try to insert activity log
    BEGIN
      INSERT INTO user_activity (user_id, activity_type, activity_data, activity_date)
      VALUES (NEW.user_id, 'test_registration', 
              jsonb_build_object('test_id', NEW.test_id, 'status', NEW.status), 
              CURRENT_DATE);
    EXCEPTION
      WHEN OTHERS THEN
        -- Log warning but don't fail the transaction
        RAISE WARNING 'Failed to log user activity: %', SQLERRM;
    END;
  ELSE
    -- Table doesn't exist, just log a warning
    RAISE WARNING 'user_activity table does not exist, skipping activity log';
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: mark_all_notifications_read(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_all_notifications_read(p_user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications
    SET read = true, read_at = NOW()
    WHERE user_id = p_user_id AND read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;


--
-- Name: mark_inactive_users_offline(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_inactive_users_offline() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE user_presence
  SET is_online = false
  WHERE is_online = true
    AND updated_at < NOW() - INTERVAL '5 minutes';
END;
$$;


--
-- Name: mark_notification_read(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_notification_read(p_notification_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE notifications
    SET read = true, read_at = NOW()
    WHERE id = p_notification_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$;


--
-- Name: notify_company_rejected(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_company_rejected() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    member_record RECORD;
BEGIN
    IF NEW.verification_status = 'rejected' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'rejected') THEN
        -- Notify all company members
        FOR member_record IN 
            SELECT user_id FROM company_members 
            WHERE company_id = NEW.id AND status = 'active'
        LOOP
            PERFORM create_notification(
                member_record.user_id,
                'company_rejected',
                'Company Verification Update',
                'Your company verification was not approved. Please review the feedback and resubmit.',
                NEW.id,
                '/companies/register',
                'Review Feedback',
                NULL,
                NULL,
                jsonb_build_object('company_name', NEW.name, 'rejection_reason', NEW.verification_notes)
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: notify_company_verified(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_company_verified() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    member_record RECORD;
BEGIN
    IF NEW.verification_status = 'verified' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
        -- Notify all company members
        FOR member_record IN 
            SELECT user_id FROM company_members 
            WHERE company_id = NEW.id AND status = 'active'
        LOOP
            PERFORM create_notification(
                member_record.user_id,
                'company_verified',
                'Company Verified!',
                'Your company ' || NEW.name || ' has been verified and is now live on CodeUnia.',
                NEW.id,
                '/dashboard/company/' || NEW.slug,
                'View Dashboard',
                NULL,
                NULL,
                jsonb_build_object('company_name', NEW.name, 'company_slug', NEW.slug)
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: notify_event_approved(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_event_approved() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'notify_event_approved triggered for event_id: %, OLD status: %, NEW status: %', 
        NEW.id, OLD.approval_status, NEW.approval_status;
    
    -- Only notify if status is changing TO approved (not already approved)
    IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
        RAISE NOTICE 'Creating notification for event_id: %, user_id: %', NEW.id, NEW.created_by;
        
        -- Notify the event creator
        IF NEW.created_by IS NOT NULL THEN
            PERFORM create_notification(
                NEW.created_by,
                'event_approved',
                'Event Approved!',
                'Your event "' || NEW.title || '" has been approved and is now live.',
                NEW.company_id,
                '/events/' || NEW.slug,
                'View Event',
                NEW.id,
                NULL,
                jsonb_build_object('event_title', NEW.title, 'event_slug', NEW.slug)
            );
            
            RAISE NOTICE 'Notification created successfully for event_id: %', NEW.id;
        END IF;
    ELSE
        RAISE NOTICE 'Skipping notification - condition not met';
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: notify_event_changes_requested(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_event_changes_requested() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF NEW.approval_status = 'changes_requested' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'changes_requested') THEN
        -- Notify the event creator
        IF NEW.created_by IS NOT NULL THEN
            PERFORM create_notification(
                NEW.created_by,
                'event_changes_requested',
                'Changes Requested',
                'Changes have been requested for your event "' || NEW.title || '".',
                NEW.company_id,
                '/dashboard/company/events/' || NEW.slug || '/edit',
                'View Feedback',
                NEW.id,
                NULL,
                jsonb_build_object('event_title', NEW.title, 'feedback', NEW.moderation_feedback)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: notify_event_rejected(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_event_rejected() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF NEW.approval_status = 'rejected' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'rejected') THEN
        -- Notify the event creator
        IF NEW.created_by IS NOT NULL THEN
            PERFORM create_notification(
                NEW.created_by,
                'event_rejected',
                'Event Review Update',
                'Your event "' || NEW.title || '" was not approved. Please review the feedback.',
                NEW.company_id,
                '/dashboard/company/events/' || NEW.slug || '/edit',
                'Edit Event',
                NEW.id,
                NULL,
                jsonb_build_object('event_title', NEW.title, 'rejection_reason', NEW.rejection_reason)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: notify_hackathon_approved(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_hackathon_approved() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
        IF NEW.created_by IS NOT NULL THEN
            PERFORM create_notification(
                NEW.created_by,
                'hackathon_approved',
                'Hackathon Approved!',
                'Your hackathon "' || NEW.title || '" has been approved and is now live.',
                NEW.company_id,
                '/hackathons/' || NEW.id,
                'View Hackathon',
                NULL,
                NEW.id,
                jsonb_build_object('hackathon_title', NEW.title)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: process_organization_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_organization_data() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    domain_name TEXT;
    org_id UUID;
BEGIN
    -- If email is provided and org_domain is not set, process it
    IF NEW.email IS NOT NULL AND (NEW.org_domain IS NULL OR NEW.org_domain = '') THEN
        domain_name := extract_email_domain(NEW.email);
        org_id := find_or_create_organization(domain_name);
        
        NEW.org_domain := domain_name;
        NEW.organization_id := org_id;
        
        -- Set status based on domain if not already set
        IF NEW.status IS NULL OR NEW.status = 'pending' THEN
            NEW.status := determine_user_status(NEW.email);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: recalculate_user_ranks(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalculate_user_ranks() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  -- Update ranks based on total points (descending)
  UPDATE user_points 
  SET rank = subquery.new_rank
  FROM (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, last_updated ASC) as new_rank
    FROM user_points
  ) as subquery
  WHERE user_points.user_id = subquery.user_id;
END;
$$;


--
-- Name: set_profile_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_profile_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  -- Fetch email from auth.users and set it
  SELECT u.email
  INTO NEW.email
  FROM auth.users u
  WHERE u.id = NEW.id;

  RETURN NEW;
END;
$$;


--
-- Name: set_username(uuid, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_username(user_id uuid, new_username character varying) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Get current profile
    SELECT * INTO profile_record FROM profiles WHERE id = user_id;
    
    -- Check if profile exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;
    
    -- Check if username is already set
    IF profile_record.username_set THEN
        RAISE EXCEPTION 'Username is already set and cannot be changed';
    END IF;
    
    -- Validate username format
    IF NOT validate_username(new_username) THEN
        RAISE EXCEPTION 'Invalid username format. Must be 3-50 characters, alphanumeric and underscores only';
    END IF;
    
    -- Check if username is already taken
    IF EXISTS (SELECT 1 FROM profiles WHERE username = new_username AND id != user_id) THEN
        RAISE EXCEPTION 'Username is already taken';
    END IF;
    
    -- Update profile
    UPDATE profiles 
    SET username = new_username, 
        username_set = TRUE,
        profile_complete = TRUE,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$;


--
-- Name: sync_intern_names(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_intern_names() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
declare
  prof record;
begin
  -- Case 1: Insert into interns
  if TG_TABLE_NAME = 'interns' and TG_OP = 'INSERT' then
    select first_name, last_name
      into prof
      from public.profiles
     where email = new.email;

    if prof is not null then
      new.first_name := prof.first_name;
      new.last_name  := prof.last_name;
    end if;
    return new;
  end if;

  -- Case 2: Update in profiles
  if TG_TABLE_NAME = 'profiles' and TG_OP = 'UPDATE' then
    update public.interns
       set first_name = new.first_name,
           last_name  = new.last_name
     where email = new.email;
    return new;
  end if;

  return new;
end;
$$;


--
-- Name: sync_test_registrations_profile_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_test_registrations_profile_data() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Try to get profile data, but don't fail if it doesn't exist
  BEGIN
    SELECT TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')),
           p.email
    INTO NEW.full_name, NEW.email
    FROM profiles p
    WHERE p.id = NEW.user_id;
    
    -- If no profile found or empty values, use provided values
    IF NEW.full_name IS NULL OR NEW.full_name = '' THEN
      NEW.full_name := COALESCE(NEW.full_name, 'Unknown User');
    END IF;
    
    IF NEW.email IS NULL OR NEW.email = '' THEN
      NEW.email := COALESCE(NEW.email, '');
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- If any error occurs, just use the provided values and continue
      NEW.full_name := COALESCE(NEW.full_name, 'Unknown User');
      NEW.email := COALESCE(NEW.email, '');
  END;
  
  RETURN NEW;
END;
$$;


--
-- Name: track_event_registration(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.track_event_registration() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_company_id UUID;
  v_today DATE;
BEGIN
  v_today := CURRENT_DATE;

  -- Get company_id from the event
  IF TG_TABLE_NAME = 'event_registrations' THEN
    SELECT company_id INTO v_company_id
    FROM events
    WHERE id = NEW.event_id;
  ELSIF TG_TABLE_NAME = 'hackathon_registrations' THEN
    SELECT company_id INTO v_company_id
    FROM hackathons
    WHERE id = NEW.hackathon_id;
  END IF;

  -- Update analytics if company exists
  IF v_company_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM increment_company_analytics(
        v_company_id,
        v_today,
        'total_registrations',
        1
      );
      
      -- Update total_participants in companies table
      UPDATE companies
      SET total_participants = total_participants + 1
      WHERE id = v_company_id;
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM increment_company_analytics(
        v_company_id,
        v_today,
        'total_registrations',
        -1
      );
      
      -- Update total_participants in companies table
      UPDATE companies
      SET total_participants = GREATEST(total_participants - 1, 0)
      WHERE id = v_company_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


--
-- Name: trigger_generate_certificate_path(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_generate_certificate_path() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  -- Generate certificate file path when a new certificate is created
  IF NEW.certificate_url IS NULL THEN
    NEW.certificate_url := generate_certificate_path(NEW.cert_id, 'pdf');
  END IF;
  
  -- Generate QR code path if not provided
  IF NEW.qr_code_url IS NULL THEN
    NEW.qr_code_url := generate_certificate_path(NEW.cert_id, 'png');
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: trigger_recalculate_ranks(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_recalculate_ranks() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  -- Only recalculate if points actually changed
  IF OLD.total_points != NEW.total_points THEN
    PERFORM recalculate_user_ranks();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: trigger_update_company_registrations_from_events(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_update_company_registrations_from_events() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.company_id IS NOT NULL THEN
      PERFORM update_company_total_registrations(NEW.company_id);
    END IF;
    
    -- If company_id changed in UPDATE, update old company too
    IF TG_OP = 'UPDATE' AND OLD.company_id IS DISTINCT FROM NEW.company_id THEN
      IF OLD.company_id IS NOT NULL THEN
        PERFORM update_company_total_registrations(OLD.company_id);
      END IF;
    END IF;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.company_id IS NOT NULL THEN
      PERFORM update_company_total_registrations(OLD.company_id);
    END IF;
  END IF;
  
  -- Return appropriate value based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


--
-- Name: trigger_update_company_registrations_from_hackathons(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_update_company_registrations_from_hackathons() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.company_id IS NOT NULL THEN
      PERFORM update_company_total_registrations(NEW.company_id);
    END IF;
    
    -- If company_id changed in UPDATE, update old company too
    IF TG_OP = 'UPDATE' AND OLD.company_id IS DISTINCT FROM NEW.company_id THEN
      IF OLD.company_id IS NOT NULL THEN
        PERFORM update_company_total_registrations(OLD.company_id);
      END IF;
    END IF;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.company_id IS NOT NULL THEN
      PERFORM update_company_total_registrations(OLD.company_id);
    END IF;
  END IF;
  
  -- Return appropriate value based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


--
-- Name: update_company_events_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_company_events_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- When event becomes approved
        IF NEW.approval_status = 'approved' AND (OLD IS NULL OR OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
            UPDATE companies
            SET total_events = total_events + 1
            WHERE id = NEW.company_id;
        END IF;
        
        -- When event becomes unapproved (was approved, now not)
        IF TG_OP = 'UPDATE' AND OLD.approval_status = 'approved' AND NEW.approval_status != 'approved' THEN
            UPDATE companies
            SET total_events = GREATEST(total_events - 1, 0)
            WHERE id = OLD.company_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        -- If deleted event was approved, decrement count
        IF OLD.approval_status = 'approved' AND OLD.company_id IS NOT NULL THEN
            UPDATE companies
            SET total_events = GREATEST(total_events - 1, 0)
            WHERE id = OLD.company_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;


--
-- Name: update_company_hackathons_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_company_hackathons_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- When hackathon becomes approved
        IF NEW.approval_status = 'approved' AND (OLD IS NULL OR OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
            UPDATE companies
            SET total_hackathons = total_hackathons + 1
            WHERE id = NEW.company_id;
        END IF;
        
        -- When hackathon becomes unapproved (was approved, now not)
        IF TG_OP = 'UPDATE' AND OLD.approval_status = 'approved' AND NEW.approval_status != 'approved' THEN
            UPDATE companies
            SET total_hackathons = GREATEST(total_hackathons - 1, 0)
            WHERE id = OLD.company_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        -- If deleted hackathon was approved, decrement count
        IF OLD.approval_status = 'approved' AND OLD.company_id IS NOT NULL THEN
            UPDATE companies
            SET total_hackathons = GREATEST(total_hackathons - 1, 0)
            WHERE id = OLD.company_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;


--
-- Name: update_company_statistics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_company_statistics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update company total_events when an event is created
  IF TG_TABLE_NAME = 'events' THEN
    IF TG_OP = 'INSERT' AND NEW.company_id IS NOT NULL THEN
      UPDATE companies
      SET total_events = total_events + 1
      WHERE id = NEW.company_id;
    ELSIF TG_OP = 'DELETE' AND OLD.company_id IS NOT NULL THEN
      UPDATE companies
      SET total_events = GREATEST(total_events - 1, 0)
      WHERE id = OLD.company_id;
    END IF;
  END IF;

  -- Update company total_hackathons when a hackathon is created
  IF TG_TABLE_NAME = 'hackathons' THEN
    IF TG_OP = 'INSERT' AND NEW.company_id IS NOT NULL THEN
      UPDATE companies
      SET total_hackathons = total_hackathons + 1
      WHERE id = NEW.company_id;
    ELSIF TG_OP = 'DELETE' AND OLD.company_id IS NOT NULL THEN
      UPDATE companies
      SET total_hackathons = GREATEST(total_hackathons - 1, 0)
      WHERE id = OLD.company_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


--
-- Name: update_company_total_registrations(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_company_total_registrations(company_uuid uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  total_count INTEGER;
BEGIN
  -- Calculate sum from both tables in a single query
  SELECT COALESCE(
    (SELECT SUM(registered) FROM events WHERE company_id = company_uuid), 0
  ) + COALESCE(
    (SELECT SUM(registered) FROM hackathons WHERE company_id = company_uuid), 0
  )
  INTO total_count;
  
  -- Update the company's total_registrations
  UPDATE companies
  SET 
    total_registrations = total_count,
    updated_at = NOW()
  WHERE id = company_uuid;
  
  RETURN total_count;
END;
$$;


--
-- Name: update_conversation_last_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_conversation_last_message() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_content = NEW.content,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


--
-- Name: update_event_registration_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_event_registration_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  event_id_int INTEGER;
  new_count INTEGER;
BEGIN
  -- Only process if this is an event registration
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.activity_type != 'event' THEN
      RETURN NEW;
    END IF;
    event_id_int := NEW.activity_id::INTEGER;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.activity_type != 'event' THEN
      RETURN OLD;
    END IF;
    event_id_int := OLD.activity_id::INTEGER;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Count active registrations for this event
  SELECT COUNT(*)
  INTO new_count
  FROM master_registrations
  WHERE activity_type = 'event'
    AND activity_id = event_id_int::TEXT
    AND status IN ('registered', 'confirmed', 'attended');

  -- Update the events table
  UPDATE events
  SET 
    registered = new_count,
    updated_at = NOW()
  WHERE id = event_id_int;

  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: FUNCTION update_event_registration_count(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_event_registration_count() IS 'Automatically updates events.registered count when master_registrations changes';


--
-- Name: update_hackathon_registration_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_hackathon_registration_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  hackathon_id_int INTEGER;
  new_count INTEGER;
BEGIN
  -- Only process if this is a hackathon registration
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.activity_type != 'hackathon' THEN
      RETURN NEW;
    END IF;
    hackathon_id_int := NEW.activity_id::INTEGER;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.activity_type != 'hackathon' THEN
      RETURN OLD;
    END IF;
    hackathon_id_int := OLD.activity_id::INTEGER;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Count active registrations for this hackathon
  SELECT COUNT(*)
  INTO new_count
  FROM master_registrations
  WHERE activity_type = 'hackathon'
    AND activity_id = hackathon_id_int::TEXT
    AND status IN ('registered', 'confirmed', 'attended');

  -- Update the hackathons table
  UPDATE hackathons
  SET 
    registered = new_count,
    updated_at = NOW()
  WHERE id = hackathon_id_int;

  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: FUNCTION update_hackathon_registration_count(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_hackathon_registration_count() IS 'Automatically updates hackathons.registered count when master_registrations changes';


--
-- Name: update_organization(uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_organization(org_id uuid, org_name text DEFAULT NULL::text, org_description text DEFAULT NULL::text, org_phone text DEFAULT NULL::text, org_email text DEFAULT NULL::text, org_website text DEFAULT NULL::text, org_address_line1 text DEFAULT NULL::text, org_address_line2 text DEFAULT NULL::text, org_city text DEFAULT NULL::text, org_state text DEFAULT NULL::text, org_country text DEFAULT NULL::text, org_postal_code text DEFAULT NULL::text, org_industry text DEFAULT NULL::text, org_size text DEFAULT NULL::text, org_founded_year integer DEFAULT NULL::integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if current user is admin
    SELECT id INTO admin_user_id
    FROM profiles 
    WHERE id = auth.uid() AND is_admin = true;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can update organizations';
    END IF;
    
    -- Update the organization
    UPDATE organizations
    SET 
        name = COALESCE(org_name, name),
        description = COALESCE(org_description, description),
        phone = COALESCE(org_phone, phone),
        email = COALESCE(org_email, email),
        website = COALESCE(org_website, website),
        address_line1 = COALESCE(org_address_line1, address_line1),
        address_line2 = COALESCE(org_address_line2, address_line2),
        city = COALESCE(org_city, city),
        state = COALESCE(org_state, state),
        country = COALESCE(org_country, country),
        postal_code = COALESCE(org_postal_code, postal_code),
        industry = COALESCE(org_industry, industry),
        size = COALESCE(org_size, size),
        founded_year = COALESCE(org_founded_year, founded_year),
        updated_at = NOW()
    WHERE id = org_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Organization not found: %', org_id;
    END IF;
    
    RETURN true;
END;
$$;


--
-- Name: update_support_tickets_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_support_tickets_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_user_organization_data(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_organization_data(user_id uuid, user_email text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    domain_name TEXT;
    user_status TEXT;
    org_id UUID;
BEGIN
    -- Extract domain and determine status
    domain_name := extract_email_domain(user_email);
    user_status := determine_user_status(user_email);
    
    -- Find or create organization
    org_id := find_or_create_organization(domain_name);
    
    -- Update profile with organization data
    UPDATE profiles
    SET 
        org_domain = domain_name,
        organization_id = org_id,
        status = user_status,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN true;
END;
$$;


--
-- Name: update_user_presence_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_presence_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_username(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_username(user_id uuid, new_username text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    can_edit BOOLEAN;
    username_exists BOOLEAN;
BEGIN
    -- Check if user can still edit username
    SELECT username_editable INTO can_edit 
    FROM public.profiles 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF NOT can_edit THEN
        RETURN FALSE; -- Username already edited once
    END IF;
    
    -- Check if new username already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = new_username AND id != user_id) 
    INTO username_exists;
    
    IF username_exists THEN
        RETURN FALSE; -- Username already taken
    END IF;
    
    -- Update username and mark as non-editable
    UPDATE public.profiles 
    SET username = new_username, username_editable = FALSE
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$;


--
-- Name: user_has_company_role(uuid, uuid, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_has_company_role(p_user_id uuid, p_company_id uuid, p_roles text[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM company_members
        WHERE user_id = p_user_id 
        AND company_id = p_company_id 
        AND role = ANY(p_roles)
        AND status = 'active'
    );
$$;


--
-- Name: FUNCTION user_has_company_role(p_user_id uuid, p_company_id uuid, p_roles text[]); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.user_has_company_role(p_user_id uuid, p_company_id uuid, p_roles text[]) IS 'Helper function to check company role without RLS recursion';


--
-- Name: user_is_company_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_is_company_member(p_user_id uuid, p_company_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM company_members
        WHERE user_id = p_user_id 
        AND company_id = p_company_id 
        AND status = 'active'
    );
$$;


--
-- Name: FUNCTION user_is_company_member(p_user_id uuid, p_company_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.user_is_company_member(p_user_id uuid, p_company_id uuid) IS 'Helper function to check company membership without RLS recursion';


--
-- Name: validate_certificate_file(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_certificate_file(cert_id text) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cert_record RECORD;
  file_exists BOOLEAN;
BEGIN
  -- Get certificate record
  SELECT * INTO cert_record 
  FROM certificates 
  WHERE certificates.cert_id = validate_certificate_file.cert_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if file exists in storage (this is a simplified check)
  -- In a real implementation, you would use the storage API
  SELECT EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'certificates' 
    AND name = cert_record.certificate_url
  ) INTO file_exists;
  
  RETURN file_exists;
END;
$$;


--
-- Name: validate_username(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_username(username_param character varying) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
BEGIN
    -- Username must be 3-50 characters, alphanumeric and underscores only
    RETURN username_param ~ '^[a-zA-Z0-9_]{3,50}$';
END;
$_$;


--
-- Name: verify_organization(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.verify_organization(org_id uuid, verification_notes text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if current user is admin
    SELECT id INTO admin_user_id
    FROM profiles 
    WHERE id = auth.uid() AND is_admin = true;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Only admins can verify organizations';
    END IF;
    
    -- Update organization verification status
    UPDATE organizations
    SET 
        is_verified = true,
        verification_notes = verification_notes,
        verified_by = admin_user_id,
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = org_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Organization not found: %', org_id;
    END IF;
    
    -- Update all users from this organization to active status
    UPDATE profiles
    SET 
        status = 'active',
        is_org_verified = true,
        updated_at = NOW()
    WHERE organization_id = org_id AND status = 'pending';
    
    RETURN true;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    action_type text NOT NULL,
    target_resource text NOT NULL,
    target_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_audit_logs_action_type_check CHECK ((action_type = ANY (ARRAY['user_created'::text, 'user_updated'::text, 'user_deleted'::text, 'user_role_changed'::text, 'premium_membership_granted'::text, 'premium_membership_revoked'::text, 'premium_membership_updated'::text, 'leaderboard_updated'::text, 'leaderboard_reset'::text, 'leaderboard_cleared'::text, 'hackathon_created'::text, 'hackathon_updated'::text, 'hackathon_deleted'::text, 'hackathon_published'::text, 'certificate_generated'::text, 'certificate_sent'::text, 'certificate_revoked'::text, 'internship_application_updated'::text, 'internship_status_changed'::text, 'system_config_updated'::text, 'system_maintenance'::text, 'system_backup'::text, 'admin_login'::text, 'admin_logout'::text, 'admin_password_changed'::text, 'data_export'::text, 'data_import'::text, 'bulk_operation'::text, 'security_event'::text, 'suspicious_activity'::text, 'rate_limit_exceeded'::text, 'webhook_processed'::text, 'api_access'::text, 'admin_action'::text])))
);


--
-- Name: TABLE admin_audit_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.admin_audit_logs IS 'Comprehensive audit log for all admin actions and system events';


--
-- Name: COLUMN admin_audit_logs.admin_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_audit_logs.admin_id IS 'ID of the admin user who performed the action';


--
-- Name: COLUMN admin_audit_logs.action_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_audit_logs.action_type IS 'Type of action performed (standardized enum)';


--
-- Name: COLUMN admin_audit_logs.target_resource; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_audit_logs.target_resource IS 'Resource that was affected (e.g., user:123, hackathon:456)';


--
-- Name: COLUMN admin_audit_logs.target_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_audit_logs.target_id IS 'UUID of the affected resource (if applicable)';


--
-- Name: COLUMN admin_audit_logs.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_audit_logs.metadata IS 'Additional details about the action in JSON format';


--
-- Name: COLUMN admin_audit_logs.ip_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_audit_logs.ip_address IS 'IP address of the admin performing the action';


--
-- Name: COLUMN admin_audit_logs.user_agent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_audit_logs.user_agent IS 'User agent string from the request';


--
-- Name: ai_training_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_training_data (
    id bigint NOT NULL,
    user_id uuid,
    session_id uuid,
    query_text text NOT NULL,
    response_text text NOT NULL,
    context_type character varying(50),
    user_feedback integer,
    is_helpful boolean,
    response_time_ms integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ai_training_data_context_type_check CHECK (((context_type)::text = ANY ((ARRAY['general'::character varying, 'events'::character varying, 'hackathons'::character varying, 'opportunities'::character varying, 'blogs'::character varying, 'search'::character varying])::text[]))),
    CONSTRAINT ai_training_data_user_feedback_check CHECK (((user_feedback >= 1) AND (user_feedback <= 5)))
);


--
-- Name: ai_training_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_training_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_training_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_training_data_id_seq OWNED BY public.ai_training_data.id;


--
-- Name: backup_collaboration_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_collaboration_applications (
    id uuid,
    organization_name text,
    website text,
    contact_person text,
    email text,
    collaboration_reason text,
    status text,
    created_at timestamp with time zone
);


--
-- Name: backup_event_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_event_registrations (
    id bigint,
    user_id uuid,
    event_id bigint,
    registration_date timestamp with time zone,
    status text,
    payment_status text,
    notes text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: backup_internship_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_internship_applications (
    id uuid,
    user_id uuid,
    email text,
    internship_id text,
    domain public.internship_domain,
    level text,
    cover_note text,
    status text,
    created_at timestamp with time zone,
    remarks text,
    repo_url text,
    duration_weeks integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    order_id text,
    payment_id text,
    payment_signature text,
    amount_paid integer,
    currency text,
    payment_status text,
    is_paid boolean,
    paid_at timestamp with time zone,
    original_amount integer,
    discount_applied integer
);


--
-- Name: backup_judges_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_judges_applications (
    id uuid,
    first_name text,
    last_name text,
    email text,
    phone text,
    location text,
    occupation text,
    company text,
    experience text,
    expertise text,
    linkedin text,
    expertise_areas text[],
    event_types text[],
    motivation text,
    previous_judging text,
    status text,
    created_at timestamp with time zone
);


--
-- Name: backup_mentor_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_mentor_applications (
    id uuid,
    first_name text,
    last_name text,
    email text,
    phone text,
    location text,
    occupation text,
    company text,
    experience text,
    expertise text,
    linkedin text,
    expertise_areas text[],
    mentoring_types text[],
    availability text,
    commitment text,
    motivation text,
    previous_mentoring text,
    teaching_style text,
    status text,
    created_at timestamp with time zone
);


--
-- Name: backup_round_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_round_registrations (
    id uuid,
    test_id uuid,
    round_id uuid,
    user_id uuid,
    registration_date timestamp with time zone,
    status text,
    score integer,
    max_score integer,
    time_taken_minutes integer,
    submission_data jsonb,
    feedback text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: backup_sponsorship_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_sponsorship_applications (
    id uuid,
    company_name text,
    industry text,
    company_size text,
    contact_name text,
    designation text,
    email text,
    phone text,
    website text,
    preferred_events text[],
    marketing_goals text,
    target_audience text,
    specific_requirements text,
    created_at timestamp with time zone,
    status text
);


--
-- Name: backup_test_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_test_registrations (
    id uuid,
    test_id uuid,
    user_id uuid,
    registration_date timestamp with time zone,
    status text,
    attempt_count integer,
    best_score integer,
    best_attempt_id uuid,
    created_at timestamp with time zone,
    registration_data jsonb,
    full_name text,
    email text,
    phone text,
    institution text,
    department text,
    year_of_study text,
    experience_level text
);


--
-- Name: backup_volunteer_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.backup_volunteer_applications (
    id uuid,
    first_name text,
    last_name text,
    email text,
    phone text,
    location text,
    occupation text,
    company text,
    experience text,
    skills text,
    interests text[],
    motivation text,
    previous_volunteer text,
    status text,
    created_at timestamp with time zone
);


--
-- Name: blog_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    blog_slug text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


--
-- Name: blogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text,
    content text,
    author text,
    date date,
    "readTime" text,
    category text,
    tags text[],
    featured boolean DEFAULT false,
    image text,
    views integer,
    likes integer DEFAULT 0
);


--
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id bigint NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text NOT NULL,
    description text NOT NULL,
    organizer text NOT NULL,
    organizer_contact jsonb,
    date date NOT NULL,
    "time" text NOT NULL,
    duration text NOT NULL,
    category text NOT NULL,
    categories text[] DEFAULT '{}'::text[] NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    image text,
    location text NOT NULL,
    locations text[] DEFAULT '{}'::text[] NOT NULL,
    capacity integer DEFAULT 0 NOT NULL,
    registered integer DEFAULT 0 NOT NULL,
    price text NOT NULL,
    payment text NOT NULL,
    status text DEFAULT 'live'::text NOT NULL,
    event_type text[] DEFAULT '{}'::text[] NOT NULL,
    team_size jsonb,
    user_types text[] DEFAULT '{}'::text[] NOT NULL,
    registration_required boolean DEFAULT true NOT NULL,
    registration_deadline date,
    rules text[],
    schedule jsonb,
    prize text,
    prize_details text,
    faq jsonb,
    socials jsonb,
    sponsors jsonb,
    marking_scheme jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    company_id uuid,
    created_by uuid,
    approval_status text DEFAULT 'pending'::text,
    approved_at timestamp with time zone,
    approved_by uuid,
    rejection_reason text,
    moderation_feedback text,
    is_codeunia_event boolean DEFAULT false,
    views integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    CONSTRAINT events_approval_status_check CHECK ((approval_status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'changes_requested'::text, 'deleted'::text]))),
    CONSTRAINT events_status_check CHECK ((status = ANY (ARRAY['live'::text, 'expired'::text, 'closed'::text, 'recent'::text])))
);


--
-- Name: COLUMN events.approval_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.approval_status IS 'Approval status: draft, pending, approved, rejected, changes_requested, deleted (soft delete for approved content)';


--
-- Name: COLUMN events.views; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.views IS 'Number of times this event has been viewed';


--
-- Name: COLUMN events.clicks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.clicks IS 'Number of times users have clicked on this event (e.g., registration button)';


--
-- Name: hackathons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hackathons (
    id bigint NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text NOT NULL,
    description text NOT NULL,
    organizer text NOT NULL,
    organizer_contact jsonb,
    date date NOT NULL,
    "time" text NOT NULL,
    duration text NOT NULL,
    registration_deadline date,
    category text NOT NULL,
    categories text[] DEFAULT '{}'::text[] NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    image text,
    location text NOT NULL,
    locations text[] DEFAULT '{}'::text[] NOT NULL,
    capacity integer DEFAULT 0 NOT NULL,
    registered integer DEFAULT 0 NOT NULL,
    team_size jsonb,
    user_types text[] DEFAULT '{}'::text[] NOT NULL,
    price text NOT NULL,
    payment text NOT NULL,
    status text DEFAULT 'live'::text NOT NULL,
    event_type text[] DEFAULT '{}'::text[] NOT NULL,
    registration_required boolean DEFAULT true NOT NULL,
    rules text[],
    schedule jsonb,
    prize text,
    prize_details text,
    faq jsonb,
    socials jsonb,
    sponsors jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    company_id uuid,
    created_by uuid,
    approval_status text DEFAULT 'pending'::text,
    approved_at timestamp with time zone,
    approved_by uuid,
    rejection_reason text,
    moderation_feedback text,
    is_codeunia_event boolean DEFAULT false,
    views integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    CONSTRAINT hackathons_approval_status_check CHECK ((approval_status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'changes_requested'::text, 'deleted'::text])))
);


--
-- Name: COLUMN hackathons.approval_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hackathons.approval_status IS 'Approval status: draft, pending, approved, rejected, changes_requested, deleted (soft delete for approved content)';


--
-- Name: COLUMN hackathons.views; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hackathons.views IS 'Number of times this hackathon has been viewed';


--
-- Name: COLUMN hackathons.clicks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hackathons.clicks IS 'Number of times users have clicked on this hackathon (e.g., registration button)';


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    first_name text,
    last_name text,
    bio text,
    phone text,
    github_url text,
    linkedin_url text,
    twitter_url text,
    current_position text,
    company text,
    location text,
    skills text[],
    is_public boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    profile_completion_percentage integer DEFAULT 0,
    platform text DEFAULT 'codeunia'::text,
    username character varying(50),
    codeunia_id character varying(20),
    username_set boolean DEFAULT false,
    profile_complete boolean DEFAULT false,
    is_premium boolean DEFAULT false,
    premium_expires_at timestamp with time zone,
    premium_plan text,
    premium_purchased_at timestamp with time zone,
    points_multiplier integer DEFAULT 1,
    email text,
    is_admin boolean DEFAULT false,
    username_editable boolean DEFAULT true,
    membership_card_sent boolean DEFAULT false,
    membership_card_sent_at timestamp with time zone,
    organization_id uuid,
    org_domain text,
    status text DEFAULT 'pending'::text,
    is_org_verified boolean DEFAULT false,
    avatar_url text,
    allow_messages_from_anyone boolean DEFAULT false,
    allow_messages_from_connections boolean DEFAULT true,
    CONSTRAINT profiles_status_check CHECK ((status = ANY (ARRAY['active'::text, 'pending'::text, 'rejected'::text])))
);


--
-- Name: COLUMN profiles.organization_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.organization_id IS 'Reference to organizations table';


--
-- Name: COLUMN profiles.org_domain; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.org_domain IS 'Email domain extracted from user email (for quick lookups)';


--
-- Name: COLUMN profiles.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.status IS 'User status: active, pending, or rejected';


--
-- Name: COLUMN profiles.is_org_verified; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.is_org_verified IS 'Whether the organization is verified by admin (deprecated - use organizations.is_verified)';


--
-- Name: COLUMN profiles.avatar_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user profile picture stored in Supabase Storage';


--
-- Name: COLUMN profiles.allow_messages_from_anyone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.allow_messages_from_anyone IS 'If true, anyone can send messages to this user';


--
-- Name: COLUMN profiles.allow_messages_from_connections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.allow_messages_from_connections IS 'If true, mutual connections can send messages';


--
-- Name: test_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid,
    user_id uuid,
    started_at timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone,
    score integer,
    max_score integer,
    passed boolean,
    time_taken_minutes integer,
    violations_count integer DEFAULT 0,
    status text DEFAULT 'in_progress'::text,
    admin_override_score integer,
    admin_override_reason text,
    review_mode_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT test_attempts_status_check CHECK ((status = ANY (ARRAY['in_progress'::text, 'submitted'::text, 'timeout'::text, 'violation'::text, 'disqualified'::text])))
);


--
-- Name: tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    duration_minutes integer NOT NULL,
    registration_start timestamp with time zone,
    registration_end timestamp with time zone,
    test_start timestamp with time zone,
    test_end timestamp with time zone,
    is_public boolean DEFAULT true,
    enable_leaderboard boolean DEFAULT false,
    certificate_template_id uuid,
    passing_score integer DEFAULT 70,
    max_attempts integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title character varying(255),
    event_start timestamp with time zone,
    event_end timestamp with time zone,
    certificate_start timestamp with time zone,
    certificate_end timestamp with time zone,
    is_paid boolean DEFAULT false,
    price integer DEFAULT 0,
    currency text DEFAULT 'INR'::text,
    category text
);


--
-- Name: COLUMN tests.event_start; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tests.event_start IS 'When the event goes live';


--
-- Name: COLUMN tests.event_end; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tests.event_end IS 'When the event ends';


--
-- Name: COLUMN tests.certificate_start; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tests.certificate_start IS 'Certificate distribution begins';


--
-- Name: COLUMN tests.certificate_end; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tests.certificate_end IS 'Certificate distribution ends';


--
-- Name: COLUMN tests.is_paid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tests.is_paid IS 'Whether test requires payment';


--
-- Name: COLUMN tests.price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tests.price IS 'Price in paise (₹1 = 100 paise)';


--
-- Name: COLUMN tests.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tests.currency IS 'Currency (default: INR)';


--
-- Name: certificate_eligible_participants; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.certificate_eligible_participants AS
 SELECT 'test'::text AS event_type,
    (ta.id)::text AS event_id,
    ta.user_id,
    p.first_name,
    p.last_name,
    p.username,
    p.codeunia_id,
    COALESCE(t.title, (t.name)::character varying) AS event_name,
    ta.score,
    ta.created_at AS completion_date,
    t.passing_score AS required_score
   FROM ((public.test_attempts ta
     JOIN public.profiles p ON ((ta.user_id = p.id)))
     JOIN public.tests t ON ((ta.test_id = t.id)))
  WHERE ((ta.score IS NOT NULL) AND (ta.passed = true) AND (ta.status = 'completed'::text))
UNION ALL
 SELECT 'hackathon'::text AS event_type,
    (h.id)::text AS event_id,
    NULL::uuid AS user_id,
    NULL::character varying AS first_name,
    NULL::character varying AS last_name,
    NULL::character varying AS username,
    NULL::character varying AS codeunia_id,
    h.title AS event_name,
    NULL::numeric AS score,
    h.created_at AS completion_date,
    70 AS required_score
   FROM public.hackathons h
  WHERE ((h.status = 'completed'::text) AND (h.registered > 0))
UNION ALL
 SELECT 'event'::text AS event_type,
    (e.id)::text AS event_id,
    NULL::uuid AS user_id,
    NULL::character varying AS first_name,
    NULL::character varying AS last_name,
    NULL::character varying AS username,
    NULL::character varying AS codeunia_id,
    e.title AS event_name,
    NULL::numeric AS score,
    e.created_at AS completion_date,
    70 AS required_score
   FROM public.events e
  WHERE ((e.status = 'completed'::text) AND (e.registered > 0));


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cert_id text NOT NULL,
    user_id uuid,
    assessment_id uuid,
    attempt_id uuid,
    template_id uuid,
    certificate_url text,
    qr_code_url text,
    issued_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_valid boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    test_id uuid,
    sent_via_email boolean DEFAULT false,
    sent_via_whatsapp boolean DEFAULT false,
    event_type character varying(50),
    event_title text,
    score integer,
    status text DEFAULT 'active'::text
);


--
-- Name: certificate_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.certificate_stats AS
 SELECT count(*) AS total_certificates,
    count(*) FILTER (WHERE (is_valid = true)) AS valid_certificates,
    count(*) FILTER (WHERE (is_valid = false)) AS invalid_certificates,
    count(*) FILTER (WHERE (expires_at < now())) AS expired_certificates,
    count(*) FILTER (WHERE (sent_via_email = true)) AS emailed_certificates,
    count(*) FILTER (WHERE (sent_via_whatsapp = true)) AS whatsapp_certificates,
    avg(EXTRACT(epoch FROM (issued_at - created_at))) AS avg_generation_time_seconds
   FROM public.certificates;


--
-- Name: certificate_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificate_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    template_url text NOT NULL,
    placeholders jsonb,
    created_by uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: collaboration_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collaboration_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_name text NOT NULL,
    website text,
    contact_person text NOT NULL,
    email text NOT NULL,
    collaboration_reason text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slug text NOT NULL,
    name text NOT NULL,
    legal_name text,
    email text NOT NULL,
    phone text,
    website text NOT NULL,
    industry text NOT NULL,
    company_size text,
    description text NOT NULL,
    address_street text,
    address_city text,
    address_state text,
    address_country text,
    address_zip text,
    linkedin_url text,
    twitter_url text,
    facebook_url text,
    instagram_url text,
    logo_url text,
    banner_url text,
    verification_status text DEFAULT 'pending'::text,
    verification_documents text[],
    verification_notes text,
    verified_at timestamp with time zone,
    verified_by uuid,
    subscription_tier text DEFAULT 'free'::text,
    subscription_expires_at timestamp with time zone,
    status text DEFAULT 'active'::text,
    total_events integer DEFAULT 0,
    total_hackathons integer DEFAULT 0,
    total_registrations integer DEFAULT 0,
    owner_id uuid,
    email_new_registration boolean DEFAULT true,
    email_event_approved boolean DEFAULT true,
    email_event_rejected boolean DEFAULT true,
    email_team_member_joined boolean DEFAULT true,
    email_subscription_expiring boolean DEFAULT true,
    CONSTRAINT companies_company_size_check CHECK ((company_size = ANY (ARRAY['startup'::text, 'small'::text, 'medium'::text, 'large'::text, 'enterprise'::text]))),
    CONSTRAINT companies_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'deleted'::text]))),
    CONSTRAINT companies_subscription_tier_check CHECK ((subscription_tier = ANY (ARRAY['free'::text, 'basic'::text, 'premium'::text, 'enterprise'::text]))),
    CONSTRAINT companies_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])))
);


--
-- Name: TABLE companies; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.companies IS 'Companies table created by migration 20241111000000';


--
-- Name: COLUMN companies.email_new_registration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.email_new_registration IS 'Send email when someone registers for company events';


--
-- Name: COLUMN companies.email_event_approved; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.email_event_approved IS 'Send email when company events are approved';


--
-- Name: COLUMN companies.email_event_rejected; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.email_event_rejected IS 'Send email when company events are rejected';


--
-- Name: COLUMN companies.email_team_member_joined; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.email_team_member_joined IS 'Send email when new team members join';


--
-- Name: COLUMN companies.email_subscription_expiring; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.email_subscription_expiring IS 'Send email when subscription is about to expire';


--
-- Name: company_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    company_id uuid NOT NULL,
    date date NOT NULL,
    event_views integer DEFAULT 0,
    event_registrations integer DEFAULT 0,
    profile_views integer DEFAULT 0,
    events_created integer DEFAULT 0,
    events_published integer DEFAULT 0,
    hackathons_created integer DEFAULT 0,
    hackathons_published integer DEFAULT 0,
    total_views integer DEFAULT 0,
    total_clicks integer DEFAULT 0,
    total_registrations integer DEFAULT 0,
    total_participants integer DEFAULT 0,
    revenue_generated numeric(10,2) DEFAULT 0,
    event_clicks integer DEFAULT 0,
    hackathon_views integer DEFAULT 0,
    hackathon_clicks integer DEFAULT 0,
    hackathon_registrations integer DEFAULT 0
);


--
-- Name: TABLE company_analytics; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.company_analytics IS 'Company analytics table - data fixed and recalculated on 2024-11-18 (v2)';


--
-- Name: COLUMN company_analytics.event_views; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.company_analytics.event_views IS 'Number of views for events';


--
-- Name: COLUMN company_analytics.event_registrations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.company_analytics.event_registrations IS 'Number of registrations for events';


--
-- Name: COLUMN company_analytics.event_clicks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.company_analytics.event_clicks IS 'Number of clicks on events';


--
-- Name: COLUMN company_analytics.hackathon_views; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.company_analytics.hackathon_views IS 'Number of views for hackathons';


--
-- Name: COLUMN company_analytics.hackathon_clicks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.company_analytics.hackathon_clicks IS 'Number of clicks on hackathons';


--
-- Name: COLUMN company_analytics.hackathon_registrations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.company_analytics.hackathon_registrations IS 'Number of registrations for hackathons';


--
-- Name: company_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    invited_by uuid,
    invited_at timestamp with time zone DEFAULT now(),
    joined_at timestamp with time zone,
    status text DEFAULT 'active'::text,
    CONSTRAINT company_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'viewer'::text]))),
    CONSTRAINT company_members_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text])))
);


--
-- Name: TABLE company_members; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.company_members IS 'Company members table created by migration 20241111000000';


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    category text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_participants (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now(),
    last_read_at timestamp with time zone DEFAULT now(),
    is_admin boolean DEFAULT false
);


--
-- Name: TABLE conversation_participants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conversation_participants IS 'Links users to conversations';


--
-- Name: COLUMN conversation_participants.last_read_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.conversation_participants.last_read_at IS 'Last time user read messages in this conversation';


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_message_at timestamp with time zone DEFAULT now(),
    last_message_content text,
    is_group boolean DEFAULT false,
    group_name text,
    group_avatar_url text
);


--
-- Name: TABLE conversations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conversations IS 'Stores conversation metadata';


--
-- Name: COLUMN conversations.last_message_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.conversations.last_message_at IS 'Timestamp of the last message for sorting';


--
-- Name: core_team_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.core_team_applications (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    location character varying(255) NOT NULL,
    occupation character varying(255) NOT NULL,
    company character varying(255),
    experience character varying(50) NOT NULL,
    skills text NOT NULL,
    portfolio text,
    preferred_role character varying(100) NOT NULL,
    availability text NOT NULL,
    commitment character varying(50) NOT NULL,
    motivation text NOT NULL,
    vision text NOT NULL,
    previous_experience text,
    social_media text,
    references_info text,
    additional_info text,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    CONSTRAINT core_team_applications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'reviewed'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: core_team_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.core_team_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: core_team_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.core_team_applications_id_seq OWNED BY public.core_team_applications.id;


--
-- Name: event_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_audit_log (
    id bigint NOT NULL,
    event_id bigint,
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    event_title character varying(255),
    event_date date,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: event_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_audit_log_id_seq OWNED BY public.event_audit_log.id;


--
-- Name: event_moderation_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_moderation_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    event_id uuid NOT NULL,
    event_type text NOT NULL,
    company_id uuid NOT NULL,
    action text NOT NULL,
    moderator_id uuid,
    notes text,
    rejection_reason text,
    feedback text,
    previous_status text,
    new_status text,
    CONSTRAINT event_moderation_log_action_check CHECK ((action = ANY (ARRAY['submitted'::text, 'approved'::text, 'rejected'::text, 'changes_requested'::text]))),
    CONSTRAINT event_moderation_log_event_type_check CHECK ((event_type = ANY (ARRAY['event'::text, 'hackathon'::text])))
);


--
-- Name: TABLE event_moderation_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.event_moderation_log IS 'Event moderation log table created by migration 20241111000000';


--
-- Name: event_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_registrations (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    event_id bigint NOT NULL,
    registration_date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'registered'::text,
    payment_status text DEFAULT 'pending'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_registrations_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text]))),
    CONSTRAINT event_registrations_status_check CHECK ((status = ANY (ARRAY['registered'::text, 'attended'::text, 'cancelled'::text, 'no_show'::text])))
);


--
-- Name: event_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_registrations_id_seq OWNED BY public.event_registrations.id;


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: hackathon_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hackathon_registrations (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    hackathon_id bigint NOT NULL,
    registration_date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'registered'::text,
    payment_status text DEFAULT 'not_applicable'::text,
    payment_amount numeric(10,2),
    payment_currency text DEFAULT 'INR'::text,
    payment_id text,
    team_name text,
    team_members jsonb DEFAULT '[]'::jsonb,
    project_title text,
    project_description text,
    github_repo text,
    demo_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hackathon_registrations_payment_status_check CHECK ((payment_status = ANY (ARRAY['not_applicable'::text, 'pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text]))),
    CONSTRAINT hackathon_registrations_status_check CHECK ((status = ANY (ARRAY['registered'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'completed'::text, 'attended'::text, 'no_show'::text, 'disqualified'::text])))
);


--
-- Name: hackathon_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hackathon_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hackathon_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hackathon_registrations_id_seq OWNED BY public.hackathon_registrations.id;


--
-- Name: hackathons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hackathons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hackathons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hackathons_id_seq OWNED BY public.hackathons.id;


--
-- Name: incomplete_profiles; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.incomplete_profiles AS
 SELECT id,
    first_name,
    last_name,
    username,
    codeunia_id,
    username_set,
    profile_complete,
    created_at
   FROM public.profiles
  WHERE ((profile_complete = false) OR (username_set = false));


--
-- Name: interns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interns (
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    domain public.internship_domain DEFAULT 'Web Development'::public.internship_domain NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date DEFAULT CURRENT_DATE NOT NULL,
    certificate_url text,
    certificate_issued_at timestamp with time zone,
    verification_code uuid,
    project_name text,
    project_url text
);


--
-- Name: internship_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internship_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    internship_id text NOT NULL,
    domain public.internship_domain NOT NULL,
    level text NOT NULL,
    cover_note text,
    status text DEFAULT 'submitted'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    remarks text,
    repo_url text,
    duration_weeks integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    order_id text,
    payment_id text,
    payment_signature text,
    amount_paid integer,
    currency text DEFAULT 'INR'::text,
    payment_status text DEFAULT 'pending'::text,
    is_paid boolean DEFAULT false,
    paid_at timestamp with time zone,
    original_amount integer,
    discount_applied integer DEFAULT 0,
    CONSTRAINT check_payment_logic CHECK ((((amount_paid = 0) AND (is_paid = false)) OR ((amount_paid > 0) AND (is_paid = true)))),
    CONSTRAINT internship_applications_level_check CHECK ((level = ANY (ARRAY['Beginner'::text, 'Intermediate'::text, 'Advanced'::text])))
);


--
-- Name: judges_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.judges_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text,
    email text NOT NULL,
    phone text NOT NULL,
    location text NOT NULL,
    occupation text NOT NULL,
    company text NOT NULL,
    experience text NOT NULL,
    expertise text NOT NULL,
    linkedin text NOT NULL,
    expertise_areas text[] NOT NULL,
    event_types text[] NOT NULL,
    motivation text NOT NULL,
    previous_judging text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: keep_alive; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.keep_alive (
    id bigint NOT NULL,
    last_ping timestamp with time zone DEFAULT now()
);


--
-- Name: keep_alive_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.keep_alive ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.keep_alive_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    rank integer DEFAULT 0 NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leaderboard_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.leaderboard_view AS
 SELECT up.rank,
    up.user_id,
    COALESCE(p.username, (concat(p.first_name, ' ', p.last_name))::character varying) AS display_name,
    up.total_points,
    up.last_updated,
        CASE
            WHEN (up.total_points >= 2500) THEN 'diamond'::text
            WHEN (up.total_points >= 1000) THEN 'platinum'::text
            WHEN (up.total_points >= 500) THEN 'gold'::text
            WHEN (up.total_points >= 100) THEN 'silver'::text
            ELSE 'bronze'::text
        END AS badge
   FROM (public.user_points up
     LEFT JOIN public.profiles p ON ((up.user_id = p.id)))
  WHERE ((p.is_public = true) OR (p.id = auth.uid()))
  ORDER BY up.total_points DESC, up.last_updated;


--
-- Name: master_registration_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_registration_details (
    id bigint NOT NULL,
    registration_id bigint NOT NULL,
    detail_key text NOT NULL,
    detail_value text,
    detail_json jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: master_registration_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.master_registration_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: master_registration_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.master_registration_details_id_seq OWNED BY public.master_registration_details.id;


--
-- Name: master_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_registrations (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    activity_type text NOT NULL,
    activity_id text NOT NULL,
    registration_date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'registered'::text,
    payment_status text DEFAULT 'not_applicable'::text,
    payment_amount numeric(10,2),
    payment_currency text DEFAULT 'INR'::text,
    payment_id text,
    full_name text,
    email text,
    phone text,
    institution text,
    department text,
    year_of_study text,
    experience_level text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT master_registrations_activity_type_check CHECK ((activity_type = ANY (ARRAY['hackathon'::text, 'event'::text, 'internship'::text, 'test'::text, 'round'::text, 'volunteer'::text, 'sponsorship'::text, 'mentor'::text, 'judge'::text, 'collaboration'::text, 'other'::text]))),
    CONSTRAINT master_registrations_payment_status_check CHECK ((payment_status = ANY (ARRAY['not_applicable'::text, 'pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text, 'completed'::text]))),
    CONSTRAINT master_registrations_status_check CHECK ((status = ANY (ARRAY['registered'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'completed'::text, 'attended'::text, 'no_show'::text, 'disqualified'::text, 'withdrawn'::text])))
);


--
-- Name: COLUMN master_registrations.activity_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.master_registrations.activity_id IS 'Activity ID as text - can be integer (for events/hackathons) or UUID (for other activities)';


--
-- Name: master_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.master_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: master_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.master_registrations_id_seq OWNED BY public.master_registrations.id;


--
-- Name: mentor_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mentor_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text,
    email text NOT NULL,
    phone text NOT NULL,
    location text NOT NULL,
    occupation text NOT NULL,
    company text NOT NULL,
    experience text NOT NULL,
    expertise text NOT NULL,
    linkedin text NOT NULL,
    expertise_areas text[] NOT NULL,
    mentoring_types text[] NOT NULL,
    availability text NOT NULL,
    commitment text NOT NULL,
    motivation text NOT NULL,
    previous_mentoring text,
    teaching_style text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: mentorship; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mentorship (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    description text,
    duration text,
    price numeric(10,2) DEFAULT 0,
    platform text DEFAULT 'buildunia'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    is_edited boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    reply_to_id uuid,
    attachments jsonb
);


--
-- Name: TABLE messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.messages IS 'Stores all messages';


--
-- Name: newsletter_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscriptions (
    id bigint NOT NULL,
    email text NOT NULL,
    status text DEFAULT 'subscribed'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    unsubscribe_token text DEFAULT (gen_random_uuid())::text
);


--
-- Name: newsletter_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscriptions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.newsletter_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL,
    company_id uuid,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    action_url text,
    action_label text,
    event_id bigint,
    hackathon_id bigint,
    read boolean DEFAULT false,
    read_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['company_verified'::text, 'company_rejected'::text, 'event_approved'::text, 'event_rejected'::text, 'event_changes_requested'::text, 'hackathon_approved'::text, 'hackathon_rejected'::text, 'hackathon_changes_requested'::text, 'new_event_registration'::text, 'new_hackathon_registration'::text, 'team_member_invited'::text, 'team_member_joined'::text, 'team_member_removed'::text, 'subscription_expiring'::text, 'subscription_expired'::text])))
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notifications IS 'Notifications table created by migration 20241111000001';


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid,
    product_id uuid,
    quantity integer DEFAULT 1,
    price numeric(10,2) NOT NULL,
    option_selected text DEFAULT 'full'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    total numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text,
    platform text NOT NULL,
    shipping_address jsonb,
    digipin character varying(10),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    razorpay_order_id text
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    domain text NOT NULL,
    description text,
    phone text,
    email text,
    website text,
    address_line1 text,
    address_line2 text,
    city text,
    state text,
    country text,
    postal_code text,
    industry text,
    size text,
    founded_year integer,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    verification_notes text,
    created_by uuid,
    verified_by uuid,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organizations IS 'Organizations table for complete organization management';


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    razorpay_payment_id character varying(255) NOT NULL,
    razorpay_order_id character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    amount numeric(10,2),
    webhook_processed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes jsonb DEFAULT '{}'::jsonb
);


--
-- Name: TABLE payments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payments IS 'Tracks all payments processed via webhooks';


--
-- Name: COLUMN payments.razorpay_payment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.razorpay_payment_id IS 'Razorpay payment ID';


--
-- Name: COLUMN payments.razorpay_order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.razorpay_order_id IS 'Razorpay order ID';


--
-- Name: COLUMN payments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.status IS 'Payment status: success, failed, pending';


--
-- Name: COLUMN payments.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.amount IS 'Amount in rupees';


--
-- Name: COLUMN payments.webhook_processed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.webhook_processed_at IS 'When webhook was processed';


--
-- Name: pending_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_id text NOT NULL,
    plan_id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '00:05:00'::interval),
    status text DEFAULT 'pending'::text NOT NULL,
    contact_attempts integer DEFAULT 0,
    last_contact_at timestamp with time zone,
    notes text
);


--
-- Name: TABLE pending_payments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.pending_payments IS 'Codeunia: Tracks pending payments that need follow-up';


--
-- Name: COLUMN pending_payments.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_payments.order_id IS 'Codeunia: Razorpay order ID';


--
-- Name: COLUMN pending_payments.plan_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_payments.plan_id IS 'Codeunia: Premium plan ID (monthly, biannual, yearly)';


--
-- Name: COLUMN pending_payments.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_payments.amount IS 'Codeunia: Amount in smallest currency unit (paise for INR)';


--
-- Name: COLUMN pending_payments.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_payments.expires_at IS 'Codeunia: When the payment expires (5 minutes from creation)';


--
-- Name: COLUMN pending_payments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_payments.status IS 'Codeunia: Status: pending, completed, expired, contacted';


--
-- Name: COLUMN pending_payments.contact_attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_payments.contact_attempts IS 'Codeunia: Number of times we tried to contact the user';


--
-- Name: COLUMN pending_payments.last_contact_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_payments.last_contact_at IS 'Codeunia: Last time we contacted the user';


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    image_url text,
    platform text DEFAULT 'buildunia'::text,
    category text,
    difficulty text,
    duration text,
    price numeric(10,2) DEFAULT 0,
    prices jsonb DEFAULT '{"code": 0, "full": 0, "hardware": 0, "mentorship": 0, "code_mentorship": 0, "hardware_mentorship": 0}'::jsonb,
    features jsonb DEFAULT '[]'::jsonb,
    requirements jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    image_path text
);


--
-- Name: profile_statistics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.profile_statistics AS
 SELECT count(*) AS total_profiles,
    count(*) FILTER (WHERE (profile_complete = true)) AS complete_profiles,
    count(*) FILTER (WHERE (profile_complete = false)) AS incomplete_profiles,
    count(*) FILTER (WHERE (username_set = true)) AS usernames_set,
    count(*) FILTER (WHERE (username_set = false)) AS usernames_not_set,
    count(*) FILTER (WHERE (codeunia_id IS NOT NULL)) AS codeunia_ids_generated
   FROM public.profiles;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    image_url text,
    image_path text,
    difficulty text,
    category text,
    components text[],
    skills text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT projects_difficulty_check CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);


--
-- Name: reserved_usernames; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reserved_usernames (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    reason text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    expires_at timestamp with time zone,
    CONSTRAINT reserved_usernames_category_check CHECK (((category)::text = ANY ((ARRAY['system'::character varying, 'admin'::character varying, 'api'::character varying, 'events'::character varying, 'learning'::character varying, 'professional'::character varying, 'content'::character varying, 'legal'::character varying, 'ecommerce'::character varying, 'discovery'::character varying, 'premium'::character varying, 'community'::character varying, 'brand'::character varying, 'common_words'::character varying, 'single_letters'::character varying, 'abbreviations'::character varying, 'error_pages'::character varying])::text[])))
);


--
-- Name: resumes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resumes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title text DEFAULT 'Untitled Resume'::text NOT NULL,
    template_id text DEFAULT 'modern'::text NOT NULL,
    sections jsonb DEFAULT '[]'::jsonb NOT NULL,
    styling jsonb DEFAULT '{"color_text": "#1f2937", "margin_top": 0.75, "font_family": "Inter", "line_height": 1.5, "margin_left": 0.75, "color_accent": "#6366f1", "margin_right": 0.75, "color_primary": "#8b5cf6", "margin_bottom": 0.75, "font_size_body": 11, "section_spacing": 1.25, "font_size_heading": 16}'::jsonb NOT NULL,
    metadata jsonb DEFAULT '{"page_count": 1, "word_count": 0, "export_count": 0, "completeness_score": 0}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE resumes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.resumes IS 'Stores user resume data with sections, styling, and metadata';


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: round_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.round_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid NOT NULL,
    round_id uuid NOT NULL,
    user_id uuid NOT NULL,
    registration_date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'registered'::text NOT NULL,
    score integer,
    max_score integer,
    time_taken_minutes integer,
    submission_data jsonb,
    feedback text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT round_registrations_status_check CHECK ((status = ANY (ARRAY['registered'::text, 'in_progress'::text, 'completed'::text, 'failed'::text, 'eliminated'::text])))
);


--
-- Name: TABLE round_registrations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.round_registrations IS 'Codeunia: Participant registrations for individual rounds';


--
-- Name: COLUMN round_registrations.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.round_registrations.status IS 'Status: registered, in_progress, completed, failed, eliminated';


--
-- Name: COLUMN round_registrations.submission_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.round_registrations.submission_data IS 'JSON data for round submissions';


--
-- Name: sponsorship_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsorship_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name text NOT NULL,
    industry text NOT NULL,
    company_size text NOT NULL,
    contact_name text NOT NULL,
    designation text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    website text,
    preferred_events text[] NOT NULL,
    marketing_goals text NOT NULL,
    target_audience text NOT NULL,
    specific_requirements text,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    user_id uuid
);


--
-- Name: support_ticket_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_ticket_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    admin_id uuid,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    CONSTRAINT check_reply_author CHECK ((((admin_id IS NOT NULL) AND (user_id IS NULL)) OR ((admin_id IS NULL) AND (user_id IS NOT NULL))))
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text]))),
    CONSTRAINT support_tickets_type_check CHECK ((type = ANY (ARRAY['contact'::text, 'bug'::text])))
);


--
-- Name: test_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid,
    question_id uuid,
    selected_options text[],
    is_correct boolean,
    points_earned integer,
    answered_at timestamp with time zone DEFAULT now(),
    test_id uuid
);


--
-- Name: test_leaderboard; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_leaderboard (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid,
    user_id uuid,
    score integer NOT NULL,
    time_taken_minutes integer,
    rank integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: test_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_options text[] NOT NULL,
    explanation text,
    points integer DEFAULT 1,
    order_index integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: test_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid,
    user_id uuid,
    registration_date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'registered'::text,
    attempt_count integer DEFAULT 0,
    best_score integer,
    best_attempt_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    registration_data jsonb,
    full_name text,
    email text,
    phone text,
    institution text,
    department text,
    year_of_study text,
    experience_level text,
    CONSTRAINT test_registrations_status_check CHECK ((status = ANY (ARRAY['registered'::text, 'attempted'::text, 'completed'::text, 'disqualified'::text])))
);


--
-- Name: COLUMN test_registrations.registration_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.registration_data IS 'JSON object containing additional user registration information';


--
-- Name: COLUMN test_registrations.full_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.full_name IS 'User full name from registration form';


--
-- Name: COLUMN test_registrations.email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.email IS 'User email from registration form';


--
-- Name: COLUMN test_registrations.phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.phone IS 'User phone number from registration form';


--
-- Name: COLUMN test_registrations.institution; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.institution IS 'User institution/company from registration form';


--
-- Name: COLUMN test_registrations.department; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.department IS 'User department from registration form';


--
-- Name: COLUMN test_registrations.year_of_study; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.year_of_study IS 'User year of study from registration form';


--
-- Name: COLUMN test_registrations.experience_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_registrations.experience_level IS 'User experience level from registration form';


--
-- Name: test_rounds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_rounds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid NOT NULL,
    round_number integer NOT NULL,
    name text NOT NULL,
    description text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    duration_minutes integer,
    max_attempts integer DEFAULT 1,
    passing_score integer DEFAULT 70,
    requirements text[] DEFAULT '{}'::text[],
    assessment_criteria text[] DEFAULT '{}'::text[],
    round_type text DEFAULT 'submission'::text NOT NULL,
    is_elimination_round boolean DEFAULT false,
    weightage integer DEFAULT 100,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT test_rounds_round_type_check CHECK ((round_type = ANY (ARRAY['submission'::text, 'evaluation'::text, 'live'::text, 'interview'::text, 'presentation'::text, 'coding'::text, 'custom'::text])))
);


--
-- Name: TABLE test_rounds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.test_rounds IS 'Codeunia: Dynamic rounds for tests/hackathons';


--
-- Name: COLUMN test_rounds.round_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_rounds.round_number IS 'Round number (1, 2, 3, 4, 5...)';


--
-- Name: COLUMN test_rounds.requirements; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_rounds.requirements IS 'Array of requirements/deliverables for this round';


--
-- Name: COLUMN test_rounds.assessment_criteria; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_rounds.assessment_criteria IS 'Array of assessment criteria for this round';


--
-- Name: COLUMN test_rounds.round_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_rounds.round_type IS 'Type of round: submission, evaluation, live, interview, presentation, coding, custom';


--
-- Name: COLUMN test_rounds.is_elimination_round; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_rounds.is_elimination_round IS 'Whether this round eliminates participants';


--
-- Name: COLUMN test_rounds.weightage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_rounds.weightage IS 'Weightage in final scoring (1-100)';


--
-- Name: user_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    activity_type text NOT NULL,
    activity_data jsonb,
    activity_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_activity_activity_type_check CHECK ((activity_type = ANY (ARRAY['test_registration'::text, 'test_attempt'::text, 'test_completion'::text, 'hackathon_registration'::text, 'hackathon_participation'::text, 'daily_login'::text, 'profile_update'::text, 'certificate_earned'::text, 'mcq_practice'::text])))
);


--
-- Name: user_activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    activity_type text NOT NULL,
    related_id uuid,
    points_awarded integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT user_activity_log_activity_type_check CHECK ((activity_type = ANY (ARRAY['daily_login'::text, 'test_registration'::text, 'test_completion'::text, 'hackathon_registration'::text, 'hackathon_participation'::text, 'blog_read'::text, 'blog_like'::text, 'blog_share'::text, 'profile_update'::text, 'certificate_earned'::text, 'top_3_rank'::text, 'user_referral'::text])))
);


--
-- Name: COLUMN user_activity_log.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_activity_log.metadata IS 'Additional activity metadata in JSON format';


--
-- Name: user_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_connections (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_connections_check CHECK ((follower_id <> following_id))
);


--
-- Name: TABLE user_connections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_connections IS 'Stores follower/following relationships';


--
-- Name: user_presence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_presence (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    is_online boolean DEFAULT false NOT NULL,
    last_seen timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id uuid,
    role_id integer
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: volunteer_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    location text NOT NULL,
    occupation text NOT NULL,
    company text NOT NULL,
    experience text NOT NULL,
    skills text NOT NULL,
    interests text[] NOT NULL,
    motivation text NOT NULL,
    previous_volunteer text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: ai_training_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_training_data ALTER COLUMN id SET DEFAULT nextval('public.ai_training_data_id_seq'::regclass);


--
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- Name: core_team_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_team_applications ALTER COLUMN id SET DEFAULT nextval('public.core_team_applications_id_seq'::regclass);


--
-- Name: event_audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_audit_log ALTER COLUMN id SET DEFAULT nextval('public.event_audit_log_id_seq'::regclass);


--
-- Name: event_registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations ALTER COLUMN id SET DEFAULT nextval('public.event_registrations_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: hackathon_registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathon_registrations ALTER COLUMN id SET DEFAULT nextval('public.hackathon_registrations_id_seq'::regclass);


--
-- Name: hackathons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathons ALTER COLUMN id SET DEFAULT nextval('public.hackathons_id_seq'::regclass);


--
-- Name: master_registration_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registration_details ALTER COLUMN id SET DEFAULT nextval('public.master_registration_details_id_seq'::regclass);


--
-- Name: master_registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registrations ALTER COLUMN id SET DEFAULT nextval('public.master_registrations_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: admin_audit_logs admin_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_training_data ai_training_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_training_data
    ADD CONSTRAINT ai_training_data_pkey PRIMARY KEY (id);


--
-- Name: blog_likes blog_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_pkey PRIMARY KEY (id);


--
-- Name: blog_likes blog_likes_user_id_blog_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_user_id_blog_slug_key UNIQUE (user_id, blog_slug);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_slug_key UNIQUE (slug);


--
-- Name: certificate_templates certificate_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_cert_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_cert_id_key UNIQUE (cert_id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: collaboration_applications collaboration_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaboration_applications
    ADD CONSTRAINT collaboration_applications_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_slug_key UNIQUE (slug);


--
-- Name: company_analytics company_analytics_company_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_analytics
    ADD CONSTRAINT company_analytics_company_id_date_key UNIQUE (company_id, date);


--
-- Name: company_analytics company_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_analytics
    ADD CONSTRAINT company_analytics_pkey PRIMARY KEY (id);


--
-- Name: company_members company_members_company_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT company_members_company_id_user_id_key UNIQUE (company_id, user_id);


--
-- Name: company_members company_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT company_members_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_conversation_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_user_id_key UNIQUE (conversation_id, user_id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: core_team_applications core_team_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_team_applications
    ADD CONSTRAINT core_team_applications_pkey PRIMARY KEY (id);


--
-- Name: event_audit_log event_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_audit_log
    ADD CONSTRAINT event_audit_log_pkey PRIMARY KEY (id);


--
-- Name: event_moderation_log event_moderation_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_moderation_log
    ADD CONSTRAINT event_moderation_log_pkey PRIMARY KEY (id);


--
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);


--
-- Name: event_registrations event_registrations_user_event_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_event_unique UNIQUE (user_id, event_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- Name: hackathon_registrations hackathon_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathon_registrations
    ADD CONSTRAINT hackathon_registrations_pkey PRIMARY KEY (id);


--
-- Name: hackathon_registrations hackathon_registrations_user_id_hackathon_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathon_registrations
    ADD CONSTRAINT hackathon_registrations_user_id_hackathon_id_key UNIQUE (user_id, hackathon_id);


--
-- Name: hackathons hackathons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathons
    ADD CONSTRAINT hackathons_pkey PRIMARY KEY (id);


--
-- Name: hackathons hackathons_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathons
    ADD CONSTRAINT hackathons_slug_key UNIQUE (slug);


--
-- Name: interns interns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT interns_pkey PRIMARY KEY (email, domain, start_date);


--
-- Name: interns interns_verification_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT interns_verification_code_key UNIQUE (verification_code);


--
-- Name: internship_applications internship_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internship_applications
    ADD CONSTRAINT internship_applications_pkey PRIMARY KEY (id);


--
-- Name: judges_applications judges_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.judges_applications
    ADD CONSTRAINT judges_applications_pkey PRIMARY KEY (id);


--
-- Name: keep_alive keep_alive_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.keep_alive
    ADD CONSTRAINT keep_alive_pkey PRIMARY KEY (id);


--
-- Name: master_registration_details master_registration_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registration_details
    ADD CONSTRAINT master_registration_details_pkey PRIMARY KEY (id);


--
-- Name: master_registration_details master_registration_details_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registration_details
    ADD CONSTRAINT master_registration_details_unique UNIQUE (registration_id, detail_key);


--
-- Name: master_registrations master_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registrations
    ADD CONSTRAINT master_registrations_pkey PRIMARY KEY (id);


--
-- Name: master_registrations master_registrations_user_activity_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registrations
    ADD CONSTRAINT master_registrations_user_activity_unique UNIQUE (user_id, activity_type, activity_id);


--
-- Name: mentor_applications mentor_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentor_applications
    ADD CONSTRAINT mentor_applications_pkey PRIMARY KEY (id);


--
-- Name: mentorship mentorship_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentorship
    ADD CONSTRAINT mentorship_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscriptions newsletter_subscriptions_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscriptions
    ADD CONSTRAINT newsletter_subscriptions_email_key UNIQUE (email);


--
-- Name: newsletter_subscriptions newsletter_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscriptions
    ADD CONSTRAINT newsletter_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscriptions newsletter_subscriptions_unsubscribe_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscriptions
    ADD CONSTRAINT newsletter_subscriptions_unsubscribe_token_key UNIQUE (unsubscribe_token);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_domain_key UNIQUE (domain);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_razorpay_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_razorpay_payment_id_key UNIQUE (razorpay_payment_id);


--
-- Name: pending_payments pending_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_payments
    ADD CONSTRAINT pending_payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_codeunia_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_codeunia_id_key UNIQUE (codeunia_id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: profiles profiles_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_unique UNIQUE (username);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: reserved_usernames reserved_usernames_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserved_usernames
    ADD CONSTRAINT reserved_usernames_pkey PRIMARY KEY (id);


--
-- Name: reserved_usernames reserved_usernames_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserved_usernames
    ADD CONSTRAINT reserved_usernames_username_key UNIQUE (username);


--
-- Name: resumes resumes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: round_registrations round_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_registrations
    ADD CONSTRAINT round_registrations_pkey PRIMARY KEY (id);


--
-- Name: round_registrations round_registrations_user_id_round_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_registrations
    ADD CONSTRAINT round_registrations_user_id_round_id_key UNIQUE (user_id, round_id);


--
-- Name: sponsorship_applications sponsorship_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorship_applications
    ADD CONSTRAINT sponsorship_applications_pkey PRIMARY KEY (id);


--
-- Name: support_ticket_replies support_ticket_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_replies
    ADD CONSTRAINT support_ticket_replies_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: test_answers test_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_pkey PRIMARY KEY (id);


--
-- Name: test_attempts test_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_pkey PRIMARY KEY (id);


--
-- Name: test_leaderboard test_leaderboard_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_leaderboard
    ADD CONSTRAINT test_leaderboard_pkey PRIMARY KEY (id);


--
-- Name: test_leaderboard test_leaderboard_test_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_leaderboard
    ADD CONSTRAINT test_leaderboard_test_id_user_id_key UNIQUE (test_id, user_id);


--
-- Name: test_questions test_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_questions
    ADD CONSTRAINT test_questions_pkey PRIMARY KEY (id);


--
-- Name: test_registrations test_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_registrations
    ADD CONSTRAINT test_registrations_pkey PRIMARY KEY (id);


--
-- Name: test_registrations test_registrations_test_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_registrations
    ADD CONSTRAINT test_registrations_test_id_user_id_key UNIQUE (test_id, user_id);


--
-- Name: test_rounds test_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_rounds
    ADD CONSTRAINT test_rounds_pkey PRIMARY KEY (id);


--
-- Name: test_rounds test_rounds_test_id_round_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_rounds
    ADD CONSTRAINT test_rounds_test_id_round_number_key UNIQUE (test_id, round_number);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: user_activity_log user_activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_log
    ADD CONSTRAINT user_activity_log_pkey PRIMARY KEY (id);


--
-- Name: user_activity user_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity
    ADD CONSTRAINT user_activity_pkey PRIMARY KEY (id);


--
-- Name: user_connections user_connections_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_connections
    ADD CONSTRAINT user_connections_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: user_connections user_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_connections
    ADD CONSTRAINT user_connections_pkey PRIMARY KEY (id);


--
-- Name: user_points user_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_pkey PRIMARY KEY (id);


--
-- Name: user_points user_points_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_user_id_key UNIQUE (user_id);


--
-- Name: user_presence user_presence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_pkey PRIMARY KEY (id);


--
-- Name: user_presence user_presence_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: interns verification_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT verification_code_unique UNIQUE (verification_code);


--
-- Name: volunteer_applications volunteer_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_applications
    ADD CONSTRAINT volunteer_applications_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_submissions_status_idx ON public.contact_submissions USING btree (status);


--
-- Name: idx_admin_audit_logs_action_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_action_created ON public.admin_audit_logs USING btree (action_type, created_at);


--
-- Name: idx_admin_audit_logs_action_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_action_type ON public.admin_audit_logs USING btree (action_type);


--
-- Name: idx_admin_audit_logs_admin_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_admin_action ON public.admin_audit_logs USING btree (admin_id, action_type);


--
-- Name: idx_admin_audit_logs_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs USING btree (admin_id);


--
-- Name: idx_admin_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs USING btree (created_at);


--
-- Name: idx_admin_audit_logs_ip_address; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_ip_address ON public.admin_audit_logs USING btree (ip_address);


--
-- Name: idx_admin_audit_logs_target_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_target_created ON public.admin_audit_logs USING btree (target_resource, created_at);


--
-- Name: idx_admin_audit_logs_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_target_id ON public.admin_audit_logs USING btree (target_id);


--
-- Name: idx_admin_audit_logs_target_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_logs_target_resource ON public.admin_audit_logs USING btree (target_resource);


--
-- Name: idx_ai_training_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_training_context ON public.ai_training_data USING btree (context_type);


--
-- Name: idx_ai_training_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_training_created ON public.ai_training_data USING btree (created_at);


--
-- Name: idx_ai_training_feedback; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_training_feedback ON public.ai_training_data USING btree (user_feedback);


--
-- Name: idx_ai_training_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_training_user ON public.ai_training_data USING btree (user_id);


--
-- Name: idx_blogs_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blogs_date ON public.blogs USING btree (date);


--
-- Name: idx_blogs_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blogs_featured ON public.blogs USING btree (featured);


--
-- Name: idx_blogs_featured_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blogs_featured_date ON public.blogs USING btree (featured, date DESC);


--
-- Name: idx_blogs_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blogs_slug ON public.blogs USING btree (slug);


--
-- Name: idx_certificates_cert_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_cert_id ON public.certificates USING btree (cert_id);


--
-- Name: idx_certificates_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_expires_at ON public.certificates USING btree (expires_at);


--
-- Name: idx_certificates_is_valid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_is_valid ON public.certificates USING btree (is_valid);


--
-- Name: idx_certificates_issued_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_issued_at ON public.certificates USING btree (issued_at);


--
-- Name: idx_certificates_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_template_id ON public.certificates USING btree (template_id);


--
-- Name: idx_certificates_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_test_id ON public.certificates USING btree (test_id);


--
-- Name: idx_certificates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certificates_user_id ON public.certificates USING btree (user_id);


--
-- Name: idx_codeunia_pending_payments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codeunia_pending_payments_created_at ON public.pending_payments USING btree (created_at);


--
-- Name: idx_codeunia_pending_payments_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codeunia_pending_payments_expires_at ON public.pending_payments USING btree (expires_at);


--
-- Name: idx_codeunia_pending_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codeunia_pending_payments_status ON public.pending_payments USING btree (status);


--
-- Name: idx_codeunia_pending_payments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codeunia_pending_payments_user_id ON public.pending_payments USING btree (user_id);


--
-- Name: idx_collaboration_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collaboration_applications_user_id ON public.collaboration_applications USING btree (user_id);


--
-- Name: idx_companies_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_created_at ON public.companies USING btree (created_at DESC);


--
-- Name: idx_companies_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_owner_id ON public.companies USING btree (owner_id);


--
-- Name: idx_companies_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_slug ON public.companies USING btree (slug);


--
-- Name: idx_companies_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_status ON public.companies USING btree (status);


--
-- Name: idx_companies_subscription_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_subscription_tier ON public.companies USING btree (subscription_tier);


--
-- Name: idx_companies_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_verification_status ON public.companies USING btree (verification_status);


--
-- Name: idx_company_analytics_company_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_analytics_company_date ON public.company_analytics USING btree (company_id, date DESC);


--
-- Name: idx_company_analytics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_analytics_date ON public.company_analytics USING btree (date DESC);


--
-- Name: idx_company_analytics_event_metrics; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_analytics_event_metrics ON public.company_analytics USING btree (company_id, date DESC) WHERE ((event_views > 0) OR (event_registrations > 0));


--
-- Name: idx_company_analytics_hackathon_metrics; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_analytics_hackathon_metrics ON public.company_analytics USING btree (company_id, date DESC) WHERE ((hackathon_views > 0) OR (hackathon_registrations > 0));


--
-- Name: idx_company_members_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_members_company ON public.company_members USING btree (company_id);


--
-- Name: idx_company_members_company_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_members_company_user ON public.company_members USING btree (company_id, user_id);


--
-- Name: idx_company_members_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_members_role ON public.company_members USING btree (role);


--
-- Name: idx_company_members_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_members_status ON public.company_members USING btree (status);


--
-- Name: idx_company_members_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_members_user ON public.company_members USING btree (user_id);


--
-- Name: idx_conversation_participants_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants USING btree (conversation_id);


--
-- Name: idx_conversation_participants_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants USING btree (user_id);


--
-- Name: idx_conversations_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_updated_at ON public.conversations USING btree (updated_at DESC);


--
-- Name: idx_core_team_applications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_core_team_applications_created_at ON public.core_team_applications USING btree (created_at);


--
-- Name: idx_core_team_applications_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_core_team_applications_email ON public.core_team_applications USING btree (email);


--
-- Name: idx_core_team_applications_preferred_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_core_team_applications_preferred_role ON public.core_team_applications USING btree (preferred_role);


--
-- Name: idx_core_team_applications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_core_team_applications_status ON public.core_team_applications USING btree (status);


--
-- Name: idx_core_team_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_core_team_applications_user_id ON public.core_team_applications USING btree (user_id);


--
-- Name: idx_event_audit_log_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_audit_log_action ON public.event_audit_log USING btree (action);


--
-- Name: idx_event_audit_log_company_action_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_audit_log_company_action_date ON public.event_audit_log USING btree (company_id, action, created_at);


--
-- Name: idx_event_audit_log_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_audit_log_company_id ON public.event_audit_log USING btree (company_id);


--
-- Name: idx_event_audit_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_audit_log_created_at ON public.event_audit_log USING btree (created_at);


--
-- Name: idx_event_registrations_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_registrations_event_id ON public.event_registrations USING btree (event_id);


--
-- Name: idx_event_registrations_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_registrations_payment_status ON public.event_registrations USING btree (payment_status);


--
-- Name: idx_event_registrations_registration_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_registrations_registration_date ON public.event_registrations USING btree (registration_date);


--
-- Name: idx_event_registrations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_registrations_status ON public.event_registrations USING btree (status);


--
-- Name: idx_event_registrations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_registrations_user_id ON public.event_registrations USING btree (user_id);


--
-- Name: idx_events_approval_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_approval_status ON public.events USING btree (approval_status);


--
-- Name: idx_events_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_category ON public.events USING btree (category);


--
-- Name: idx_events_clicks; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_clicks ON public.events USING btree (clicks DESC);


--
-- Name: idx_events_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_company ON public.events USING btree (company_id);


--
-- Name: idx_events_company_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_company_status ON public.events USING btree (company_id, approval_status);


--
-- Name: idx_events_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_created_by ON public.events USING btree (created_by);


--
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_date ON public.events USING btree (date);


--
-- Name: idx_events_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_featured ON public.events USING btree (featured);


--
-- Name: idx_events_is_codeunia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_is_codeunia ON public.events USING btree (is_codeunia_event);


--
-- Name: idx_events_organizer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_organizer ON public.events USING btree (organizer);


--
-- Name: idx_events_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_slug ON public.events USING btree (slug);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- Name: idx_events_views; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_views ON public.events USING btree (views DESC);


--
-- Name: idx_hackathon_registrations_hackathon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathon_registrations_hackathon_id ON public.hackathon_registrations USING btree (hackathon_id);


--
-- Name: idx_hackathon_registrations_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathon_registrations_payment_status ON public.hackathon_registrations USING btree (payment_status);


--
-- Name: idx_hackathon_registrations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathon_registrations_status ON public.hackathon_registrations USING btree (status);


--
-- Name: idx_hackathon_registrations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathon_registrations_user_id ON public.hackathon_registrations USING btree (user_id);


--
-- Name: idx_hackathons_approval_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_approval_status ON public.hackathons USING btree (approval_status);


--
-- Name: idx_hackathons_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_category ON public.hackathons USING btree (category);


--
-- Name: idx_hackathons_clicks; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_clicks ON public.hackathons USING btree (clicks DESC);


--
-- Name: idx_hackathons_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_company ON public.hackathons USING btree (company_id);


--
-- Name: idx_hackathons_company_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_company_status ON public.hackathons USING btree (company_id, approval_status);


--
-- Name: idx_hackathons_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_created_by ON public.hackathons USING btree (created_by);


--
-- Name: idx_hackathons_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_date ON public.hackathons USING btree (date);


--
-- Name: idx_hackathons_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_featured ON public.hackathons USING btree (featured);


--
-- Name: idx_hackathons_is_codeunia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_is_codeunia ON public.hackathons USING btree (is_codeunia_event);


--
-- Name: idx_hackathons_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_location ON public.hackathons USING btree (location);


--
-- Name: idx_hackathons_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_slug ON public.hackathons USING btree (slug);


--
-- Name: idx_hackathons_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_status ON public.hackathons USING btree (status);


--
-- Name: idx_hackathons_views; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hackathons_views ON public.hackathons USING btree (views DESC);


--
-- Name: idx_internship_applications_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_email ON public.internship_applications USING btree (email);


--
-- Name: idx_internship_applications_internship; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_internship ON public.internship_applications USING btree (internship_id, domain, level);


--
-- Name: idx_internship_applications_internship_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_internship_id ON public.internship_applications USING btree (internship_id);


--
-- Name: idx_internship_applications_is_paid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_is_paid ON public.internship_applications USING btree (is_paid);


--
-- Name: idx_internship_applications_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_order_id ON public.internship_applications USING btree (order_id);


--
-- Name: idx_internship_applications_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_payment_status ON public.internship_applications USING btree (payment_status);


--
-- Name: idx_internship_applications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_user ON public.internship_applications USING btree (user_id, created_at DESC);


--
-- Name: idx_internship_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internship_applications_user_id ON public.internship_applications USING btree (user_id);


--
-- Name: idx_judges_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_judges_applications_user_id ON public.judges_applications USING btree (user_id);


--
-- Name: idx_master_registrations_activity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_master_registrations_activity_id ON public.master_registrations USING btree (activity_id);


--
-- Name: idx_master_registrations_activity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_master_registrations_activity_type ON public.master_registrations USING btree (activity_type);


--
-- Name: idx_master_registrations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_master_registrations_status ON public.master_registrations USING btree (status);


--
-- Name: idx_master_registrations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_master_registrations_user_id ON public.master_registrations USING btree (user_id);


--
-- Name: idx_mentor_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mentor_applications_user_id ON public.mentor_applications USING btree (user_id);


--
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);


--
-- Name: idx_messages_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);


--
-- Name: idx_moderation_log_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_log_action ON public.event_moderation_log USING btree (action);


--
-- Name: idx_moderation_log_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_log_company ON public.event_moderation_log USING btree (company_id);


--
-- Name: idx_moderation_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_log_created_at ON public.event_moderation_log USING btree (created_at DESC);


--
-- Name: idx_moderation_log_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_log_event ON public.event_moderation_log USING btree (event_id, event_type);


--
-- Name: idx_newsletter_unsubscribe_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_unsubscribe_token ON public.newsletter_subscriptions USING btree (unsubscribe_token);


--
-- Name: idx_notifications_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_company ON public.notifications USING btree (company_id);


--
-- Name: idx_notifications_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_event ON public.notifications USING btree (event_id);


--
-- Name: idx_notifications_hackathon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_hackathon ON public.notifications USING btree (hackathon_id);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (read);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_organizations_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organizations_active ON public.organizations USING btree (is_active);


--
-- Name: idx_organizations_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organizations_domain ON public.organizations USING btree (domain);


--
-- Name: idx_organizations_industry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organizations_industry ON public.organizations USING btree (industry);


--
-- Name: idx_organizations_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organizations_name ON public.organizations USING btree (name);


--
-- Name: idx_organizations_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organizations_verified ON public.organizations USING btree (is_verified);


--
-- Name: idx_payments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_created_at ON public.payments USING btree (created_at);


--
-- Name: idx_payments_razorpay_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_razorpay_order_id ON public.payments USING btree (razorpay_order_id);


--
-- Name: idx_payments_razorpay_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_razorpay_payment_id ON public.payments USING btree (razorpay_payment_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_active ON public.products USING btree (id, category) WHERE (category IS NOT NULL);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- Name: idx_products_category_price; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_price ON public.products USING btree (category, price);


--
-- Name: idx_products_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_created_at ON public.products USING btree (created_at);


--
-- Name: idx_products_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_difficulty ON public.products USING btree (difficulty);


--
-- Name: idx_products_platform; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_platform ON public.products USING btree (platform);


--
-- Name: idx_products_price; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_price ON public.products USING btree (price);


--
-- Name: idx_profiles_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_admin ON public.profiles USING btree (id, is_admin) WHERE (is_admin = true);


--
-- Name: idx_profiles_codeunia_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_codeunia_id ON public.profiles USING btree (codeunia_id);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_profiles_is_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_is_admin ON public.profiles USING btree (is_admin);


--
-- Name: idx_profiles_is_org_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_is_org_verified ON public.profiles USING btree (is_org_verified);


--
-- Name: idx_profiles_is_premium; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_is_premium ON public.profiles USING btree (is_premium);


--
-- Name: idx_profiles_org_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_org_domain ON public.profiles USING btree (org_domain);


--
-- Name: idx_profiles_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_organization_id ON public.profiles USING btree (organization_id);


--
-- Name: idx_profiles_premium; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_premium ON public.profiles USING btree (id, is_premium) WHERE (is_premium = true);


--
-- Name: idx_profiles_profile_complete; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_profile_complete ON public.profiles USING btree (profile_complete);


--
-- Name: idx_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_status ON public.profiles USING btree (status);


--
-- Name: idx_profiles_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);


--
-- Name: idx_profiles_username_complete; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_username_complete ON public.profiles USING btree (username, profile_complete);


--
-- Name: idx_profiles_username_set; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_username_set ON public.profiles USING btree (username_set);


--
-- Name: idx_reserved_usernames_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reserved_usernames_active ON public.reserved_usernames USING btree (is_active);


--
-- Name: idx_reserved_usernames_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reserved_usernames_category ON public.reserved_usernames USING btree (category);


--
-- Name: idx_reserved_usernames_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reserved_usernames_expires ON public.reserved_usernames USING btree (expires_at);


--
-- Name: idx_reserved_usernames_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reserved_usernames_username ON public.reserved_usernames USING btree (username);


--
-- Name: idx_resumes_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resumes_updated_at ON public.resumes USING btree (updated_at DESC);


--
-- Name: idx_resumes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resumes_user_id ON public.resumes USING btree (user_id);


--
-- Name: idx_resumes_user_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resumes_user_updated ON public.resumes USING btree (user_id, updated_at DESC);


--
-- Name: idx_round_registrations_round_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_round_registrations_round_id ON public.round_registrations USING btree (round_id);


--
-- Name: idx_round_registrations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_round_registrations_status ON public.round_registrations USING btree (status);


--
-- Name: idx_round_registrations_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_round_registrations_test_id ON public.round_registrations USING btree (test_id);


--
-- Name: idx_round_registrations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_round_registrations_user_id ON public.round_registrations USING btree (user_id);


--
-- Name: idx_sponsorship_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sponsorship_applications_user_id ON public.sponsorship_applications USING btree (user_id);


--
-- Name: idx_support_ticket_replies_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_ticket_replies_admin_id ON public.support_ticket_replies USING btree (admin_id);


--
-- Name: idx_support_ticket_replies_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_ticket_replies_created_at ON public.support_ticket_replies USING btree (created_at);


--
-- Name: idx_support_ticket_replies_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_ticket_replies_ticket_id ON public.support_ticket_replies USING btree (ticket_id);


--
-- Name: idx_support_ticket_replies_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_ticket_replies_user_id ON public.support_ticket_replies USING btree (user_id);


--
-- Name: idx_support_tickets_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_created_at ON public.support_tickets USING btree (created_at DESC);


--
-- Name: idx_support_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_status ON public.support_tickets USING btree (status);


--
-- Name: idx_support_tickets_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_type ON public.support_tickets USING btree (type);


--
-- Name: idx_support_tickets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets USING btree (user_id);


--
-- Name: idx_test_answers_attempt_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_answers_attempt_id ON public.test_answers USING btree (attempt_id);


--
-- Name: idx_test_answers_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_answers_question_id ON public.test_answers USING btree (question_id);


--
-- Name: idx_test_answers_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_answers_test_id ON public.test_answers USING btree (test_id);


--
-- Name: idx_test_attempts_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_attempts_test_id ON public.test_attempts USING btree (test_id);


--
-- Name: idx_test_attempts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_attempts_user_id ON public.test_attempts USING btree (user_id);


--
-- Name: idx_test_leaderboard_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_leaderboard_score ON public.test_leaderboard USING btree (test_id, score DESC);


--
-- Name: idx_test_leaderboard_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_leaderboard_test_id ON public.test_leaderboard USING btree (test_id);


--
-- Name: idx_test_questions_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_questions_test_id ON public.test_questions USING btree (test_id);


--
-- Name: idx_test_registrations_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_registrations_email ON public.test_registrations USING btree (email);


--
-- Name: idx_test_registrations_institution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_registrations_institution ON public.test_registrations USING btree (institution);


--
-- Name: idx_test_registrations_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_registrations_test_id ON public.test_registrations USING btree (test_id);


--
-- Name: idx_test_registrations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_registrations_user_id ON public.test_registrations USING btree (user_id);


--
-- Name: idx_test_rounds_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_rounds_end_date ON public.test_rounds USING btree (end_date);


--
-- Name: idx_test_rounds_round_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_rounds_round_number ON public.test_rounds USING btree (round_number);


--
-- Name: idx_test_rounds_round_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_rounds_round_type ON public.test_rounds USING btree (round_type);


--
-- Name: idx_test_rounds_start_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_rounds_start_date ON public.test_rounds USING btree (start_date);


--
-- Name: idx_test_rounds_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_rounds_test_id ON public.test_rounds USING btree (test_id);


--
-- Name: idx_tests_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tests_created_by ON public.tests USING btree (created_by);


--
-- Name: idx_tests_registration_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tests_registration_dates ON public.tests USING btree (registration_start, registration_end);


--
-- Name: idx_tests_test_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tests_test_dates ON public.tests USING btree (test_start, test_end);


--
-- Name: idx_user_activity_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_date ON public.user_activity USING btree (activity_date);


--
-- Name: idx_user_activity_log_activity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_log_activity_type ON public.user_activity_log USING btree (activity_type);


--
-- Name: idx_user_activity_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_log_created_at ON public.user_activity_log USING btree (created_at DESC);


--
-- Name: idx_user_activity_log_related_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_log_related_id ON public.user_activity_log USING btree (related_id);


--
-- Name: idx_user_activity_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log USING btree (user_id);


--
-- Name: idx_user_activity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_type ON public.user_activity USING btree (activity_type);


--
-- Name: idx_user_activity_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_user_date ON public.user_activity USING btree (user_id, activity_date);


--
-- Name: idx_user_activity_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_user_id ON public.user_activity USING btree (user_id);


--
-- Name: idx_user_connections_follower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_connections_follower ON public.user_connections USING btree (follower_id);


--
-- Name: idx_user_connections_following; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_connections_following ON public.user_connections USING btree (following_id);


--
-- Name: idx_user_points_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_points_rank ON public.user_points USING btree (rank);


--
-- Name: idx_user_points_total_points; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_points_total_points ON public.user_points USING btree (total_points DESC);


--
-- Name: idx_user_points_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_points_user_id ON public.user_points USING btree (user_id);


--
-- Name: idx_user_presence_is_online; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_presence_is_online ON public.user_presence USING btree (is_online);


--
-- Name: idx_user_presence_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_presence_user_id ON public.user_presence USING btree (user_id);


--
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);


--
-- Name: idx_volunteer_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_volunteer_applications_user_id ON public.volunteer_applications USING btree (user_id);


--
-- Name: judges_applications_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX judges_applications_email_idx ON public.judges_applications USING btree (email);


--
-- Name: mentor_applications_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mentor_applications_email_idx ON public.mentor_applications USING btree (email);


--
-- Name: volunteer_applications_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX volunteer_applications_email_idx ON public.volunteer_applications USING btree (email);


--
-- Name: certificates generate_certificate_path_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER generate_certificate_path_trigger BEFORE INSERT ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.trigger_generate_certificate_path();


--
-- Name: profiles handle_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: certificates log_certificate_activity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER log_certificate_activity AFTER INSERT ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.log_user_activity();


--
-- Name: test_attempts log_test_completion_activity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER log_test_completion_activity AFTER UPDATE ON public.test_attempts FOR EACH ROW WHEN (((old.status <> 'submitted'::text) AND (new.status = 'submitted'::text))) EXECUTE FUNCTION public.log_user_activity();


--
-- Name: test_registrations log_test_registration_activity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER log_test_registration_activity AFTER INSERT ON public.test_registrations FOR EACH ROW EXECUTE FUNCTION public.log_user_activity();


--
-- Name: user_points recalculate_ranks_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER recalculate_ranks_trigger AFTER UPDATE ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_ranks();


--
-- Name: test_registrations sync_test_registrations_profile_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_test_registrations_profile_trigger BEFORE INSERT OR UPDATE ON public.test_registrations FOR EACH ROW EXECUTE FUNCTION public.sync_test_registrations_profile_data();


--
-- Name: event_registrations track_event_registration_analytics; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_event_registration_analytics AFTER INSERT OR DELETE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION public.track_event_registration();


--
-- Name: hackathon_registrations track_hackathon_registration_analytics; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_hackathon_registration_analytics AFTER INSERT OR DELETE ON public.hackathon_registrations FOR EACH ROW EXECUTE FUNCTION public.track_event_registration();


--
-- Name: profiles trg_set_profile_email; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_profile_email BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_profile_email();


--
-- Name: interns trg_sync_names_insert_interns; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_names_insert_interns BEFORE INSERT ON public.interns FOR EACH ROW EXECUTE FUNCTION public.sync_intern_names();


--
-- Name: profiles trg_sync_names_update_profiles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_names_update_profiles AFTER UPDATE OF first_name, last_name ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.sync_intern_names();


--
-- Name: profiles trigger_auto_generate_codeunia_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_generate_codeunia_id BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.auto_generate_codeunia_id();


--
-- Name: events trigger_log_event_creation; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_log_event_creation AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.log_event_creation();


--
-- Name: events trigger_log_event_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_log_event_deletion BEFORE DELETE ON public.events FOR EACH ROW EXECUTE FUNCTION public.log_event_deletion();


--
-- Name: companies trigger_notify_company_rejected; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_company_rejected AFTER UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.notify_company_rejected();


--
-- Name: companies trigger_notify_company_verified; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_company_verified AFTER UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.notify_company_verified();


--
-- Name: events trigger_notify_event_approved; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_event_approved AFTER UPDATE OF approval_status ON public.events FOR EACH ROW WHEN (((new.approval_status = 'approved'::text) AND (old.approval_status IS DISTINCT FROM 'approved'::text))) EXECUTE FUNCTION public.notify_event_approved();


--
-- Name: TRIGGER trigger_notify_event_approved ON events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER trigger_notify_event_approved ON public.events IS 'Sends notification to event creator when event is approved. 
This is the ONLY trigger that should create event approval notifications.
The notify_event_status_change trigger was removed to prevent duplicates.';


--
-- Name: events trigger_notify_event_changes_requested; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_event_changes_requested AFTER UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.notify_event_changes_requested();


--
-- Name: events trigger_notify_event_rejected; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_event_rejected AFTER UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.notify_event_rejected();


--
-- Name: hackathons trigger_notify_hackathon_approved; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_hackathon_approved AFTER UPDATE ON public.hackathons FOR EACH ROW EXECUTE FUNCTION public.notify_hackathon_approved();


--
-- Name: profiles trigger_process_organization_data; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_process_organization_data BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.process_organization_data();


--
-- Name: events trigger_update_company_events_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_company_events_count AFTER INSERT OR DELETE OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_company_events_count();


--
-- Name: hackathons trigger_update_company_hackathons_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_company_hackathons_count AFTER INSERT OR DELETE OR UPDATE ON public.hackathons FOR EACH ROW EXECUTE FUNCTION public.update_company_hackathons_count();


--
-- Name: messages trigger_update_conversation_last_message; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_conversation_last_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();


--
-- Name: master_registrations trigger_update_event_registration_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_event_registration_count AFTER INSERT OR DELETE OR UPDATE ON public.master_registrations FOR EACH ROW EXECUTE FUNCTION public.update_event_registration_count();


--
-- Name: TRIGGER trigger_update_event_registration_count ON master_registrations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER trigger_update_event_registration_count ON public.master_registrations IS 'Keeps events.registered in sync with master_registrations table';


--
-- Name: master_registrations trigger_update_hackathon_registration_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_hackathon_registration_count AFTER INSERT OR DELETE OR UPDATE ON public.master_registrations FOR EACH ROW EXECUTE FUNCTION public.update_hackathon_registration_count();


--
-- Name: TRIGGER trigger_update_hackathon_registration_count ON master_registrations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER trigger_update_hackathon_registration_count ON public.master_registrations IS 'Keeps hackathons.registered in sync with master_registrations table';


--
-- Name: ai_training_data update_ai_training_data_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_training_data_updated_at BEFORE UPDATE ON public.ai_training_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: companies update_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_members update_company_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_members_updated_at BEFORE UPDATE ON public.company_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_company_registrations_on_event_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_registrations_on_event_change AFTER INSERT OR DELETE OR UPDATE OF registered, company_id ON public.events FOR EACH ROW EXECUTE FUNCTION public.trigger_update_company_registrations_from_events();


--
-- Name: hackathons update_company_registrations_on_hackathon_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_registrations_on_hackathon_change AFTER INSERT OR DELETE OR UPDATE OF registered, company_id ON public.hackathons FOR EACH ROW EXECUTE FUNCTION public.trigger_update_company_registrations_from_hackathons();


--
-- Name: events update_company_stats_on_event; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_stats_on_event AFTER INSERT OR DELETE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_company_statistics();


--
-- Name: hackathons update_company_stats_on_hackathon; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_stats_on_hackathon AFTER INSERT OR DELETE ON public.hackathons FOR EACH ROW EXECUTE FUNCTION public.update_company_statistics();


--
-- Name: contact_submissions update_contact_submissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: core_team_applications update_core_team_applications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_core_team_applications_updated_at BEFORE UPDATE ON public.core_team_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: event_registrations update_event_registrations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: hackathon_registrations update_hackathon_registrations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_hackathon_registrations_updated_at BEFORE UPDATE ON public.hackathon_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notifications update_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: resumes update_resumes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: round_registrations update_round_registrations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_round_registrations_updated_at BEFORE UPDATE ON public.round_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: support_tickets update_support_tickets_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_tickets_updated_at_trigger BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_support_tickets_updated_at();


--
-- Name: test_rounds update_test_rounds_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_test_rounds_updated_at BEFORE UPDATE ON public.test_rounds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_presence update_user_presence_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_presence_updated_at_trigger BEFORE UPDATE ON public.user_presence FOR EACH ROW EXECUTE FUNCTION public.update_user_presence_updated_at();


--
-- Name: admin_audit_logs admin_audit_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_training_data ai_training_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_training_data
    ADD CONSTRAINT ai_training_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: blog_likes blog_likes_blog_slug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_blog_slug_fkey FOREIGN KEY (blog_slug) REFERENCES public.blogs(slug) ON DELETE CASCADE;


--
-- Name: blog_likes blog_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: certificate_templates certificate_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificate_templates
    ADD CONSTRAINT certificate_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.certificate_templates(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pending_payments codeunia_pending_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_payments
    ADD CONSTRAINT codeunia_pending_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: collaboration_applications collaboration_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaboration_applications
    ADD CONSTRAINT collaboration_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: companies companies_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id);


--
-- Name: companies companies_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id);


--
-- Name: company_analytics company_analytics_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_analytics
    ADD CONSTRAINT company_analytics_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_members company_members_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT company_members_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_members company_members_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT company_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id);


--
-- Name: company_members company_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT company_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: core_team_applications core_team_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_team_applications
    ADD CONSTRAINT core_team_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: event_audit_log event_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_audit_log
    ADD CONSTRAINT event_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: event_audit_log event_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_audit_log
    ADD CONSTRAINT event_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: event_moderation_log event_moderation_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_moderation_log
    ADD CONSTRAINT event_moderation_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: event_moderation_log event_moderation_log_moderator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_moderation_log
    ADD CONSTRAINT event_moderation_log_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES auth.users(id);


--
-- Name: event_registrations event_registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_registrations event_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: events events_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: events events_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: hackathon_registrations hackathon_registrations_hackathon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathon_registrations
    ADD CONSTRAINT hackathon_registrations_hackathon_id_fkey FOREIGN KEY (hackathon_id) REFERENCES public.hackathons(id) ON DELETE CASCADE;


--
-- Name: hackathon_registrations hackathon_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathon_registrations
    ADD CONSTRAINT hackathon_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: hackathons hackathons_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathons
    ADD CONSTRAINT hackathons_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: hackathons hackathons_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathons
    ADD CONSTRAINT hackathons_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: hackathons hackathons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathons
    ADD CONSTRAINT hackathons_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: interns interns_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interns
    ADD CONSTRAINT interns_email_fkey FOREIGN KEY (email) REFERENCES public.profiles(email) ON DELETE CASCADE;


--
-- Name: internship_applications internship_applications_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internship_applications
    ADD CONSTRAINT internship_applications_email_fkey FOREIGN KEY (email) REFERENCES public.profiles(email) ON UPDATE CASCADE;


--
-- Name: internship_applications internship_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internship_applications
    ADD CONSTRAINT internship_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: judges_applications judges_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.judges_applications
    ADD CONSTRAINT judges_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: master_registration_details master_registration_details_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registration_details
    ADD CONSTRAINT master_registration_details_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.master_registrations(id) ON DELETE CASCADE;


--
-- Name: master_registrations master_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_registrations
    ADD CONSTRAINT master_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mentor_applications mentor_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentor_applications
    ADD CONSTRAINT mentor_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: organizations organizations_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: reserved_usernames reserved_usernames_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserved_usernames
    ADD CONSTRAINT reserved_usernames_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: resumes resumes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: round_registrations round_registrations_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_registrations
    ADD CONSTRAINT round_registrations_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.test_rounds(id) ON DELETE CASCADE;


--
-- Name: round_registrations round_registrations_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_registrations
    ADD CONSTRAINT round_registrations_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: round_registrations round_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_registrations
    ADD CONSTRAINT round_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: sponsorship_applications sponsorship_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorship_applications
    ADD CONSTRAINT sponsorship_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: support_ticket_replies support_ticket_replies_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_replies
    ADD CONSTRAINT support_ticket_replies_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: support_ticket_replies support_ticket_replies_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_replies
    ADD CONSTRAINT support_ticket_replies_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: support_ticket_replies support_ticket_replies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_replies
    ADD CONSTRAINT support_ticket_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: test_answers test_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.test_attempts(id) ON DELETE CASCADE;


--
-- Name: test_answers test_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.test_questions(id) ON DELETE CASCADE;


--
-- Name: test_answers test_answers_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: test_leaderboard test_leaderboard_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_leaderboard
    ADD CONSTRAINT test_leaderboard_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_leaderboard test_leaderboard_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_leaderboard
    ADD CONSTRAINT test_leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: test_questions test_questions_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_questions
    ADD CONSTRAINT test_questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_registrations test_registrations_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_registrations
    ADD CONSTRAINT test_registrations_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_registrations test_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_registrations
    ADD CONSTRAINT test_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: test_rounds test_rounds_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_rounds
    ADD CONSTRAINT test_rounds_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: tests tests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_activity_log user_activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_log
    ADD CONSTRAINT user_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_activity user_activity_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity
    ADD CONSTRAINT user_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_connections user_connections_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_connections
    ADD CONSTRAINT user_connections_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_connections user_connections_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_connections
    ADD CONSTRAINT user_connections_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_points user_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_points
    ADD CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_presence user_presence_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: volunteer_applications volunteer_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_applications
    ADD CONSTRAINT volunteer_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: support_ticket_replies Admins can create replies on any ticket; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create replies on any ticket" ON public.support_ticket_replies FOR INSERT WITH CHECK (((admin_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))));


--
-- Name: events Admins can delete any event; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete any event" ON public.events FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: admin_audit_logs Admins can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: event_moderation_log Admins can insert moderation logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert moderation logs" ON public.event_moderation_log FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: support_ticket_replies Admins can insert replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert replies" ON public.support_ticket_replies FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: user_activity Admins can manage all activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all activity" ON public.user_activity USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: test_answers Admins can manage all answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all answers" ON public.test_answers USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: test_attempts Admins can manage all attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all attempts" ON public.test_attempts USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: certificates Admins can manage all certificates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all certificates" ON public.certificates USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: test_leaderboard Admins can manage leaderboard; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage leaderboard" ON public.test_leaderboard USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: organizations Admins can manage organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage organizations" ON public.organizations USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: reserved_usernames Admins can manage reserved usernames; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage reserved usernames" ON public.reserved_usernames USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: admin_audit_logs Admins can read audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: support_tickets Admins can update all support tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all support tickets" ON public.support_tickets FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: support_tickets Admins can update all tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all tickets" ON public.support_tickets FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: events Admins can update any event; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any event" ON public.events FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: hackathons Admins can update any hackathon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any hackathon" ON public.hackathons FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: user_activity_log Admins can view all activity logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all activity logs" ON public.user_activity_log FOR SELECT USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text)))));


--
-- Name: company_analytics Admins can view all analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all analytics" ON public.company_analytics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: events Admins can view all events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all events" ON public.events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: hackathons Admins can view all hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all hackathons" ON public.hackathons FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: master_registrations Admins can view all master registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all master registrations" ON public.master_registrations USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: event_moderation_log Admins can view all moderation logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all moderation logs" ON public.event_moderation_log FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: notifications Admins can view all notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: user_points Admins can view all points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all points" ON public.user_points FOR SELECT USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text)))));


--
-- Name: event_registrations Admins can view all registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all registrations" ON public.event_registrations USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: support_ticket_replies Admins can view all replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all replies" ON public.support_ticket_replies FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: support_tickets Admins can view all support tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all support tickets" ON public.support_tickets FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: support_tickets Admins can view all tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: hackathons Allow admin write access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin write access" ON public.hackathons USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: newsletter_subscriptions Allow authenticated users to view subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to view subscribers" ON public.newsletter_subscriptions FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: blogs Allow delete for admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow delete for admin" ON public.blogs FOR DELETE USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: blogs Allow insert for admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for admin" ON public.blogs FOR INSERT WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: events Allow insert for admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for admins" ON public.events FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: ai_training_data Allow public insert for AI training data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert for AI training data" ON public.ai_training_data FOR INSERT WITH CHECK (true);


--
-- Name: hackathons Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.hackathons FOR SELECT USING (true);


--
-- Name: events Allow public read access to events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to events" ON public.events FOR SELECT USING (true);


--
-- Name: newsletter_subscriptions Allow public subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public subscription" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);


--
-- Name: blogs Allow select for all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow select for all" ON public.blogs FOR SELECT USING (true);


--
-- Name: newsletter_subscriptions Allow service role to read all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow service role to read all" ON public.newsletter_subscriptions FOR SELECT USING (true);


--
-- Name: newsletter_subscriptions Allow unsubscribe with token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow unsubscribe with token" ON public.newsletter_subscriptions FOR UPDATE USING (true);


--
-- Name: blogs Allow update for admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow update for admin" ON public.blogs FOR UPDATE USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: reserved_usernames Anyone can read active reserved usernames; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read active reserved usernames" ON public.reserved_usernames FOR SELECT USING ((is_active = true));


--
-- Name: events Anyone can view approved events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved events" ON public.events FOR SELECT USING ((approval_status = 'approved'::text));


--
-- Name: hackathons Anyone can view approved hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved hackathons" ON public.hackathons FOR SELECT USING ((approval_status = 'approved'::text));


--
-- Name: tests Anyone can view public active tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public active tests" ON public.tests FOR SELECT USING (((is_public = true) AND (is_active = true)));


--
-- Name: test_registrations Anyone can view registration counts for public tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view registration counts for public tests" ON public.test_registrations FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.tests
  WHERE ((tests.id = test_registrations.test_id) AND (tests.is_public = true)))));


--
-- Name: user_presence Anyone can view user presence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view user presence" ON public.user_presence FOR SELECT USING (true);


--
-- Name: companies Anyone can view verified active companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view verified active companies" ON public.companies FOR SELECT USING (((verification_status = 'verified'::text) AND (status = 'active'::text)));


--
-- Name: admin_audit_logs Audit logs are immutable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Audit logs are immutable" ON public.admin_audit_logs FOR UPDATE USING (false);


--
-- Name: admin_audit_logs Audit logs cannot be deleted; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Audit logs cannot be deleted" ON public.admin_audit_logs FOR DELETE USING (false);


--
-- Name: companies Authenticated users can create companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: tests Authenticated users can view tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view tests" ON public.tests FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: certificates Certificates are publicly viewable by cert_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Certificates are publicly viewable by cert_id" ON public.certificates FOR SELECT USING (true);


--
-- Name: events Company editors can create events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company editors can create events" ON public.events FOR INSERT WITH CHECK ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));


--
-- Name: hackathons Company editors can create hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company editors can create hackathons" ON public.hackathons FOR INSERT WITH CHECK ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));


--
-- Name: events Company editors can delete events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company editors can delete events" ON public.events FOR DELETE USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text]))))));


--
-- Name: events Company editors can update events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company editors can update events" ON public.events FOR UPDATE USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));


--
-- Name: hackathons Company editors can update hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company editors can update hackathons" ON public.hackathons FOR UPDATE USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text])) AND (company_members.status = 'active'::text)))));


--
-- Name: hackathons Company members can delete their company hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company members can delete their company hackathons" ON public.hackathons FOR DELETE TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.company_members
  WHERE ((company_members.company_id = hackathons.company_id) AND (company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text) AND (company_members.role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text]))))) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))));


--
-- Name: companies Company members can view own company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company members can view own company" ON public.companies FOR SELECT USING (public.user_is_company_member(auth.uid(), id));


--
-- Name: events Company members can view own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company members can view own events" ON public.events FOR SELECT USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));


--
-- Name: hackathons Company members can view own hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company members can view own hackathons" ON public.hackathons FOR SELECT USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));


--
-- Name: companies Company owners can update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company owners can update" ON public.companies FOR UPDATE USING (public.user_has_company_role(auth.uid(), id, ARRAY['owner'::text]));


--
-- Name: volunteer_applications Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.volunteer_applications FOR INSERT WITH CHECK (true);


--
-- Name: test_leaderboard Leaderboard is viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaderboard is viewable by everyone" ON public.test_leaderboard FOR SELECT USING (true);


--
-- Name: company_analytics Members can view company analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view company analytics" ON public.company_analytics FOR SELECT USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));


--
-- Name: company_members Members can view company members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view company members" ON public.company_members FOR SELECT USING (public.user_is_company_member(auth.uid(), company_id));


--
-- Name: event_moderation_log Members can view company moderation log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view company moderation log" ON public.event_moderation_log FOR SELECT USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));


--
-- Name: company_members Owners and admins can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can add members" ON public.company_members FOR INSERT WITH CHECK (public.user_has_company_role(auth.uid(), company_id, ARRAY['owner'::text, 'admin'::text]));


--
-- Name: company_members Owners and admins can delete members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can delete members" ON public.company_members FOR DELETE USING (public.user_has_company_role(auth.uid(), company_id, ARRAY['owner'::text, 'admin'::text]));


--
-- Name: company_members Owners and admins can update members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can update members" ON public.company_members FOR UPDATE USING (public.user_has_company_role(auth.uid(), company_id, ARRAY['owner'::text, 'admin'::text]));


--
-- Name: blog_likes Public can view likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view likes" ON public.blog_likes FOR SELECT USING (true);


--
-- Name: profiles Public profiles are viewable by all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by all" ON public.profiles FOR SELECT USING ((is_public = true));


--
-- Name: test_questions Questions are manageable by admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Questions are manageable by admins" ON public.test_questions USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: test_questions Questions are viewable by registered users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Questions are viewable by registered users" ON public.test_questions FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.test_registrations tr
  WHERE ((tr.test_id = test_questions.test_id) AND (tr.user_id = auth.uid())))) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


--
-- Name: company_analytics Service role can insert analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert analytics" ON public.company_analytics FOR INSERT WITH CHECK (true);


--
-- Name: event_moderation_log Service role can insert moderation logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert moderation logs" ON public.event_moderation_log FOR INSERT WITH CHECK (true);


--
-- Name: notifications Service role can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: test_registrations Service role can manage all registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage all registrations" ON public.test_registrations USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: tests Service role can manage tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage tests" ON public.tests USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: ai_training_data Service role can read all AI training data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can read all AI training data" ON public.ai_training_data FOR SELECT USING (true);


--
-- Name: company_analytics Service role can update analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can update analytics" ON public.company_analytics FOR UPDATE USING (true);


--
-- Name: companies Service role full access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access" ON public.companies TO service_role USING (true) WITH CHECK (true);


--
-- Name: company_members Service role full access members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access members" ON public.company_members USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: payments Service role full access payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access payments" ON public.payments USING ((auth.role() = 'service_role'::text));


--
-- Name: pending_payments Service role full access pending payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access pending payments" ON public.pending_payments USING ((auth.role() = 'service_role'::text));


--
-- Name: user_activity_log System can insert activity logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert activity logs" ON public.user_activity_log FOR INSERT WITH CHECK (true);


--
-- Name: event_audit_log System can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert audit logs" ON public.event_audit_log FOR INSERT WITH CHECK (true);


--
-- Name: user_points System can insert user points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert user points" ON public.user_points FOR INSERT WITH CHECK (true);


--
-- Name: certificate_templates Templates are manageable by admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Templates are manageable by admins" ON public.certificate_templates USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: certificate_templates Templates are viewable by admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Templates are viewable by admins" ON public.certificate_templates FOR SELECT USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: tests Tests are manageable by admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tests are manageable by admins" ON public.tests USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: tests Tests are viewable by everyone if public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tests are viewable by everyone if public" ON public.tests FOR SELECT USING (((is_public = true) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


--
-- Name: conversation_participants Users can add participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add participants" ON public.conversation_participants FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: conversations Users can create conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: company_members Users can create own membership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own membership" ON public.company_members FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: resumes Users can create own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own resumes" ON public.resumes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: support_ticket_replies Users can create replies on their tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create replies on their tickets" ON public.support_ticket_replies FOR INSERT WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = support_ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid()))))));


--
-- Name: user_activity Users can create their own activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own activity" ON public.user_activity FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: test_attempts Users can create their own attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own attempts" ON public.test_attempts FOR INSERT WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.test_registrations tr
  WHERE ((tr.test_id = test_attempts.test_id) AND (tr.user_id = auth.uid()))))));


--
-- Name: user_connections Users can create their own connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own connections" ON public.user_connections FOR INSERT WITH CHECK ((follower_id = auth.uid()));


--
-- Name: support_tickets Users can create their own support tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own support tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: support_tickets Users can create their own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own tickets" ON public.support_tickets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: resumes Users can delete own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_connections Users can delete their own connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own connections" ON public.user_connections FOR DELETE USING ((follower_id = auth.uid()));


--
-- Name: hackathon_registrations Users can delete their own hackathon registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own hackathon registrations" ON public.hackathon_registrations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: messages Users can delete their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE TO authenticated USING ((sender_id = auth.uid()));


--
-- Name: pending_payments Users can insert own pending payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own pending payments" ON public.pending_payments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_presence Users can insert own presence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own presence" ON public.user_presence FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: test_registrations Users can insert own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own registrations" ON public.test_registrations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: hackathon_registrations Users can insert their own hackathon registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own hackathon registrations" ON public.hackathon_registrations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: master_registrations Users can insert their own master registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own master registrations" ON public.master_registrations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: event_registrations Users can insert their own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own registrations" ON public.event_registrations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: blog_likes Users can like posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can like posts" ON public.blog_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_training_data Users can read their own AI training data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read their own AI training data" ON public.ai_training_data FOR SELECT USING (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: test_registrations Users can register for public tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can register for public tests" ON public.test_registrations FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.tests t
  WHERE ((t.id = test_registrations.test_id) AND (t.is_public = true) AND (t.registration_start <= now()) AND (t.registration_end >= now())))));


--
-- Name: messages Users can send messages to their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT TO authenticated WITH CHECK (((sender_id = auth.uid()) AND (conversation_id IN ( SELECT cp.conversation_id
   FROM public.conversation_participants cp
  WHERE (cp.user_id = auth.uid())))));


--
-- Name: test_answers Users can submit their own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit their own answers" ON public.test_answers FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.test_attempts ta
  WHERE ((ta.id = test_answers.attempt_id) AND (ta.user_id = auth.uid()) AND (ta.status = 'in_progress'::text)))));


--
-- Name: blog_likes Users can unlike posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can unlike posts" ON public.blog_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: pending_payments Users can update own pending payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own pending payments" ON public.pending_payments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_presence Users can update own presence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own presence" ON public.user_presence FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: test_registrations Users can update own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own registrations" ON public.test_registrations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: resumes Users can update own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can update their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their conversations" ON public.conversations FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));


--
-- Name: test_answers Users can update their own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own answers" ON public.test_answers FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.test_attempts ta
  WHERE ((ta.id = test_answers.attempt_id) AND (ta.user_id = auth.uid()) AND (ta.status = 'in_progress'::text)))));


--
-- Name: hackathon_registrations Users can update their own hackathon registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own hackathon registrations" ON public.hackathon_registrations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: messages Users can update their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE TO authenticated USING ((sender_id = auth.uid()));


--
-- Name: user_points Users can update their own points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own points" ON public.user_points FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: event_registrations Users can update their own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own registrations" ON public.event_registrations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: organizations Users can view active organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active organizations" ON public.organizations FOR SELECT USING ((is_active = true));


--
-- Name: user_connections Users can view all connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all connections" ON public.user_connections FOR SELECT USING (true);


--
-- Name: user_points Users can view all points for leaderboard; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all points for leaderboard" ON public.user_points FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: event_audit_log Users can view audit logs for their companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view audit logs for their companies" ON public.event_audit_log FOR SELECT USING ((company_id IN ( SELECT company_members.company_id
   FROM public.company_members
  WHERE ((company_members.user_id = auth.uid()) AND (company_members.status = 'active'::text)))));


--
-- Name: messages Users can view messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT TO authenticated USING ((conversation_id IN ( SELECT cp.conversation_id
   FROM public.conversation_participants cp
  WHERE (cp.user_id = auth.uid()))));


--
-- Name: company_members Users can view own memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own memberships" ON public.company_members FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: payments Users can view own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING ((auth.uid() IN ( SELECT pending_payments.user_id
   FROM public.pending_payments
  WHERE ((payments.razorpay_order_id)::text = (payments.razorpay_order_id)::text))));


--
-- Name: pending_payments Users can view own pending payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own pending payments" ON public.pending_payments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: test_registrations Users can view own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own registrations" ON public.test_registrations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: resumes Users can view own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: conversation_participants Users can view participants in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants FOR SELECT TO authenticated USING ((conversation_id IN ( SELECT cp.conversation_id
   FROM public.conversation_participants cp
  WHERE (cp.user_id = auth.uid()))));


--
-- Name: profiles Users can view public profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view public profiles" ON public.profiles FOR SELECT USING ((is_public = true));


--
-- Name: support_ticket_replies Users can view replies on their tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view replies on their tickets" ON public.support_ticket_replies FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = support_ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid())))));


--
-- Name: support_ticket_replies Users can view replies to their tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view replies to their tickets" ON public.support_ticket_replies FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = support_ticket_replies.ticket_id) AND (support_tickets.user_id = auth.uid())))));


--
-- Name: conversations Users can view their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));


--
-- Name: user_activity Users can view their own activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own activity" ON public.user_activity FOR SELECT USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


--
-- Name: user_activity_log Users can view their own activity log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own activity log" ON public.user_activity_log FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: test_answers Users can view their own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own answers" ON public.test_answers FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.test_attempts ta
  WHERE ((ta.id = test_answers.attempt_id) AND (ta.user_id = auth.uid())))) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


--
-- Name: test_attempts Users can view their own attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own attempts" ON public.test_attempts FOR SELECT USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


--
-- Name: certificates Users can view their own certificates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: hackathon_registrations Users can view their own hackathon registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own hackathon registrations" ON public.hackathon_registrations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: master_registrations Users can view their own master registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own master registrations" ON public.master_registrations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: event_registrations Users can view their own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own registrations" ON public.event_registrations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: test_registrations Users can view their own registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own registrations" ON public.test_registrations FOR SELECT USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


--
-- Name: support_tickets Users can view their own support tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own support tickets" ON public.support_tickets FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: support_tickets Users can view their own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: volunteer_applications admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin ON public.volunteer_applications TO service_role USING (true) WITH CHECK (true);


--
-- Name: admin_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: interns admins_can_manage_interns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_manage_interns ON public.interns USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: mentorship admins_can_manage_mentorship; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_manage_mentorship ON public.mentorship USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: products admins_can_manage_products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_manage_products ON public.products USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: projects admins_can_manage_projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_manage_projects ON public.projects USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: test_rounds admins_can_manage_test_rounds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_manage_test_rounds ON public.test_rounds USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: user_roles admins_can_manage_user_roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_manage_user_roles ON public.user_roles USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: ai_training_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_training_data ENABLE ROW LEVEL SECURITY;

--
-- Name: mentorship authenticated_users_can_apply_mentorship; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_users_can_apply_mentorship ON public.mentorship FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: blog_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: blogs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

--
-- Name: blogs blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY blogs ON public.blogs USING (true) WITH CHECK (true);


--
-- Name: certificate_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: collaboration_applications collaboration; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY collaboration ON public.collaboration_applications FOR INSERT WITH CHECK (true);


--
-- Name: collaboration_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collaboration_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: company_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_submissions contact; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contact ON public.contact_submissions USING (true) WITH CHECK (true);


--
-- Name: contact_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: event_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: event_moderation_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_moderation_log ENABLE ROW LEVEL SECURITY;

--
-- Name: event_registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: hackathon_registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: hackathons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

--
-- Name: interns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;

--
-- Name: internship_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: judges_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.judges_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: judges_applications judges_applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY judges_applications ON public.judges_applications FOR INSERT WITH CHECK (true);


--
-- Name: keep_alive; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

--
-- Name: master_registration_details; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_registration_details ENABLE ROW LEVEL SECURITY;

--
-- Name: master_registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.master_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: mentor_applications mentor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mentor ON public.mentor_applications FOR INSERT WITH CHECK (true);


--
-- Name: mentor_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: mentorship; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mentorship ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: pending_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: products public_can_view_products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_can_view_products ON public.products FOR SELECT USING (true);


--
-- Name: projects public_can_view_projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_can_view_projects ON public.projects FOR SELECT USING (true);


--
-- Name: test_rounds public_can_view_test_rounds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_can_view_test_rounds ON public.test_rounds FOR SELECT USING (true);


--
-- Name: interns read_own_intern_row; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_own_intern_row ON public.interns FOR SELECT USING ((auth.email() = email));


--
-- Name: reserved_usernames; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reserved_usernames ENABLE ROW LEVEL SECURITY;

--
-- Name: resumes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

--
-- Name: roles role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY role ON public.roles FOR INSERT WITH CHECK (true);


--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: round_registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.round_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sponsorship_applications sponsorship; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sponsorship ON public.sponsorship_applications FOR INSERT WITH CHECK (true);


--
-- Name: sponsorship_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sponsorship_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: support_ticket_replies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;

--
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: keep_alive system_can_manage_keep_alive; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY system_can_manage_keep_alive ON public.keep_alive USING (true);


--
-- Name: order_items system_can_manage_order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY system_can_manage_order_items ON public.order_items USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'service_role'::text)))));


--
-- Name: orders system_can_manage_orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY system_can_manage_orders ON public.orders USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'service_role'::text)))));


--
-- Name: round_registrations system_can_manage_round_registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY system_can_manage_round_registrations ON public.round_registrations USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'service_role'::text)))));


--
-- Name: test_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: test_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: test_leaderboard; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_leaderboard ENABLE ROW LEVEL SECURITY;

--
-- Name: test_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: test_registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: test_rounds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_rounds ENABLE ROW LEVEL SECURITY;

--
-- Name: tests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

--
-- Name: user_activity; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

--
-- Name: user_activity_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

--
-- Name: user_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: internship_applications user_insert_own_app; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_insert_own_app ON public.internship_applications FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_points; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

--
-- Name: user_presence; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: internship_applications user_select_own_app; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_select_own_app ON public.internship_applications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: orders users_can_create_orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_create_orders ON public.orders FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: round_registrations users_can_create_round_registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_create_round_registrations ON public.round_registrations FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: orders users_can_update_own_orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_update_own_orders ON public.orders FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: mentorship users_can_view_mentorship; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_view_mentorship ON public.mentorship FOR SELECT USING (true);


--
-- Name: order_items users_can_view_own_order_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_view_own_order_items ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: orders users_can_view_own_orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_view_own_orders ON public.orders FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: pending_payments users_can_view_own_pending_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_view_own_pending_payments ON public.pending_payments FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_roles users_can_view_own_roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_view_own_roles ON public.user_roles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: round_registrations users_can_view_own_round_registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_can_view_own_round_registrations ON public.round_registrations FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: volunteer_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime blogs; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.blogs;


--
-- Name: supabase_realtime messages; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.messages;


--
-- Name: supabase_realtime user_presence; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.user_presence;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict wHHu30W2rUIDAs5qZNz98lcGqa5W0GOwTdb5mYhijwndmJlyoh65CKjVXRgNPx8

