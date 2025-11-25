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
--
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

\unrestrict OVoBGub51LjFy6kEY7dRtaMWfQ2BIRckmmYLXufmKBCuNpLz3XLKfT2ZMgLMnQe

