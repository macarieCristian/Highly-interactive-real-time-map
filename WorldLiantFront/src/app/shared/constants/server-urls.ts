export class ServerUrls {
  static BASE_URL = 'http://localhost:8080/';

  // Users
  static LOGIN = `${ServerUrls.BASE_URL}authentication/login`;
  static REGISTER = `${ServerUrls.BASE_URL}users/register`;
  static PROFILE_PIC = `${ServerUrls.BASE_URL}users/profile-pic/`;
  static PERSONAL_INFO_DL = `${ServerUrls.BASE_URL}users/personal-info-dl/`;
  static PERSONAL_INFO_PIC = `${ServerUrls.BASE_URL}users/personal-info-pic/`;
  static SCAN_USERS = `${ServerUrls.BASE_URL}users/scan`;

  // Location
  static ADD_DESIRED_LOCATION = `${ServerUrls.BASE_URL}locations/desired-location/`;
  static DESIRED_LOCATIONS = `${ServerUrls.BASE_URL}locations/desired-locations/`;

  // WebSocket
  static SOCKET_URL = `${ServerUrls.BASE_URL}ws`;
}
