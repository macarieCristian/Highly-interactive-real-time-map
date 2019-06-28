export class ServerUrls {
  static BASE_URL = 'http://localhost:8081/';

  // Users
  static LOGIN = `${ServerUrls.BASE_URL}authentication/login`;
  static LOGOUT = `${ServerUrls.BASE_URL}users/logout/`;
  static REGISTER = `${ServerUrls.BASE_URL}users/register`;
  static PROFILE_PIC = `${ServerUrls.BASE_URL}users/profile-pic/`;
  static PERSONAL_INFO_DL = `${ServerUrls.BASE_URL}users/personal-info-dl/`;
  static PERSONAL_INFO_PIC = `${ServerUrls.BASE_URL}users/personal-info-pic/`;
  static SCAN_USERS = `${ServerUrls.BASE_URL}users/scan`;

  // Location
  static ADD_DESIRED_LOCATION = `${ServerUrls.BASE_URL}locations/desired-location/`;
  static DESIRED_LOCATIONS = `${ServerUrls.BASE_URL}locations/desired-locations/`;
  static LOCATION_DETAILS = `${ServerUrls.BASE_URL}locations/details/`;
  static LOCATION_DETAILS_DESCRIPTION = `${ServerUrls.BASE_URL}locations/details/description`;
  static LOCATION_DETAILS_ATTACHMENTS = `${ServerUrls.BASE_URL}locations/details/attachments`;

  // Scan areas
  static SCAN_AREA = `${ServerUrls.BASE_URL}scan-areas/`;
  static SCAN_AREAS = `${ServerUrls.BASE_URL}users/scan-areas/`;

  // Attachments
  static ATTACHMENT_PICTURE = `${ServerUrls.BASE_URL}attachments/picture`;

  // WebSocket
  static SOCKET_URL = `${ServerUrls.BASE_URL}ws`;

  // Chat
  static CONVERSATION = `${ServerUrls.BASE_URL}chat/conversation`;
  static CONVERSATION_CHAT_ROOM = `${ServerUrls.BASE_URL}chat/conversation-chat-room`;

  // Events
  static EVENTS = `${ServerUrls.BASE_URL}events`;
  static EVENT = `${ServerUrls.BASE_URL}events/event`;
  static SCAN_EVENTS = `${ServerUrls.BASE_URL}events/scan`;

  // Forsquare
  static FORSQUARE_VENUES_IN_CIRCLE = 'https://api.foursquare.com/v2/venues/search';
  static FORSQUARE_VENUE_DETAILS = 'https://api.foursquare.com/v2/venues/';

}
