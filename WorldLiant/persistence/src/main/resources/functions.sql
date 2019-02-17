create or replace function degreesToRadians(deg double precision) returns double precision as $$
begin
  return deg * PI() / 180;
end
$$ language plpgsql;

create or replace function haversineDistance(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision) returns double precision as $$
declare
  dlat double precision;
  dlng double precision;
  lat1r double precision;
  lng1r double precision;
  lat2r double precision;
  lng2r double precision;
  a double precision;
  c double precision;
  dk double precision;
begin
  -- transform coordinates to radians
  lat1r := (select degreesToRadians(deg := lat1));
  lng1r := (select degreesToRadians(deg := lng1));
  lat2r := (select degreesToRadians(deg := lat2));
  lng2r := (select degreesToRadians(deg := lng2));

  -- compute deltas
  dlat := lat2r - lat1r;
  dlng := lng2r - lng1r;

  -- haversine formula
  a := power(sin(dlat / 2), 2) + cos(lat1r) * cos(lat2r) * power(sin(dlng / 2), 2);
  c := 2 * atan2(sqrt(a), sqrt(1 - a)); -- great circle distance in radians
  dk := 6373 * c; -- great circle distance in km
  return dk * 1000; -- in meters
end
$$ language plpgsql;