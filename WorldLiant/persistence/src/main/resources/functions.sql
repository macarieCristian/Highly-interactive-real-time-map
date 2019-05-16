CREATE OR REPLACE FUNCTION degreesToRadians(deg DOUBLE PRECISION)
  RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN deg * PI() / 180;
END
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION haversineDistance(lat1 DOUBLE PRECISION, lng1 DOUBLE PRECISION, lat2 DOUBLE PRECISION,
                                             lng2 DOUBLE PRECISION)
  RETURNS DOUBLE PRECISION AS $$
DECLARE
  dlat  DOUBLE PRECISION;
  dlng  DOUBLE PRECISION;
  lat1r DOUBLE PRECISION;
  lng1r DOUBLE PRECISION;
  lat2r DOUBLE PRECISION;
  lng2r DOUBLE PRECISION;
  a     DOUBLE PRECISION;
  c     DOUBLE PRECISION;
  dk    DOUBLE PRECISION;
BEGIN
  -- transform coordinates to radians
  lat1r := (SELECT degreesToRadians(deg := lat1));
  lng1r := (SELECT degreesToRadians(deg := lng1));
  lat2r := (SELECT degreesToRadians(deg := lat2));
  lng2r := (SELECT degreesToRadians(deg := lng2));

  -- compute deltas
  dlat := lat2r - lat1r;
  dlng := lng2r - lng1r;

  -- haversine formula
  a := power(sin(dlat / 2), 2) + cos(lat1r) * cos(lat2r) * power(sin(dlng / 2), 2);
  c := 2 * atan2(sqrt(a), sqrt(1 - a)); -- great circle distance in radians
  dk := 6373 * c; -- great circle distance in km
  RETURN dk * 1000; -- in meters
END
$$
LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION getUsersWithScanAreasIncludingPoint(
--   lat                DOUBLE PRECISION,
--   lng                DOUBLE PRECISION,
--   notificationStatus VARCHAR(255),
--   currentUsername    VARCHAR(255))
--   RETURNS TABLE(
--     firstName VARCHAR(255),
--     lastName VARCHAR(255),
--     email VARCHAR(255),
--     phone VARCHAR(255),
--     scanAreas VARCHAR(255)[]
--   ) AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT DISTINCT
--     u.first_name      AS firstName,
--     u.last_name       AS lastName,
--     u.email           AS email,
--     u.phone           AS phone,
--     array_agg(sa.name) AS scanAreas
--   FROM app_user u
--     JOIN scan_area sa ON u.id = sa.app_user_id
--   WHERE u.username <> currentUsername AND
--         sa.notification_status = notificationStatus AND
--         haversineDistance(sa.latitude, sa.longitude, lat, lng) <= sa.radius
--   GROUP BY u.id;
-- END
-- $$
-- LANGUAGE plpgsql;