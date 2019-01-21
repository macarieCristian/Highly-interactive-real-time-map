export class ServerUrls {
  static BASE_URL = 'http://localhost:8080/';

  // Users
  static LOGIN = `${ServerUrls.BASE_URL}authentication/login`;
  static REGISTER = `${ServerUrls.BASE_URL}users/register`;
  static PROFILE_PIC = `${ServerUrls.BASE_URL}users/profile-pic/`;

  // WebSocket
  static SOCKET_URL = `${ServerUrls.BASE_URL}ws`;
}
