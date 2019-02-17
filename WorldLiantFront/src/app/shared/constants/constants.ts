export class Constants {
  // Recapcha
  static SITE_KEY = '6LfdGXwUAAAAAJI_g1VurQyqMueVd5_FD08OszTW';

  // Gender constants
  static genderList = [
    {'value': 'MALE', 'message': 'Male'},
    {'value': 'FEMALE', 'message': 'Female'},
    {'value': 'OTHER', 'message': 'Other'}
  ];

  // Reverse geocoding endpoint
  static REVERSE_GEOCODING_URL = 'https://nominatim.openstreetmap.org/search';

  // Leaflet map
  static LEAFLET_URL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
  static LEAFLET_MAP_PROPERTIES = {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 16,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiY3Jpc3RpYW45NzI1IiwiYSI6ImNqczBydzJudTFtbmw0NHBnY2ZhaG9zZXMifQ.liyoFhkrGqvOC8JGIYQ9zg'
  };

  // Leaflet draw
  static MAX_SCAN_AREA_RADIUS = 50000;
}
