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
import {EventCustom} from '../../shared/model/event-custom';

declare let L;

@Injectable()
export class MapService {
  static BLUE_CUSTOM_MARKER = 'pin-custom-marker-blue';
  static BLUE_CUSTOM_MARKER_IMAGE = 'img-inside-custom-marker-blue';
  static PURPLE_CUSTOM_MARKER = 'pin-custom-marker-purple';
  static PURPLE_CUSTOM_MARKER_IMAGE = 'img-inside-custom-marker-purple';

  static PULSE_BLUE = 'pulse-blue';
  static PULSE_PURPLE = 'pulse-purple';

  static MARKER_ANIMATION_FADE_IN_DROP = 'fadeInDown';
  static MARKER_ANIMATION_FADE_IN = 'fadeIn';

  static POPUP_USER_BASE_CLASS = 'user-custom-popup-base';
  static POPUP_EVENT_BASE_CLASS = 'event-custom-popup-base';

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

  static addInListByIdDistinct(list: EventCustom[], event: EventCustom) {
    if (!list.find(e => e.id === event.id)) {
      list.push(event);
    }
  }

  static getUserPopup(picUrl: string, appUser: AppUser): any {
    return L.popup({className: MapService.POPUP_USER_BASE_CLASS})
      .setContent(`
<div class="card" style="width: 14rem;">
  <img class="card-img-top" src=${picUrl} alt="Card image cap">
  <div class="card-body card-body-custom">
    <h5 class="card-title text-center card-title-pos">${appUser.lastName} ${appUser.firstName}</h5>
    <button class="custom-button" type="button">
      <span class="${1 === 1 ? 'disappear' : ''}">
        <i class="fa fa-user-plus"></i>
        Add contact
      </span>
      <span class="${1 !== 1 ? 'disappear' : ''}">
        <i class="fa fa-address-book-o"></i>
        Contact
      </span>
    </button>
    <hr>
  </div>
</div>
`);
  }

  static getEventPopup(picUrl: string, event: EventCustom, goingButtonFunction?: any): any {
    const wrapper = L.DomUtil.create('div', 'card');
    const img = L.DomUtil.create('img', 'card-img-top', wrapper);
    img.setAttribute('src', picUrl);
    const body = L.DomUtil.create('div', 'card-body card-body-custom', wrapper);
    const title = L.DomUtil.create('h5', 'card-title text-center card-title-pos', body);
    title.innerHTML = event.name;
    const goingButton = L.DomUtil.create('button', 'custom-button', body);
    goingButton.setAttribute('type', 'button');
    const innerButton = L.DomUtil.create('span', '', goingButton);
    L.DomUtil.create('i', 'fa fa-user-plus', innerButton);
    const text = L.DomUtil.create('span', '', innerButton);
    text.innerHTML = 'Going';
    L.DomUtil.create('hr', '', body);
    goingButton.onclick = function () {
      goingButtonFunction();
    };
    return L.popup({className: MapService.POPUP_EVENT_BASE_CLASS})
      .setContent(wrapper);
  }

  static getCustomMarkerIcon(picUrl: string, markerClassName: string, imageClassName: string, markerAnimation: string, pulseClassName: string): any {
    return L.divIcon({
      popupAnchor: [0, -40],
      iconSize: null,
      html: `<div class="${markerClassName} animated ${markerAnimation}">
               <img class="${imageClassName}" src="${picUrl}">
             </div>
             <div class="${pulseClassName}"></div>`
    });
  }

  static getDrawLayerOptions(personalMarkerIcon: any, featureGroup: any): any {
    return {
      position: 'topleft',
      draw: {
        polyline: false,
        polygon: false,
        circlemarker: false,
        circle: {
          shapeOptions: {
            stroke: true,
            color: 'black',
            weight: 3,
            opacity: 0.5,
            fill: true,
            fillColor: 'red',
            fillOpacity: 0.4,
            clickable: true,
          },
          showRadius: true,
          metric: true, // Whether to use the metric measurement system or imperial
          feet: true, // When not metric, use feet instead of yards for display
          nautic: false // When not metric, not feet use nautic mile for display
        },
        rectangle: false,
        marker: {
          icon: personalMarkerIcon
        }
      },
      edit: {
        featureGroup: featureGroup, // REQUIRED!!
        remove: true
      }
    };
  }

  static getScanAreaCircleOptions(radius: string): any {
    return {
      radius: radius,
      color: 'black',
      weight: 3,
      opacity: 0.5,
      fill: true,
      fillColor: 'red',
      fillOpacity: 0.4,
      clickable: true,
    };
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
    res.iconName = 'star';
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
      .set(Constants.LIMIT_PARAM, Constants.RESULT_LIMIT)
      .set(Constants.CATEGORY_ID_PARAM, `${MapService.formatCategories(options)}`)
      .set(Constants.INTENT_PARAM, Constants.INTENT)
      .set(Constants.VERSION_PARAM, Constants.VERSION);
    return this.httpClient.get(ServerUrls.FORSQUARE_VENUES_IN_CIRCLE, {params: params});
  }

  getVenueDetails(venueId: string): Observable<any> {
    const params = new HttpParams()
      .set(Constants.CLIENT_ID_PARAM, Constants.CLIENT_ID)
      .set(Constants.CLIENT_SECRET_PARAM, Constants.CLIENT_SECRET)
      .set(Constants.VERSION_PARAM, Constants.VERSION);
    return this.httpClient.get<any>(`${ServerUrls.FORSQUARE_VENUE_DETAILS}${venueId}`, {params: params});
  }
}
