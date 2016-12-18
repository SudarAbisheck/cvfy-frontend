CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS
auth.users ( 
  username TEXT PRIMARY KEY CHECK (length(username) < 50),
  pass TEXT NOT NULL CHECK (length(pass) < 512),
  role NAME NOT NULL CHECK (length(role) < 50)
);

CREATE OR REPLACE FUNCTION
auth.make_master_user() RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users AS r WHERE r.role = 'master') THEN
    new.role = 'master';
  ELSE
    new.role = 'basic_user';
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS ensure_master_user_exists ON auth.users;
CREATE TRIGGER ensure_master_user_exists
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE auth.make_master_user();

CREATE OR REPLACE FUNCTION
auth.check_role_exists() RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles AS r WHERE r.rolname = new.role) THEN
    RAISE foreign_key_violation USING message =
      'unknown database role: ' || new.role;
    RETURN null;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_user_role_exists ON auth.users;
CREATE CONSTRAINT TRIGGER ensure_user_role_exists
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE auth.check_role_exists();

CREATE OR REPLACE FUNCTION
auth.encrypt_pass() RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
BEGIN
  IF tg_op = 'INSERT' OR new.pass <> old.pass THEN
    new.pass = crypt(new.pass, gen_salt('bf'));
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS encrypt_pass on auth.users;
CREATE TRIGGER encrypt_pass
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE auth.encrypt_pass();

CREATE OR REPLACE FUNCTION
auth.user_role(username text, pass text) RETURNS name
  LANGUAGE PLPGSQL
  AS $$
BEGIN
  RETURN (
  SELECT ROLE FROM auth.users
    WHERE users.username = user_role.username
    AND users.pass = crypt(user_role.pass, users.pass)
  );
END;
$$;

CREATE OR REPLACE FUNCTION
auth.change_password(username text, newpass text, oldpass text) RETURNS boolean
  LANGUAGE PLPGSQL
  AS $$
BEGIN
  IF auth.user_role(change_password.username, change_password.oldpass) IS NOT NULL THEN
    UPDATE auth.users SET pass = change_password.newpass
    WHERE users.username = change_password.username;
  END IF;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION
auth.change_role(master_username text, master_password text, member_username text, member_new_role text) RETURNS boolean
  LANGUAGE PLPGSQL
  AS $$
DECLARE
  master_role name;
BEGIN
  SELECT auth.user_role(change_role.master_username, change_role.master_password) INTO master_role;
  IF master_role IS NOT NULL THEN
    IF pg_has_role(master_role, 'master', 'member') THEN
      UPDATE auth.users SET role = change_role.member_new_role
      WHERE users.username = change_role.member_username;
    RETURN FOUND;
    END IF;
  ELSE
    RAISE check_violation USING message =
      'incorrect master credentials';
  END IF;
  RETURN FALSE;
END;
$$;
