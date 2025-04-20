-- Create a function to get allowed roles from the profiles table
CREATE OR REPLACE FUNCTION get_allowed_roles()
RETURNS TEXT[] AS $$
DECLARE
    role_values TEXT[];
BEGIN
    -- Get the check constraint values for the role column
    SELECT array_agg(trim(both '\'' from r))
    INTO role_values
    FROM (
        SELECT regexp_split_to_table(
            regexp_replace(
                regexp_replace(
                    pg_get_constraintdef(c.oid),
                    '.*CHECK \(\(.*::\w+ = ANY \(ARRAY\[(.*)\]\)\)\).*',
                    '\1'
                ),
                '::text', ''
            ),
            ','
        ) AS r
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE t.relname = 'profiles'
        AND n.nspname = 'public'
        AND c.conname = 'profiles_role_check'
    ) AS roles;

    -- If we couldn't get the values, return a default set
    IF role_values IS NULL OR array_length(role_values, 1) = 0 THEN
        role_values := ARRAY['student', 'ta'];
    END IF;

    RETURN role_values;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
