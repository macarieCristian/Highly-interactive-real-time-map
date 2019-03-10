import {Component, OnDestroy, OnInit} from '@angular/core';
import {ServerUrls} from '../shared/constants/server-urls';
import {UtilityService} from '../shared/service/utility.service';
import {UserService} from '../shared/service/user/user.service';
import {AppUser} from '../shared/model/app-user';
import {LocalStorageConstants} from '../shared/constants/local-storage-constants';
import {Constants} from '../shared/constants/constants';
import {Router} from '@angular/router';
import {ClientUrls} from '../shared/constants/client-urls';
import {TransportService} from '../shared/service/transport.service';
import {WebSocketCommand} from '../shared/constants/web-socket-command';
import {LocationCustom} from '../shared/model/location-custom';
import {ToastrUtilService} from '../shared/service/toastr-util.service';
import {MarkerEventMessage} from '../shared/model/web-socket-model/marker-event-message';
import {WebSocketService} from '../shared/service/web-socket.service';
import {EventType} from '../shared/model/web-socket-model/event-type';
import {HaversineDistanceUtil} from '../shared/util/haversine-distance-util';
import {MapService} from './service/map.service';
import {UtilExceptionMessage} from '../shared/constants/util-exception-message';
import {AttachmentCustom} from '../shared/model/attachment-custom';
import {ChatMessage} from '../shared/model/web-socket-model/chat-message';
import {UserChat} from '../shared/model/util-model/user-chat';
import {ChatService} from '../shared/service/chat.service';
import {StandardMessageType} from '../shared/model/web-socket-model/standard-message-type';
import {StandardMessage} from '../shared/model/web-socket-model/standard-message';
import {UserStatusType} from '../shared/model/user-status-type';
import {SearchOption} from '../shared/model/util-model/search-option';
import {SearchResultPinData} from '../shared/model/util-model/search-result-pin-data';

declare let L;
export let mapGlobal;
export let editableLayers;
export let profilePicUrl;
export let thisObject;
export let personalMarkerImage;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Subscriptions
  private markerEventsSubscription;
  private chatEventsSubscription;
  private broadcastMessagesSubscription;

  profilePictureUrl: string;
  appUser: AppUser;
  homeCoordinates: number[];


  cats = [];

  // key: leaflet_id value: id
  locationLeafletIdIdMap: Map<string, number>;
  scanAreaMarkers: Set<string>;
  venueMarkers: Set<string>;
  scanArea: any = null;
  scanAreaUsers: AppUser[];
  contactUsers: AppUser[];

  sideOptions = false;
  searchOptions: SearchOption[];
  sideChat = false;
  openChatList: AppUser[];
  chatListMessagesMap: Map<string, UserChat>;
  notes = [
    {
      name: 'Andrei Numefoartelung',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Bogdan Florina',
      updated: new Date('1/28/16'),
    }
  ];

  constructor(private utilityService: UtilityService,
              private userService: UserService,
              private router: Router,
              private mapService: MapService,
              private chatService: ChatService,
              private toastrUtilService: ToastrUtilService,
              private webSocketService: WebSocketService,
              private transportService: TransportService) {
  }

  ngOnInit() {
    // Forsquare search option
    this.searchOptions = [
      {
        name: 'Night Life',
        icon: 'fa fa-glass',
        value: false,
        id: Constants.NIGHT_LIFE_CATEGORY_ID,
      },
      {
        name: 'Eat&Drink',
        icon: 'fa fa-cutlery',
        value: false,
        id: Constants.FOOD_CATEGORY_ID,
      },
      {
        name: 'Universities',
        icon: 'fa fa-university',
        value: false,
        id: Constants.UNIVERSITY_CATEGORY_ID,
      },
      {
        name: 'Sports',
        icon: 'fa fa-futbol-o',
        value: false,
        id: Constants.SPORTS_CATEGORY_ID,
      },
      {
        name: 'Public events',
        icon: 'fa fa-calendar',
        value: false,
        id: Constants.PUBLIC_EVENTS_CATEGORY_ID,
      },
      {
        name: 'Travel&Transport',
        icon: 'fa fa-suitcase',
        value: false,
        id: Constants.TRAVEL_AND_TRANSPORT_CATEGORY_ID,
      },
    ];
    this.locationLeafletIdIdMap = new Map<string, number>();
    this.scanAreaMarkers = new Set<string>();
    this.venueMarkers = new Set<string>();
    this.scanAreaUsers = [];
    this.openChatList = [];
    this.chatListMessagesMap = new Map<string, UserChat>();
    thisObject = this;
    this.getProfileInfo();
  }

  ngOnDestroy() {
    this.broadcastMessagesSubscription.unsubscribe();
    this.chatEventsSubscription.unsubscribe();
    this.markerEventsSubscription.unsubscribe();
  }

  getProfileInfo() {
    const username = localStorage.getItem(LocalStorageConstants.USERNAME);
    if (username) {
      this.userService.getPersonalInfoWithLocations(username)
        .subscribe(result => {
          this.appUser = result;
          this.homeCoordinates = [+this.appUser.homeLocation.latitude, +this.appUser.homeLocation.longitude];
          this.getProfilePicture();
        });
    }
  }

  private getProfilePicture() {
    const url = `${ServerUrls.PROFILE_PIC}${localStorage.getItem(LocalStorageConstants.USERNAME)}`;
    this.userService.getImage(url)
      .subscribe(img => {
        const reader = new FileReader();
        reader.onload = e => {
          this.profilePictureUrl = reader.result.toString();
          profilePicUrl = this.profilePictureUrl;
          this.initMap();
        };
        reader.readAsDataURL(img);
      });
  }

  initMap() {
    mapGlobal = L.map('mapid').setView(this.homeCoordinates, 13);
    L.tileLayer(Constants.LEAFLET_URL, Constants.LEAFLET_MAP_PROPERTIES).addTo(mapGlobal);
    this.addFAMarker(this.homeCoordinates, 'fa-home', 'red', '<b>Hello!</b> Here is your home!');

    editableLayers = new L.FeatureGroup();
    mapGlobal.addLayer(editableLayers);

    personalMarkerImage = L.divIcon({
      popupAnchor: [0, -40],
      iconSize: null,
      html: `<div class="pin2 animated fadeIn"><img class="img-inside" src="${profilePicUrl}"></div><div class="pulse"></div>`
    });

    this.addSelfDesiredLocationMarkers();
    const options = {
      position: 'topleft',
      draw: {
        polyline: false,
        polygon: false,
        circlemarker: false,
        circle: {
          shapeOptions: {
            stroke: true,
            color: 'black',
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: 'red', // same as color by default
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
          icon: personalMarkerImage
        }
      },
      edit: {
        featureGroup: editableLayers, // REQUIRED!!
        remove: true
      }
    };
    const drawControl = new L.Control.Draw(options);
    mapGlobal.addControl(drawControl);

    const customControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function (map) {
        const wrapper = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-wrapper');
        const openChatButton = L.DomUtil.create('div', 'leaflet-control-custom', wrapper);
        openChatButton.onclick = function () {
          thisObject.sideChat = !thisObject.sideChat;
        };
        L.DomUtil.create('i', 'fa fa-comments-o open-chat-icon', openChatButton);
        const openSearchOptionsButton = L.DomUtil.create('div', 'leaflet-control-custom', wrapper);
        openSearchOptionsButton.onclick = function () {
          thisObject.sideOptions = !thisObject.sideOptions;
        };
        L.DomUtil.create('i', 'fa fa-search search-option-icon', openSearchOptionsButton);
        return wrapper;
      }
    });
    mapGlobal.addControl(new customControl());

    mapGlobal.on(L.Draw.Event.CREATED, this.editableLayersCreate);
    mapGlobal.on(L.Draw.Event.EDITED, this.editableLayersUpdate);
    mapGlobal.on(L.Draw.Event.DELETED, this.editableLayersDelete);

    this.setupMarkerEventsListener();
    this.setupChatEventsListener();
    this.setupBroadcastMessagesListener();
  }

  // Create layers callback
  private editableLayersCreate(e: any) {
    const type = e.layerType;
    const layer = e.layer;

    switch (type) {
      case 'marker': {
        thisObject.saveDesiredLocation(layer);
        break;
      }
      case 'circle': {
        thisObject.removeCircles();
        thisObject.cleanScanAreaMarkers();
        const addedLayer = thisObject.addScanCircle(layer);
        thisObject.scanArea = addedLayer;
        const animatedLayer = L.circle(addedLayer.getLatLng(),
          {radius: addedLayer.getRadius(), className: 'animated fadeIn infinite'})
          .addTo(mapGlobal);
        thisObject.processScan(addedLayer, animatedLayer);
        break;
      }
      default: {
        break;
      }
    }
  }

  // Update layers callback
  private editableLayersUpdate(e: any) {
    const updatedLocations = [];
    const updatedLocationsMessages = [];
    const layers = e.layers;
    layers.eachLayer(function (l) {
      if (l instanceof L.Marker) {
        const newLocation = new LocationCustom();
        newLocation.id = thisObject.locationLeafletIdIdMap.get(editableLayers.getLayerId(l));
        const latlng = l.getLatLng();
        newLocation.longitude = latlng.lng;
        newLocation.latitude = latlng.lat;
        updatedLocations.push(newLocation);
        const message = MapService.prepareBroadcastMarkerMessage(
          newLocation.latitude, newLocation.longitude, EventType.MARKER_UPDATED, newLocation.id);
        updatedLocationsMessages.push(message);
      } else if (l instanceof L.Circle) {
        thisObject.scanArea = l;
        thisObject.cleanScanAreaMarkers();
        const animatedLayer = L.circle(l.getLatLng(),
          {radius: l.getRadius(), className: 'animated fadeIn infinite'})
          .addTo(mapGlobal);
        thisObject.processScan(l, animatedLayer);
      }
    });
    if (updatedLocations.length > 0) {
      thisObject.userService.updateDesiredLocations(thisObject.appUser.id, updatedLocations)
        .subscribe(res => {
          thisObject.webSocketService.sendBroadcastMarkerEvents(updatedLocationsMessages);
          thisObject.toastrUtilService
            .displaySuccessToastr('Update complete!', 'Your desired locations were updated successfully.');
        });
    }
  }

  // Delete layers callback
  private editableLayersDelete(e: any) {
    const deleteLayersIds = [];
    const deletedLocationsMessages = [];
    const layers = e.layers;
    layers.eachLayer(function (l) {
      if (l instanceof L.Marker) {
        const id = thisObject.locationLeafletIdIdMap.get(editableLayers.getLayerId(l));
        deleteLayersIds.push(id);
        const message = MapService.prepareBroadcastMarkerMessage(null, null, EventType.MARKER_DELETED, id);
        deletedLocationsMessages.push(message);
      } else if (l instanceof L.Circle) {
        thisObject.scanArea = null;
        thisObject.cleanScanAreaMarkers();
      }
    });
    if (deleteLayersIds.length > 0) {
      thisObject.userService.deleteDesiredLocations(thisObject.appUser.id, deleteLayersIds)
        .subscribe(res => {
          thisObject.webSocketService.sendBroadcastMarkerEvents(deletedLocationsMessages);
          thisObject.toastrUtilService
            .displaySuccessToastr('Delete complete!', 'Your desired locations were deleted successfully.');
        });
    }
  }


  openChat(user: AppUser) {
    if (!this.openChatList.find(u => u.username === user.username)) {
      this.openChatList.push(user);
      this.chatService.getConversation(localStorage.getItem(LocalStorageConstants.USERNAME), user.username)
        .subscribe(messages => {
          this.chatListMessagesMap.set(user.username, new UserChat(messages));
        });
    }
  }

  closeChat(user: AppUser) {
    this.openChatList = this.openChatList.filter(u => u.username !== user.username);
    this.chatListMessagesMap.delete(user.username);
  }

  // Save newly added location
  private saveDesiredLocation(layer: any) {
    layer.bindPopup(MapService.getUserPopup(profilePicUrl, this.appUser));
    const wrapper = layer.getLatLng();
    const location = new LocationCustom();
    location.longitude = wrapper.lng;
    location.latitude = wrapper.lat;
    this.userService.saveDesiredLocation(this.appUser.id, location)
      .subscribe(res => {
        editableLayers.addLayer(layer);
        this.locationLeafletIdIdMap.set(editableLayers.getLayerId(layer), res);
        location.id = res;
        this.appUser.desiredLocations.push(location);
        const message = MapService.prepareBroadcastMarkerMessage(location.latitude,
          location.longitude, EventType.MARKER_CREATED, location.id);
        this.webSocketService.sendBroadcastMarkerEvents([message]);
      });
  }


  // UTIL functions
  // Populate map with saved markers
  private addSelfDesiredLocationMarkers() {
    this.appUser.desiredLocations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude],
        {
          icon: personalMarkerImage
        }).addTo(editableLayers);
      marker.bindPopup(MapService.getUserPopup(profilePicUrl, this.appUser));
      this.locationLeafletIdIdMap.set(editableLayers.getLayerId(marker), location.id);
    });
  }

  private removeCircles() {
    editableLayers.eachLayer(function (layer) {
      if (layer instanceof L.Circle) {
        editableLayers.removeLayer(layer);
      }
    });
  }

  private cleanScanAreaMarkers() {
    mapGlobal.eachLayer(function (layer) {
      if (layer instanceof L.Marker &&
        (thisObject.scanAreaMarkers.has(layer._leaflet_id) || thisObject.venueMarkers.has(layer._leaflet_id))) {
        thisObject.removeMarkerFromGlobalMap(layer);
      }
    });
    thisObject.scanAreaUsers = [];
  }

  private removeMarkerFromGlobalMap(layer: any) {
    mapGlobal.removeLayer(layer);
    thisObject.scanAreaMarkers.delete(layer._leaflet_id);
    thisObject.venueMarkers.delete(layer._leaflet_id);
    thisObject.locationLeafletIdIdMap.delete(layer._leaflet_id);
  }

  private addScanCircle(layer: any): any {
    if (layer.getRadius() > Constants.MAX_SCAN_AREA_RADIUS) {
      thisObject.toastrUtilService
        .displayWarningToastr('Ooops!', UtilExceptionMessage.RADIUS_ADJUSTED);
      layer = layer.setRadius(Constants.MAX_SCAN_AREA_RADIUS);
    }
    editableLayers.addLayer(layer);
    return layer;
  }

  private processScan(layer: any, animatedLayer: any) {
    const latlng = layer.getLatLng();
    thisObject.userService.getUsersScan(latlng.lat, latlng.lng, layer.getRadius())
      .subscribe(res => {
        mapGlobal.removeLayer(animatedLayer);
        res.forEach(user => {
          thisObject.addUserMarkersForScanResult(user);
          thisObject.addInListByUsernameDistinct(thisObject.scanAreaUsers, user);
        });
      });
    const selectedOptions = MapService.searchOptionSelected(thisObject.searchOptions);
    if (selectedOptions.length > 0) {
      thisObject.mapService.getVenuesInArea(latlng.lat, latlng.lng, layer.getRadius(), selectedOptions)
        .subscribe(res => {
          const venues = res.response.venues;
          const categories = MapService.getNeededCategories(selectedOptions);
          venues.forEach(venue => {
            const location = venue.location;
            const popupTemplate = `Name: ${venue.name}<br>Address: ${location.formattedAddress[0]}<br>`;
            const colorAndIcon: SearchResultPinData = MapService.getColorAndIcon(venue, categories);
            const marker = thisObject
              .addFAMarker([+location.lat, +location.lng], colorAndIcon.iconName, colorAndIcon.pinColor, popupTemplate);
            thisObject.venueMarkers.add(marker._leaflet_id);
          });
        });
    }
  }

  private addUserMarkersForScanResult(user: AppUser) {
    if (user && user.username && user.desiredLocations && user.desiredLocations.length > 0) {
      const pictureUrl = thisObject.setUpPicture(user.profilePicture);
      const pictureMarker = L.divIcon({
        popupAnchor: [0, -40],
        iconSize: null,
        html: `<div class="pin2 animated fadeInDown"><img class="img-inside" src="${pictureUrl}"></div><div class="pulse"></div>`
      });
      user.desiredLocations.forEach(location => {
        const marker = L.marker([location.latitude, location.longitude], {icon: pictureMarker}).addTo(mapGlobal);
        marker.bindPopup(MapService.getUserPopup(pictureUrl, user));
        thisObject.scanAreaMarkers.add(marker._leaflet_id);
        thisObject.locationLeafletIdIdMap.set(marker._leaflet_id, location.id);
      });
    }
  }

  addFAMarker(latlng: number[], iconName: string, color: string, popupTemplate: string): any {
    const marker =
      L.marker(latlng,
        {
          icon: L.AwesomeMarkers.icon({
            icon: iconName,
            prefix: 'fa',
            markerColor: color,
          })
        }).addTo(mapGlobal);
    marker.bindPopup(popupTemplate);
    return marker;
  }

  goToCoordinates(latlng: number[], zoom: number) {
    mapGlobal.setView(latlng, zoom);
  }

  private addInListByUsernameDistinct(list: AppUser[], user: AppUser) {
    if (!list.find(u => u.username === user.username)) {
      list.push(user);
    }
  }

  logout() {
    this.userService.logout(localStorage.getItem(LocalStorageConstants.USERNAME))
      .subscribe(res => {
        this.broadcastMessagesSubscription.unsubscribe();
        this.chatEventsSubscription.unsubscribe();
        this.markerEventsSubscription.unsubscribe();
        this.transportService.webSocketCommandSink(WebSocketCommand.DISCONNECT);
        localStorage.clear();
        this.router.navigateByUrl(ClientUrls.LOGIN_PAGE);
      });
  }

  private setupBroadcastMessagesListener() {
    this.broadcastMessagesSubscription = this.transportService.broadcastMessagesStream()
      .subscribe(message => {
        switch (message.standardMessageType) {
          case (StandardMessageType.LOGGED_IN): {
            this.changeUserStatus(message, UserStatusType.ONLINE);
            break;
          }
          case (StandardMessageType.LOGGED_OUT): {
            this.changeUserStatus(message, UserStatusType.OFFLINE);
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  // logged in user can't be in this list
  private changeUserStatus(message: StandardMessage, status: string) {
    for (const user of this.scanAreaUsers) {
      if (user.username === message.source) {
        user.statusType = status;
        break;
      }
    }
  }

  private setupChatEventsListener() {
    this.chatEventsSubscription = this.transportService.chatEventsStream()
      .subscribe(message => {
        switch (message.eventType) {
          case (EventType.CHAT_MESSAGE): {
            this.handleChatMessageReceivedEvent(message);
            break;
          }
          case (EventType.TYPING): {
            this.handleReceivedTypingEvent(message);
            break;
          }
          case (EventType.TYPING_STOP): {
            this.handleReceivedTypingStopEvent(message);
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  private handleChatMessageReceivedEvent(message: ChatMessage) {
    if (this.chatListMessagesMap.has(message.source)) {
      // add notif
      this.chatListMessagesMap.get(message.source).messages.push(message);
    }
  }

  private handleReceivedTypingEvent(message: ChatMessage) {
    if (this.openChatList.find(user => user.username === message.source)) {
      this.chatListMessagesMap.get(message.source).typing = true;
    }
  }

  private handleReceivedTypingStopEvent(message: ChatMessage) {
    if (this.openChatList.find(user => user.username === message.source)) {
      this.chatListMessagesMap.get(message.source).typing = false;
    }
  }

  private setupMarkerEventsListener() {
    this.markerEventsSubscription = this.transportService.markerEventsStream()
      .subscribe(message => {
        switch (message.eventType) {
          case (EventType.MARKER_CREATED): {
            this.handleMarkerCreatedEvent(message);
            break;
          }
          case (EventType.MARKER_UPDATED): {
            this.handleMarkerUpdatedEvent(message);
            break;
          }
          case (EventType.MARKER_DELETED): {
            this.handleMarkerDeletedEvent(message);
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  // Aux
  setUpPicture(attachement: AttachmentCustom): string {
    return `data:${attachement.type};base64,${attachement.content}`;
  }

  private addUserMarkerAtPointInsideScanArea(point: LocationCustom, user: AppUser) {
    const pictureUrl = thisObject.setUpPicture(user.profilePicture);
    const pictureMarker = L.divIcon({
      popupAnchor: [0, -40],
      iconSize: null,
      html: `<div class="pin2 animated fadeInDown"><img class="img-inside" src="${pictureUrl}"></div><div class="pulse"></div>`
    });
    const marker = L.marker([point.latitude, point.longitude], {icon: pictureMarker}).addTo(mapGlobal);
    marker.bindPopup(MapService.getUserPopup(pictureUrl, user));
    thisObject.scanAreaMarkers.add(marker._leaflet_id);
    thisObject.locationLeafletIdIdMap.set(marker._leaflet_id, point.id);
  }

  private getLeafletIdByRealId(id: number): string {
    for (const key of Array.from(this.locationLeafletIdIdMap.keys())) {
      const value = this.locationLeafletIdIdMap.get(key);
      if (id === value) {
        return key;
      }
    }
    return undefined;
  }

  private handleMarkerCreatedEvent(message: MarkerEventMessage) {
    if (this.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const center = this.scanArea.getLatLng();
      const rad = this.scanArea.getRadius();
      const point = message.location;
      if (HaversineDistanceUtil.pointInsideCircle(+point.latitude, +point.longitude, +center.lat, +center.lng, rad)) {
        this.userService.getPersonalInfoWithPic(message.source)
          .subscribe(user => {
            if (user && user.profilePicture) {
              thisObject.addUserMarkerAtPointInsideScanArea(point, user);
              thisObject.addInListByUsernameDistinct(thisObject.scanAreaUsers, user);
            }
          });
      }
    }
  }

  private handleMarkerUpdatedEvent(message: MarkerEventMessage) {
    if (this.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const center = this.scanArea.getLatLng();
      const rad = this.scanArea.getRadius();
      const point = message.location;
      const existingMarkerInScanAreaId = this.getLeafletIdByRealId(point.id); // marker existed in scan area before update or not
      // if new location in scan area
      if (HaversineDistanceUtil.pointInsideCircle(+point.latitude, +point.longitude, +center.lat, +center.lng, rad)) {
        if (existingMarkerInScanAreaId) {
          const layer = MapService.getGlobalLayerById(mapGlobal, existingMarkerInScanAreaId);
          const icon = layer.options.icon;
          layer.setLatLng(L.latLng(point.latitude, point.longitude));
          layer.setIcon(icon);
        } else {
          this.userService.getPersonalInfoWithPic(message.source)
            .subscribe(user => {
              if (user && user.profilePicture) {
                thisObject.addUserMarkerAtPointInsideScanArea(point, user);
                thisObject.addInListByUsernameDistinct(thisObject.scanAreaUsers, user);
              }
            });
        }
      } else {
        if (existingMarkerInScanAreaId) {
          const layer = MapService.getGlobalLayerById(mapGlobal, existingMarkerInScanAreaId);
          this.removeMarkerFromGlobalMap(layer);
        }
      }
    }
  }

  private handleMarkerDeletedEvent(message: MarkerEventMessage) {
    if (this.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const existingMarkerInScanAreaId = this.getLeafletIdByRealId(message.location.id);
      if (existingMarkerInScanAreaId) {
        const layer = MapService.getGlobalLayerById(mapGlobal, existingMarkerInScanAreaId);
        this.removeMarkerFromGlobalMap(layer);
      }
    }
  }

  sendChatMessage(destination: string, eventType: string, message: string) {
    const msg = MapService.prepareChatMessage(localStorage.getItem(LocalStorageConstants.USERNAME), destination, eventType, message);
    this.webSocketService.sendPrivateMessage(msg);
    this.chatListMessagesMap.get(destination).messages.push(msg);
  }

  onKeyUpEventHandler(destination: string, typing: string) {
    const lastLen = this.chatListMessagesMap.get(destination).lastMsgLength;
    const actualLen = typing.length;
    const msg = MapService.prepareChatMessage(localStorage.getItem(LocalStorageConstants.USERNAME), destination, EventType.TYPING, '');
    if (actualLen > 0 && lastLen === 0) {
      console.log('send typing');
      this.webSocketService.sendPrivateMessage(msg);
      this.chatListMessagesMap.get(destination).lastMsgLength = actualLen;
    } else if (actualLen === 0 && lastLen > 0) {
      console.log('stop');
      msg.eventType = EventType.TYPING_STOP;
      this.webSocketService.sendPrivateMessage(msg);
      this.chatListMessagesMap.get(destination).lastMsgLength = actualLen;
    }
  }
}
