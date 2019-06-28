import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UtilityService} from '../shared/service/utility.service';
import {UserService} from '../shared/service/user.service';
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
import {EventType} from '../shared/model/enums/event-type';
import {HaversineDistanceUtil} from '../shared/util/haversine-distance-util';
import {MapService} from './service/map.service';
import {UtilExceptionMessage} from '../shared/constants/util-exception-message';
import {AttachmentCustom} from '../shared/model/attachment-custom';
import {ChatService} from '../shared/service/chat.service';
import {SearchResultPinData} from '../shared/model/util-model/search-result-pin-data';
import {MapRepository} from '../shared/repository/map-repository';
import {ScanAreaRepository} from '../shared/repository/scan-area-repository';
import {Scan} from '../shared/model/scan';
import {EventCustomProfilePic} from '../shared/model/util-model/event-custom-profile-pic';
import {Observable} from 'rxjs';
import {CustomMarkerType} from '../shared/model/enums/custom-marker-type';
import {CustomMarkerDetails} from '../shared/model/util-model/custom-marker-details';
import {EventService} from '../shared/service/event.service';
import {EventCustom} from '../shared/model/event-custom';

declare let L;
export let mapGlobal;
export let editableLayers;
export let thisObject;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('chatComp') chatComp;
  @ViewChild('scanAreaComp') scanAreaComp;
  @ViewChild('addEventComp') addEventComp;

  private markerEventsSubscription;

  profilePictureUrl: string;
  personalMarkerIcon: any;

  appUser: AppUser;
  homeCoordinates: number[];

  sideOptions = false;

  constructor(private utilityService: UtilityService,
              private userService: UserService,
              private router: Router,
              private mapService: MapService,
              private chatService: ChatService,
              private eventService: EventService,
              private toastrUtilService: ToastrUtilService,
              private webSocketService: WebSocketService,
              private transportService: TransportService,
              private sac: ScanAreaRepository,
              private mapRepo: MapRepository) {
  }

  ngOnInit() {
    thisObject = this;
    this.getProfileInfo().subscribe(() => {
      this.initMapGlobal();
      this.getProfilePicture().subscribe(() => {
        this.initEditableAndDrawLayer();
        this.initControls();
        this.initMapGlobalEventHandlers();
        this.setupMarkerEventsListener();
        this.addSelfDesiredLocationMarkers();
        this.addSelfEventMarkers();
      });
    });
  }

  ngOnDestroy() {
    this.markerEventsSubscription.unsubscribe();
  }

  // !Init Functions start!
  private getProfileInfo(): Observable<void> {
    return Observable.create(observer => {
      this.userService.getPersonalInfoWithLocations(localStorage.getItem(LocalStorageConstants.USERNAME))
        .subscribe(result => {
          this.appUser = result;
          this.chatComp.appUser = result;
          this.homeCoordinates = [+this.appUser.homeLocation.latitude, +this.appUser.homeLocation.longitude];
          localStorage.setItem(LocalStorageConstants.ID, `${result.id}`);
          observer.next();
        });
    });
  }

  private getProfilePicture(): Observable<void> {
    return Observable.create(observer => {
      this.userService.loadImage(localStorage.getItem(LocalStorageConstants.USERNAME))
        .subscribe(img => {
          const reader = new FileReader();
          reader.onload = e => {
            this.profilePictureUrl = reader.result.toString();
            observer.next();
          };
          reader.readAsDataURL(img);
        });
    });
  }

  private initMapGlobal() {
    mapGlobal = L.map('mapid').setView(this.homeCoordinates, 13);
    mapGlobal.doubleClickZoom.disable();
    L.tileLayer(Constants.LEAFLET_URL, Constants.LEAFLET_MAP_PROPERTIES).addTo(mapGlobal);
    this.addFAMarker(this.homeCoordinates, 'fa-home', 'red', {}, '<b>Hello!</b> Here is your home!');
  }

  private initEditableAndDrawLayer() {
    editableLayers = new L.FeatureGroup();
    mapGlobal.addLayer(editableLayers);
  }

  private initControls() {
    this.personalMarkerIcon = MapService.getCustomMarkerIcon(
      this.profilePictureUrl,
      MapService.BLUE_CUSTOM_MARKER,
      MapService.BLUE_CUSTOM_MARKER_IMAGE,
      MapService.MARKER_ANIMATION_FADE_IN,
      MapService.PULSE_BLUE
    );
    const options = MapService.getDrawLayerOptions(this.personalMarkerIcon, editableLayers);
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
          thisObject.chatComp.sideChat = !thisObject.chatComp.sideChat;
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
  }

  private initMapGlobalEventHandlers() {
    mapGlobal.on(L.Draw.Event.CREATED, this.editableLayersCreate);
    mapGlobal.on(L.Draw.Event.EDITED, this.editableLayersUpdate);
    mapGlobal.on(L.Draw.Event.DELETED, this.editableLayersDelete);
  }

  // !Init Functions end!

  processSavedScan(scan: Scan) {
    mapGlobal.setView([+scan.latitude, +scan.longitude], 13);
    if (scan.scanOptions) {
      this.sac.setSearchOptions(scan.scanOptions);
      this.sideOptions = true;
    } else {
      this.sac.clearSearchOptionValues();
    }
    setTimeout(() => {
      const scanArea = L.circle({lat: scan.latitude, lng: scan.longitude},
        MapService.getScanAreaCircleOptions(scan.radius))
        .addTo(editableLayers);
      this.editableLayersCreate({layerType: 'circle', layer: scanArea});
    }, 500);
  }

  addEventToMap(eventWrapper: EventCustomProfilePic) {
    const pictureMarker = MapService.getCustomMarkerIcon(
      eventWrapper.profilePicture.source,
      MapService.PURPLE_CUSTOM_MARKER,
      MapService.PURPLE_CUSTOM_MARKER_IMAGE,
      MapService.MARKER_ANIMATION_FADE_IN_DROP,
      MapService.PULSE_PURPLE
    );
    const location = eventWrapper.event.location;
    const marker = L.marker([location.latitude, location.longitude], {icon: pictureMarker}).addTo(editableLayers);
    marker.bindPopup(MapService.getEventPopup(eventWrapper.profilePicture.source, eventWrapper.event),
      {className: MapService.POPUP_EVENT_BASE_CLASS});
    const markerDetails = new CustomMarkerDetails(location.id, CustomMarkerType.EVENT_MARKER);
    markerDetails.idEvent = eventWrapper.event.id;
    this.mapRepo.leafletToRealId.set(marker._leaflet_id, markerDetails);
    const message = MapService.prepareBroadcastMarkerMessage(location.latitude,
      location.longitude, EventType.MARKER_EVENT_CREATED, location.id);
    message.idEvent = eventWrapper.event.id;
    this.webSocketService.sendBroadcastMarkerEvents([message]);
    const profilePic = new AttachmentCustom();
    profilePic.photoSource = eventWrapper.profilePicture.source;
    eventWrapper.event.profilePicture = profilePic;
    this.chatComp.addedEvents.push(eventWrapper.event);
  }

  // !MapGlobal event handlers start!
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
        thisObject.sac.scanArea = addedLayer;
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
        const markerDetails = thisObject.mapRepo.leafletToRealId.get(editableLayers.getLayerId(l));
        const newLocation = new LocationCustom();
        newLocation.id = markerDetails.id;
        const latlng = l.getLatLng();
        newLocation.longitude = latlng.lng;
        newLocation.latitude = latlng.lat;
        updatedLocations.push(newLocation);
        const message = MapService.prepareBroadcastMarkerMessage(
          newLocation.latitude, newLocation.longitude, EventType.MARKER_USER_UPDATED, newLocation.id);
        if (markerDetails.type === CustomMarkerType.EVENT_MARKER) {
          message.eventType = EventType.MARKER_EVENT_UPDATED;
          message.idEvent = markerDetails.idEvent;
        }
        updatedLocationsMessages.push(message);
      } else if (l instanceof L.Circle) {
        const addedLayer = thisObject.addScanCircle(l);
        thisObject.sac.scanArea = addedLayer;
        thisObject.cleanScanAreaMarkers();
        const animatedLayer = L.circle(addedLayer.getLatLng(),
          {radius: addedLayer.getRadius(), className: 'animated fadeIn infinite'})
          .addTo(mapGlobal);
        thisObject.processScan(addedLayer, animatedLayer);
      }
    });
    if (updatedLocations.length > 0) {
      thisObject.userService.updateDesiredLocations(thisObject.appUser.id, updatedLocations)
        .subscribe(res => {
          thisObject.webSocketService.sendBroadcastMarkerEvents(updatedLocationsMessages);
          thisObject.toastrUtilService
            .displaySuccessToastr('Update complete!', 'Your locations were updated successfully.');
        });
    }
  }

  // Delete layers callback
  private editableLayersDelete(e: any) {
    const deleteUserLayersIds = [];
    const deletedUserLocationsMessages = [];
    const deleteEventsIds = [];
    const deletedEventLocationsMessages = [];
    const layers = e.layers;
    layers.eachLayer(function (l) {
      if (l instanceof L.Marker) {
        const markerDetails = thisObject.mapRepo.leafletToRealId.get(editableLayers.getLayerId(l));
        thisObject.mapRepo.leafletToRealId.delete(l._leaflet_id);
        if (markerDetails.type === CustomMarkerType.USER_MARKER) {
          deleteUserLayersIds.push(markerDetails.id);
          const message = MapService.prepareBroadcastMarkerMessage(null, null, EventType.MARKER_USER_DELETED, markerDetails.id);
          deletedUserLocationsMessages.push(message);
        } else {
          deleteEventsIds.push(markerDetails.idEvent);
          const message = MapService.prepareBroadcastMarkerMessage(null, null, EventType.MARKER_EVENT_DELETED, markerDetails.id);
          message.idEvent = markerDetails.idEvent;
          deletedEventLocationsMessages.push(message);
        }
      } else if (l instanceof L.Circle) {
        thisObject.sac.scanArea = null;
        thisObject.cleanScanAreaMarkers();
      }
    });
    if (deleteUserLayersIds.length > 0) {
      thisObject.userService.deleteDesiredLocations(thisObject.appUser.id, deleteUserLayersIds)
        .subscribe(res => {
          thisObject.webSocketService.sendBroadcastMarkerEvents(deletedUserLocationsMessages);
          thisObject.toastrUtilService
            .displaySuccessToastr('Delete complete!', 'Your locations were deleted successfully.');
        });
    }
    if (deleteEventsIds.length > 0) {
      thisObject.eventService.deleteEvents(deleteEventsIds)
        .subscribe(res => {
          thisObject.webSocketService.sendBroadcastMarkerEvents(deletedEventLocationsMessages);
          thisObject.toastrUtilService
            .displaySuccessToastr('Delete complete!', 'Your events were deleted successfully.');
        });
      thisObject.deleteSideChatAddedEventsWithIds(deleteEventsIds);
    }
  }

  // !MapGlobal event handlers end!

  // Save newly added location
  private saveDesiredLocation(layer: any) {
    const wrapper = layer.getLatLng();
    const location = new LocationCustom();
    location.longitude = wrapper.lng;
    location.latitude = wrapper.lat;
    this.userService.saveDesiredLocation(this.appUser.id, location)
      .subscribe(res => {
        editableLayers.addLayer(layer);
        this.mapRepo.leafletToRealId.set(editableLayers.getLayerId(layer), new CustomMarkerDetails(res, CustomMarkerType.USER_MARKER));
        location.id = res;
        layer.bindPopup(MapService.getUserPopup(this.profilePictureUrl, this.appUser, location),
          {className: MapService.POPUP_USER_BASE_CLASS});
        this.appUser.desiredLocations.push(location);
        const message = MapService.prepareBroadcastMarkerMessage(location.latitude,
          location.longitude, EventType.MARKER_USER_CREATED, location.id);
        this.webSocketService.sendBroadcastMarkerEvents([message]);
      });
  }


  // UTIL functions
  // Populate map with saved markers
  private addSelfDesiredLocationMarkers() {
    this.appUser.desiredLocations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude],
        {
          icon: this.personalMarkerIcon
        }).addTo(editableLayers);
      marker.bindPopup(MapService.getUserPopup(this.profilePictureUrl, this.appUser, location),
        {className: MapService.POPUP_USER_BASE_CLASS});
      this.mapRepo.leafletToRealId
        .set(editableLayers.getLayerId(marker), new CustomMarkerDetails(location.id, CustomMarkerType.USER_MARKER));
    });
  }

  // Populate map with user's events
  private addSelfEventMarkers() {
    this.eventService.getAllUserEvents(localStorage.getItem(LocalStorageConstants.USERNAME))
      .subscribe(events => {
        this.addEventMarkers(events, editableLayers);
        this.chatComp.addedEvents = this.chatComp.addedEvents.concat(events);
      });
  }

  private addEventMarkers(events: EventCustom[], baseLayer: any, scanArea?: boolean) {
    events.forEach(event => {
      if (event.profilePicture && event.location && event.id && event.location.id) {
        const profilePic = this.setUpPicture(event.profilePicture);
        const pictureMarker = MapService.getCustomMarkerIcon(
          profilePic,
          MapService.PURPLE_CUSTOM_MARKER,
          MapService.PURPLE_CUSTOM_MARKER_IMAGE,
          MapService.MARKER_ANIMATION_FADE_IN_DROP,
          MapService.PULSE_PURPLE
        );
        const location = event.location;
        const marker = L.marker([location.latitude, location.longitude], {icon: pictureMarker}).addTo(baseLayer);
        marker.bindPopup(MapService.getEventPopup(profilePic, event),
          {className: MapService.POPUP_EVENT_BASE_CLASS});
        const markerDetails = new CustomMarkerDetails(location.id, CustomMarkerType.EVENT_MARKER);
        markerDetails.idEvent = event.id;
        this.mapRepo.leafletToRealId.set(marker._leaflet_id, markerDetails);
        if (scanArea) {
          thisObject.sac.eventMarkers.add(marker._leaflet_id);
          MapService.addInListByIdDistinct(thisObject.chatComp.scanAreaEvents, event);
        }
      }
    });
  }

  private deleteSideChatAddedEventsWithIds(eventIds: number[]) {
    this.chatComp.addedEvents = this.chatComp.addedEvents
      .filter(event => !eventIds.includes(event.id));
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
      if (layer instanceof L.Marker && (
          thisObject.sac.userMarkers.has(layer._leaflet_id) ||
          thisObject.sac.venueMarkers.has(layer._leaflet_id) ||
          thisObject.sac.eventMarkers.has(layer._leaflet_id))) {
        thisObject.removeMarkerFromGlobalMap(layer);
      }
    });
    thisObject.chatComp.scanAreaUsers = [];
    thisObject.chatComp.scanAreaEvents = [];
  }

  private removeMarkerFromGlobalMap(layer: any) {
    mapGlobal.removeLayer(layer);
    thisObject.sac.userMarkers.delete(layer._leaflet_id);
    thisObject.sac.venueMarkers.delete(layer._leaflet_id);
    thisObject.sac.eventMarkers.delete(layer._leaflet_id);
    thisObject.mapRepo.leafletToRealId.delete(layer._leaflet_id);
  }

  private addScanCircle(layer: any): any {
    if (layer.getRadius() > Constants.MAX_SCAN_AREA_RADIUS) {
      thisObject.toastrUtilService
        .displayWarningToastr('Ooops!', UtilExceptionMessage.RADIUS_ADJUSTED);
      layer = layer.setRadius(Constants.MAX_SCAN_AREA_RADIUS);
    }
    editableLayers.addLayer(layer);
    layer.on('dblclick contextmenu', () => {
      thisObject.scanAreaComp.startSaveProcess(layer);
    });
    return layer;
  }

  private processScan(layer: any, animatedLayer: any) {
    const latlng = layer.getLatLng();
    thisObject.userService.getUsersScan(latlng.lat, latlng.lng, layer.getRadius())
      .subscribe(users => {
        mapGlobal.removeLayer(animatedLayer);
        users.forEach(user => {
          thisObject.addUserMarkersToMapGlobal(user);
          MapService.addInListByUsernameDistinct(thisObject.chatComp.scanAreaUsers, user);
        });
      });
    thisObject.eventService.getEventsScan(latlng.lat, latlng.lng, layer.getRadius())
      .subscribe(events => {
        thisObject.addEventMarkers(events, mapGlobal, true);
      });
    const selectedOptions = MapService.searchOptionSelected(thisObject.sac.searchOptions);
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
              .addFAMarker([+location.lat, +location.lng], colorAndIcon.iconName, colorAndIcon.pinColor, venue);
            thisObject.sac.venueMarkers.add(marker._leaflet_id);
          });
        });
    }
  }

  private addUserMarkersToMapGlobal(user: AppUser) {
    if (user && user.username && user.desiredLocations && user.desiredLocations.length > 0) {
      const pictureUrl = thisObject.setUpPicture(user.profilePicture);
      const pictureMarker = MapService.getCustomMarkerIcon(
        pictureUrl,
        MapService.BLUE_CUSTOM_MARKER,
        MapService.BLUE_CUSTOM_MARKER_IMAGE,
        MapService.MARKER_ANIMATION_FADE_IN_DROP,
        MapService.PULSE_BLUE
      );
      user.desiredLocations.forEach(location => {
        const marker = L.marker([location.latitude, location.longitude], {icon: pictureMarker}).addTo(mapGlobal);
        marker.bindPopup(MapService.getUserPopup(pictureUrl, user, location),
          {className: MapService.POPUP_USER_BASE_CLASS});
        thisObject.sac.userMarkers.set(marker._leaflet_id, user.username);
        thisObject.mapRepo.leafletToRealId
          .set(marker._leaflet_id, new CustomMarkerDetails(location.id, CustomMarkerType.USER_MARKER));
      });
    }
  }

  private addFAMarker(latlng: number[], iconName: string, color: string, venueData?: any, template?: any): any {
    const marker =
      L.marker(latlng,
        {
          icon: L.AwesomeMarkers.icon({
            icon: iconName,
            prefix: 'fa',
            markerColor: color,
          })
        }).addTo(mapGlobal);
    if (template) {
      marker.bindPopup(template);
    } else {
      marker.bindPopup(MapService.getVenuePopup(venueData),
        {className: MapService.POPUP_VENUE_BASE_CLASS});
    }
    return marker;
  }

  goToCoordinates(latlng: number[], zoom: number) {
    mapGlobal.setView(latlng, zoom);
  }

  openAddEventComp() {
    this.addEventComp.openAddEventModal(mapGlobal.getBounds().getCenter());
  }

  logout() {
    this.userService.logout(localStorage.getItem(LocalStorageConstants.USERNAME))
      .subscribe(res => {
        this.chatComp.cleanUp();
        this.scanAreaComp.cleanUp();
        this.mapRepo.cleanUp();
        this.sac.cleanUp();
        this.markerEventsSubscription.unsubscribe();
        this.transportService.webSocketCommandSink(WebSocketCommand.DISCONNECT);
        localStorage.clear();
        this.router.navigateByUrl(ClientUrls.LOGIN_PAGE);
      });
  }

  private setupMarkerEventsListener() {
    this.markerEventsSubscription = this.transportService.markerEventsStream()
      .subscribe(message => {
        switch (message.eventType) {
          case (EventType.MARKER_USER_CREATED):
          case (EventType.MARKER_EVENT_CREATED): {
            this.handleMarkerCreatedEvent(message);
            break;
          }
          case (EventType.MARKER_USER_UPDATED):
          case (EventType.MARKER_EVENT_UPDATED): {
            this.handleMarkerUpdatedEvent(message);
            break;
          }
          case (EventType.MARKER_USER_DELETED):
          case (EventType.MARKER_EVENT_DELETED): {
            this.handleMarkerDeletedEvent(message);
            break;
          }
          default: {
            console.log(message);
            break;
          }
        }
      });
  }

  // Aux
  private setUpPicture(attachement: AttachmentCustom): string {
    return `data:${attachement.type};base64,${attachement.content}`;
  }

  private addUserMarkerAtPointInsideScanArea(point: LocationCustom, user: AppUser) {
    const pictureUrl = thisObject.setUpPicture(user.profilePicture);
    const pictureMarker = MapService.getCustomMarkerIcon(
      pictureUrl,
      MapService.BLUE_CUSTOM_MARKER,
      MapService.BLUE_CUSTOM_MARKER_IMAGE,
      MapService.MARKER_ANIMATION_FADE_IN_DROP,
      MapService.PULSE_BLUE
    );
    const marker = L.marker([point.latitude, point.longitude], {icon: pictureMarker}).addTo(mapGlobal);
    marker.bindPopup(MapService.getUserPopup(pictureUrl, user, point),
      {className: MapService.POPUP_USER_BASE_CLASS});
    thisObject.sac.userMarkers.set(marker._leaflet_id, user.username);
    thisObject.mapRepo.leafletToRealId
      .set(marker._leaflet_id, new CustomMarkerDetails(point.id, CustomMarkerType.USER_MARKER));
  }

  private addEventMarkerAtPointInsideScanArea(point: LocationCustom, event: EventCustom) {
    const pictureUrl = thisObject.setUpPicture(event.profilePicture);
    const pictureMarker = MapService.getCustomMarkerIcon(
      pictureUrl,
      MapService.PURPLE_CUSTOM_MARKER,
      MapService.PURPLE_CUSTOM_MARKER_IMAGE,
      MapService.MARKER_ANIMATION_FADE_IN_DROP,
      MapService.PULSE_PURPLE
    );
    const marker = L.marker([point.latitude, point.longitude], {icon: pictureMarker}).addTo(mapGlobal);
    marker.bindPopup(MapService.getEventPopup(pictureUrl, event),
      {className: MapService.POPUP_EVENT_BASE_CLASS});
    thisObject.sac.eventMarkers.add(marker._leaflet_id);
    const markerDetails = new CustomMarkerDetails(point.id, CustomMarkerType.EVENT_MARKER);
    markerDetails.idEvent = event.id;
    thisObject.mapRepo.leafletToRealId
      .set(marker._leaflet_id, markerDetails);
  }

  // !WSMarkerEventsHandlers start!
  private handleMarkerCreatedEvent(message: MarkerEventMessage) {
    if (this.sac.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const center = this.sac.scanArea.getLatLng();
      const rad = this.sac.scanArea.getRadius();
      const point = message.location;
      if (HaversineDistanceUtil.pointInsideCircle(+point.latitude, +point.longitude, +center.lat, +center.lng, rad)) {
        if (message.eventType === EventType.MARKER_USER_CREATED) {
          this.userService.getPersonalInfoWithPic(message.source)
            .subscribe(user => {
              if (user && user.profilePicture) {
                this.addUserMarkerAtPointInsideScanArea(point, user);
                MapService.addInListByUsernameDistinct(thisObject.chatComp.scanAreaUsers, user);
              }
            });
        } else {
          if (message.idEvent) {
            this.eventService.getEventById(message.idEvent)
              .subscribe(event => {
                if (event && event.profilePicture) {
                  this.addEventMarkerAtPointInsideScanArea(point, event);
                  MapService.addInListByIdDistinct(thisObject.chatComp.scanAreaEvents, event);
                }
              });
          }
        }
      }
    }
  }

  private handleMarkerUpdatedEvent(message: MarkerEventMessage) {
    if (this.sac.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const center = this.sac.scanArea.getLatLng();
      const rad = this.sac.scanArea.getRadius();
      const point = message.location;
      const existingMarkerInScanAreaId = this.mapRepo.getLeafletIdByRealId(point.id); // marker existed in scan area before update or not
      // if new location in scan area
      if (HaversineDistanceUtil.pointInsideCircle(+point.latitude, +point.longitude, +center.lat, +center.lng, rad)) {
        if (existingMarkerInScanAreaId) {
          const layer = MapService.getGlobalLayerById(mapGlobal, existingMarkerInScanAreaId);
          const icon = layer.options.icon;
          layer.setLatLng(L.latLng(point.latitude, point.longitude));
          layer.setIcon(icon);
        } else {
          if (message.eventType === EventType.MARKER_USER_UPDATED) {
            this.userService.getPersonalInfoWithPic(message.source)
              .subscribe(user => {
                if (user && user.profilePicture) {
                  this.addUserMarkerAtPointInsideScanArea(point, user);
                  MapService.addInListByUsernameDistinct(this.chatComp.scanAreaUsers, user);
                }
              });
          } else {
            if (message.idEvent) {
              this.eventService.getEventById(message.idEvent)
                .subscribe(event => {
                  if (event && event.profilePicture) {
                    this.addEventMarkerAtPointInsideScanArea(point, event);
                    MapService.addInListByIdDistinct(this.chatComp.scanAreaEvents, event);
                  }
                });
            }
          }
        }
      } else {
        if (existingMarkerInScanAreaId) {
          const layer = MapService.getGlobalLayerById(mapGlobal, existingMarkerInScanAreaId);
          const existingUsername = this.sac.userMarkers.get(existingMarkerInScanAreaId);
          this.removeMarkerFromGlobalMap(layer);
          this.removeUserOrEventFromSideChat(existingUsername, message);
        }
      }
    }
  }

  private handleMarkerDeletedEvent(message: MarkerEventMessage) {
    if (this.sac.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const existingMarkerInScanAreaId = this.mapRepo.getLeafletIdByRealId(message.location.id);
      if (existingMarkerInScanAreaId) {
        const layer = MapService.getGlobalLayerById(mapGlobal, existingMarkerInScanAreaId);
        const existingUsername = this.sac.userMarkers.get(existingMarkerInScanAreaId);
        this.removeMarkerFromGlobalMap(layer);
        this.removeUserOrEventFromSideChat(existingUsername, message);
      }
    }
  }

  private removeUserOrEventFromSideChat(username: string, message: MarkerEventMessage) {
    if (message.eventType === EventType.MARKER_USER_UPDATED || message.eventType === EventType.MARKER_USER_DELETED) {
      if (!this.sac.existUser(username)) {
        this.chatComp.scanAreaUsers = this.chatComp.scanAreaUsers
          .filter(user => user.username !== username);
      }
    } else {
      this.chatComp.scanAreaEvents = this.chatComp.scanAreaEvents
        .filter(event => event.id !== message.idEvent);
    }
  }

  // !WSMarkerEventsHandlers end!
}
