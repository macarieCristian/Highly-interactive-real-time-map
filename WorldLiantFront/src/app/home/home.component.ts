import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ServerUrls} from '../shared/constants/server-urls';
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
import {EventType} from '../shared/model/web-socket-model/event-type';
import {HaversineDistanceUtil} from '../shared/util/haversine-distance-util';
import {MapService} from './service/map.service';
import {UtilExceptionMessage} from '../shared/constants/util-exception-message';
import {AttachmentCustom} from '../shared/model/attachment-custom';
import {ChatService} from '../shared/service/chat.service';
import {SearchResultPinData} from '../shared/model/util-model/search-result-pin-data';
import {MapRepository} from '../shared/repository/map-repository';
import {ScanAreaRepository} from '../shared/repository/scan-area-repository';
import {Scan} from '../shared/model/scan';

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
  @ViewChild('chat') chat;
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
              private toastrUtilService: ToastrUtilService,
              private webSocketService: WebSocketService,
              private transportService: TransportService,
              private sac: ScanAreaRepository,
              private mapRepo: MapRepository) {
  }

  ngOnInit() {

    thisObject = this;
    this.getProfileInfo();
  }

  ngOnDestroy() {
    this.markerEventsSubscription.unsubscribe();
  }

  private getProfileInfo() {
    const username = localStorage.getItem(LocalStorageConstants.USERNAME);
    if (username) {
      this.userService.getPersonalInfoWithLocations(username)
        .subscribe(result => {
          this.appUser = result;
          localStorage.setItem(LocalStorageConstants.ID, `${result.id}`);
          this.chat.appUser = result;
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
          this.initMap();
        };
        reader.readAsDataURL(img);
      });
  }

  private initMap() {
    mapGlobal = L.map('mapid').setView(this.homeCoordinates, 13);
    mapGlobal.doubleClickZoom.disable();
    L.tileLayer(Constants.LEAFLET_URL, Constants.LEAFLET_MAP_PROPERTIES).addTo(mapGlobal);
    const m1 = this.addFAMarker(this.homeCoordinates, 'fa-home', 'red', '<b>Hello!</b> Here is your home!');
    m1.on('click', function () {
      console.log('haha');
      // thisObject.mapService.getVenueDetails('4c08c8bba1b32d7f098996f0')
      thisObject.mapService.getVenueDetails('4cb0cccfcbab236a54bda373')
        .subscribe(details => console.log(details));
    });

    editableLayers = new L.FeatureGroup();
    mapGlobal.addLayer(editableLayers);

    this.personalMarkerIcon = L.divIcon({
      popupAnchor: [0, -40],
      iconSize: null,
      html: `<div class="pin2 animated fadeIn"><img class="img-inside" src="${this.profilePictureUrl}"></div><div class="pulse"></div>`
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
          icon: this.personalMarkerIcon
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
          thisObject.chat.sideChat = !thisObject.chat.sideChat;
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
  }

  processGivenScan(scan: Scan) {
    mapGlobal.setView([+scan.latitude, +scan.longitude], 13);
    if (scan.scanOptions) {
      this.sac.setSearchOptions(scan.scanOptions);
      this.sideOptions = true;
    } else {
      this.sac.clearSearchOptionValues();
    }
    setTimeout(() => {
      const scanArea = L.circle({lat: scan.latitude, lng: scan.longitude},
        {
          radius: scan.radius,
          color: 'black',
          weight: 3,
          opacity: 0.5,
          fill: true,
          fillColor: 'red',
          fillOpacity: 0.4,
          clickable: true,
        })
        .addTo(editableLayers);
      this.editableLayersCreate({layerType: 'circle', layer: scanArea});
    }, 500);


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
        const newLocation = new LocationCustom();
        newLocation.id = thisObject.mapRepo.leafletToRealId.get(editableLayers.getLayerId(l));
        const latlng = l.getLatLng();
        newLocation.longitude = latlng.lng;
        newLocation.latitude = latlng.lat;
        updatedLocations.push(newLocation);
        const message = MapService.prepareBroadcastMarkerMessage(
          newLocation.latitude, newLocation.longitude, EventType.MARKER_UPDATED, newLocation.id);
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
        const id = thisObject.mapRepo.leafletToRealId.get(editableLayers.getLayerId(l));
        thisObject.mapRepo.leafletToRealId.delete(l._leaflet_id);
        deleteLayersIds.push(id);
        const message = MapService.prepareBroadcastMarkerMessage(null, null, EventType.MARKER_DELETED, id);
        deletedLocationsMessages.push(message);
      } else if (l instanceof L.Circle) {
        thisObject.sac.scanArea = null;
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

  // Save newly added location
  private saveDesiredLocation(layer: any) {
    layer.bindPopup(MapService.getUserPopup(this.profilePictureUrl, this.appUser));
    const wrapper = layer.getLatLng();
    const location = new LocationCustom();
    location.longitude = wrapper.lng;
    location.latitude = wrapper.lat;
    this.userService.saveDesiredLocation(this.appUser.id, location)
      .subscribe(res => {
        editableLayers.addLayer(layer);
        this.mapRepo.leafletToRealId.set(editableLayers.getLayerId(layer), res);
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
          icon: this.personalMarkerIcon
        }).addTo(editableLayers);
      marker.bindPopup(MapService.getUserPopup(this.profilePictureUrl, this.appUser));
      this.mapRepo.leafletToRealId.set(editableLayers.getLayerId(marker), location.id);
    });
  }

  private removeCircles() {
    editableLayers.eachLayer(function (layer) {
      if (layer instanceof L.Circle) {
        // thisObject.transportService.modalConfirmSink(layer);
        editableLayers.removeLayer(layer);
      }
    });
  }

  private cleanScanAreaMarkers() {
    mapGlobal.eachLayer(function (layer) {
      if (layer instanceof L.Marker &&
        (thisObject.sac.userMarkers.has(layer._leaflet_id) || thisObject.sac.venueMarkers.has(layer._leaflet_id))) {
        thisObject.removeMarkerFromGlobalMap(layer);
      }
    });
    thisObject.chat.scanAreaUsers = [];
  }

  private removeMarkerFromGlobalMap(layer: any) {
    mapGlobal.removeLayer(layer);
    thisObject.sac.userMarkers.delete(layer._leaflet_id);
    thisObject.sac.venueMarkers.delete(layer._leaflet_id);
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
      .subscribe(res => {
        mapGlobal.removeLayer(animatedLayer);
        res.forEach(user => {
          thisObject.addUserMarkersForScanResult(user);
          MapService.addInListByUsernameDistinct(thisObject.chat.scanAreaUsers, user);
        });
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
              .addFAMarker([+location.lat, +location.lng], colorAndIcon.iconName, colorAndIcon.pinColor, popupTemplate);
            thisObject.sac.venueMarkers.add(marker._leaflet_id);
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
        thisObject.sac.userMarkers.add(marker._leaflet_id);
        thisObject.mapRepo.leafletToRealId.set(marker._leaflet_id, location.id);
      });
    }
  }

  private addFAMarker(latlng: number[], iconName: string, color: string, popupTemplate: string): any {
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

  openAddEventComp() {
    this.addEventComp.openAddEventModal(mapGlobal.getBounds().getCenter());
  }

  logout() {
    this.userService.logout(localStorage.getItem(LocalStorageConstants.USERNAME))
      .subscribe(res => {
        this.chat.cleanUp();
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
  private setUpPicture(attachement: AttachmentCustom): string {
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
    thisObject.sac.userMarkers.add(marker._leaflet_id);
    thisObject.mapRepo.leafletToRealId.set(marker._leaflet_id, point.id);
  }

  private handleMarkerCreatedEvent(message: MarkerEventMessage) {
    if (this.sac.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const center = this.sac.scanArea.getLatLng();
      const rad = this.sac.scanArea.getRadius();
      const point = message.location;
      if (HaversineDistanceUtil.pointInsideCircle(+point.latitude, +point.longitude, +center.lat, +center.lng, rad)) {
        this.userService.getPersonalInfoWithPic(message.source)
          .subscribe(user => {
            if (user && user.profilePicture) {
              thisObject.addUserMarkerAtPointInsideScanArea(point, user);
              MapService.addInListByUsernameDistinct(thisObject.chat.scanAreaUsers, user);
            }
          });
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
          this.userService.getPersonalInfoWithPic(message.source)
            .subscribe(user => {
              if (user && user.profilePicture) {
                thisObject.addUserMarkerAtPointInsideScanArea(point, user);
                MapService.addInListByUsernameDistinct(thisObject.chat.scanAreaUsers, user);
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
    if (this.sac.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const existingMarkerInScanAreaId = this.mapRepo.getLeafletIdByRealId(message.location.id);
      if (existingMarkerInScanAreaId) {
        const layer = MapService.getGlobalLayerById(mapGlobal, existingMarkerInScanAreaId);
        this.removeMarkerFromGlobalMap(layer);
      }
    }
  }
}
