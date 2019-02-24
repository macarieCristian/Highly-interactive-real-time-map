export class HaversineDistanceUtil {

  // convert degrees to radians
  private static degreesToRadians(deg: number) {
    return deg * Math.PI / 180; // radians = degrees * pi/180
  }

  // Haversine Formula
  static computeDistanceBetweenPoints(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // 6373 - mean radius of the earth (km) at 39 degrees from the equator

    // convert coordinates to radians
    lat1 = HaversineDistanceUtil.degreesToRadians(lat1);
    lng1 = HaversineDistanceUtil.degreesToRadians(lng1);
    lat2 = HaversineDistanceUtil.degreesToRadians(lat2);
    lng2 = HaversineDistanceUtil.degreesToRadians(lng2);

    const dlng = lng2 - lng1;
    const dlat = lat2 - lat1;

    const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlng / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
    const result = 6373 * c; // great circle distance in km
    return result * 1000; // great circle distance in m
  }

  static pointInsideCircle(latP: number, lngP: number, latC: number, lngC: number, radius: number): boolean {
    const distance = HaversineDistanceUtil.computeDistanceBetweenPoints(latP, lngP, latC, lngC);
    return distance <= radius;
  }


}
