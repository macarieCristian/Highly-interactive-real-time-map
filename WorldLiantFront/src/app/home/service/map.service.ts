import {Injectable} from '@angular/core';
import {MarkerEventMessage} from '../../shared/model/web-socket-model/marker-event-message';
import {LocationCustom} from '../../shared/model/location-custom';
import {LocalStorageConstants} from '../../shared/constants/local-storage-constants';
import {AppUser} from '../../shared/model/app-user';
import {ChatMessage} from '../../shared/model/web-socket-model/chat-message';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ServerUrls} from '../../shared/constants/server-urls';
import {Constants} from '../../shared/constants/constants';
import {Observable} from 'rxjs';
import {StandardMessage} from '../../shared/model/web-socket-model/standard-message';
import {SearchOption} from '../../shared/model/util-model/search-option';
import {SearchResultPinData} from '../../shared/model/util-model/search-result-pin-data';

@Injectable()
export class MapService {

  constructor(private httpClient: HttpClient) {
  }

  static prepareBroadcastMarkerMessage(lat: string, lng: string, eventType: string, locationId: number): MarkerEventMessage {
    const message = new MarkerEventMessage();
    message.location = new LocationCustom();
    message.source = localStorage.getItem(LocalStorageConstants.USERNAME);
    message.eventType = eventType;
    message.location.id = locationId;
    message.location.latitude = `${lat}`;
    message.location.longitude = `${lng}`;
    return message;
  }

  static prepareChatMessage(source: string, destination: string, eventType: string, payload: string): ChatMessage {
    const message = new ChatMessage();
    message.source = source;
    message.destination = destination;
    message.message = payload;
    message.eventType = eventType;
    message.date = new Date();
    return message;
  }

  static prepareBroadcastStandardMessage(source: string, messageType: string, message: string): StandardMessage {
    const msg = new StandardMessage();
    msg.source = source;
    msg.standardMessageType = messageType;
    msg.message = message;
    return msg;
  }

  static getGlobalLayerById(map: any, leaflet_id: string): any {
    let result;
    map.eachLayer(function (layer) {
      if (layer._leaflet_id === leaflet_id) {
        result = layer;
      }
    });
    return result;
  }

  static addInListByUsernameDistinct(list: AppUser[], user: AppUser) {
    if (!list.find(u => u.username === user.username)) {
      list.push(user);
    }
  }

  static getUserPopup(picUrl: string, appUser: AppUser): string {
    return `
<div class="card" style="width: 14rem;">
  <img class="card-img-top" src=${picUrl} alt="Card image cap">
  <div class="card-body card-body-custom">
    <h5 class="card-title text-center card-title-pos">${appUser.lastName} ${appUser.firstName}</h5>
    <button class="custom-button" type="button">
      <span class=${1 === 1 ? 'disappear' : ''}>
        <i class="fa fa-user-plus"></i>
        Add contact
      </span>
      <span class=${1 !== 1 ? 'disappear' : ''}>
        <i class="fa fa-address-book-o"></i>
        Contact
      </span>
    </button>
    <hr>
  </div>
</div>
`;
  }

  static searchOptionSelected(options: SearchOption[]): SearchOption[] {
    return options.filter(option => option.value === true);
  }

  static formatCategories(options: SearchOption[]): string {
    return options.map(option => option.id).join(',');
  }

  static getNeededCategories(options: SearchOption[]): SearchResultPinData[] {
    const optionIds: string[] = options.map(option => option.id);
    return Constants.forsquareCategories.filter(cat => optionIds.includes(cat.id));
  }

  static getColorAndIcon(venue: any, categoriesData: SearchResultPinData[]): SearchResultPinData {
    const venueCatId = venue.categories[0].id;
    const res = new SearchResultPinData();
    res.iconName = 'search';
    res.pinColor = 'red';
    for (const data of categoriesData) {
      if (data.categories.includes(venueCatId)) {
        res.pinColor = data.pinColor;
        res.iconName = data.iconName;
        break;
      }
    }
    return res;
  }

  getVenuesInArea(lat: number, lng: number, rad: number, options: SearchOption[]): Observable<any> {
    const params = new HttpParams()
      .set(Constants.CLIENT_ID_PARAM, Constants.CLIENT_ID)
      .set(Constants.CLIENT_SECRET_PARAM, Constants.CLIENT_SECRET)
      .set(Constants.LAT_LNG_PARAM, `${lat},${lng}`)
      .set(Constants.RADIUS_PARAM, `${rad}`)
      .set(Constants.CATEGORY_ID_PARAM, `${MapService.formatCategories(options)}`)
      .set(Constants.INTENT_PARAM, Constants.INTENT)
      .set(Constants.VERSION_PARAM, Constants.VERSION);
    return this.httpClient.get(ServerUrls.FORSQUARE_VENUSE_IN_CIRCLE, {params: params});
  }
}
