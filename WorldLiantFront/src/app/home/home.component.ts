import {Component, OnInit} from '@angular/core';
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
import {AttachmentCustom} from '../shared/model/attachment-custom';

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
export class HomeComponent implements OnInit {
  profilePictureUrl: string;
  appUser: AppUser;
  homeCoordinates: number[];
  // key: leaflet_id value: id
  locationLeafletIdIdMap: Map<string, number>;
  scanAreaMarkers: Set<string>;
  scanArea: any = null;
  scanAreaUsers: AppUser[];
  contactUsers: AppUser[];
  sideChat = false;
  openChat = false;
  notes = [
    {
      name: 'Andrei Numefoartelung',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Salam Florin',
      updated: new Date('1/28/16'),
    }
  ];

  constructor(private utilityService: UtilityService,
              private userService: UserService,
              private router: Router,
              private toastrUtilService: ToastrUtilService,
              private webSocketService: WebSocketService,
              private transportService: TransportService) {
  }

  ngOnInit() {
    this.locationLeafletIdIdMap = new Map<string, number>();
    this.scanAreaMarkers = new Set<string>();
    this.scanAreaUsers = [];
    thisObject = this;
    this.getProfileInfo();
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
    this.addFAMarker(this.homeCoordinates, 'fa-home', 'red');

    editableLayers = new L.FeatureGroup();
    mapGlobal.addLayer(editableLayers);

    personalMarkerImage = L.divIcon({
      popupAnchor: [0, -40],
      iconSize: null,
      html: `<div class="pin2 animated fadeIn"><img class="img-inside" src="${profilePicUrl}"></div>`
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
        const wrapper = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const container = L.DomUtil.create('div', 'leaflet-control-custom', wrapper);
        container.onclick = function () {
          thisObject.sideChat = !thisObject.sideChat;
        };
        const icon = L.DomUtil.create('i', 'fa fa-comments-o', container);
        return wrapper;
      }
    });
    mapGlobal.addControl(new customControl());

    mapGlobal.on(L.Draw.Event.CREATED, this.editableLayersCreate);
    mapGlobal.on(L.Draw.Event.EDITED, this.editableLayersUpdate);
    mapGlobal.on(L.Draw.Event.DELETED, this.editableLayersDelete);

    this.setupMarkerEventsListener();
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
        thisObject.cleanSearchArea();
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
        const message = thisObject.prepareBroadcastMarkerMessage(
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
        const message = thisObject.prepareBroadcastMarkerMessage(null, null, EventType.MARKER_DELETED, id);
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

  // Save newly added location
  private saveDesiredLocation(layer: any) {
    layer.bindPopup(this.userPopup(profilePicUrl, this.appUser));
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
        const message = this.prepareBroadcastMarkerMessage(location.latitude, location.longitude, EventType.MARKER_CREATED, location.id);
        this.webSocketService.sendBroadcastMarkerEvents([message]);
      });
  }


  // UTIL functions
  private userPopup(picUrl: string, appUser: AppUser): string {
    return `
<div class="card" style="width: 14rem;">
  <img class="card-img-top" src=${picUrl} alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title text-center">${appUser.lastName} ${appUser.firstName}</h5>
    <p class="card-text text-center"><span class="link-custom">View profile</span></p>
  </div>
</div>
`;
  }

  // Populate map with saved markers
  private addSelfDesiredLocationMarkers() {
    this.appUser.desiredLocations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude],
        {
          icon: personalMarkerImage
        }).addTo(editableLayers);
      marker.bindPopup(this.userPopup(profilePicUrl, this.appUser));
      this.locationLeafletIdIdMap.set(editableLayers.getLayerId(marker), location.id);
    });
  }

  private cleanSearchArea() {
    editableLayers.eachLayer(function (layer) {
      if (layer instanceof L.Circle) {
        editableLayers.removeLayer(layer);
      }
    });
    thisObject.cleanScanAreaMarkers();
    // thisObject.scanAreaUsers = [];
  }

  private cleanScanAreaMarkers() {
    mapGlobal.eachLayer(function (layer) {
      if (layer instanceof L.Marker && thisObject.scanAreaMarkers.has(layer._leaflet_id)) {
        thisObject.removeMarkerFromGlobalMap(layer);
      }
    });
  }

  private removeMarkerFromGlobalMap(layer: any) {
    mapGlobal.removeLayer(layer);
    thisObject.scanAreaMarkers.delete(layer._leaflet_id);
    thisObject.locationLeafletIdIdMap.delete(layer._leaflet_id);
  }

  private getGlobalLayerById(leaflet_id: string): any {
    let result;
    mapGlobal.eachLayer(function (layer) {
      if (layer._leaflet_id === leaflet_id) {
        result = layer;
      }
    });
    return result;
  }

  private addScanCircle(layer: any): any {
    if (layer.getRadius() > Constants.MAX_SCAN_AREA_RADIUS) {
      thisObject.toastrUtilService
        .displayWarningToastr('Ooops!', 'Looks like you exceeded the maximum radius of 50 km so we did a little adjustment :).');
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
          // thisObject.scanAreaUsers.push(user);
        });
      });
  }

  private addUserMarkersForScanResult(user: AppUser) {
    if (user && user.username && user.desiredLocations && user.desiredLocations.length > 0) {
      const pictureUrl = thisObject.setUpPicture(user.profilePicture);
      const pictureMarker = L.divIcon({
        popupAnchor: [0, -40],
        iconSize: null,
        html: `<div class="pin2 animated fadeInDown"><img class="img-inside" src="${pictureUrl}"></div>`
      });
      user.desiredLocations.forEach(location => {
        const marker = L.marker([location.latitude, location.longitude], {icon: pictureMarker}).addTo(mapGlobal);
        marker.bindPopup(thisObject.userPopup(pictureUrl, user));
        thisObject.scanAreaMarkers.add(marker._leaflet_id);
        thisObject.locationLeafletIdIdMap.set(marker._leaflet_id, location.id);
      });
    }
  }

  addFAMarker(latlng: number[], iconName: string, color: string) {
    const marker =
      L.marker(latlng,
        {
          icon: L.AwesomeMarkers.icon({
            icon: iconName,
            prefix: 'fa',
            markerColor: color,
          })
        }).addTo(mapGlobal);
    marker.bindPopup('<b>Hello!</b><br>Here is your home.');
  }

  goToCoordinates(latlng: number[], zoom: number) {
    mapGlobal.setView(latlng, zoom);
  }

  logout() {
    this.transportService.webSocketCommandSink(WebSocketCommand.DISCONNECT);
    localStorage.clear();
    this.router.navigateByUrl(ClientUrls.LOGIN_PAGE);
  }

  private prepareBroadcastMarkerMessage(lat: string, lng: string, eventType: string, locationId: number): MarkerEventMessage {
    const message = new MarkerEventMessage();
    message.location = new LocationCustom();
    message.source = localStorage.getItem(LocalStorageConstants.USERNAME);
    message.eventType = eventType;
    message.location.id = locationId;
    message.location.latitude = `${lat}`;
    message.location.longitude = `${lng}`;
    return message;
  }


  private setupMarkerEventsListener() {
    this.transportService.markerEventsStream()
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


  private addUserMarkerAtPointInsideScanArea(point: LocationCustom, user: AppUser) {
    const pictureUrl = thisObject.setUpPicture(user.profilePicture);
    const pictureMarker = L.divIcon({
      popupAnchor: [0, -40],
      iconSize: null,
      html: `<div class="pin2 animated fadeInDown"><img class="img-inside" src="${pictureUrl}"></div>`
    });
    const marker = L.marker([point.latitude, point.longitude], {icon: pictureMarker}).addTo(mapGlobal);
    marker.bindPopup(thisObject.userPopup(pictureUrl, user));
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

  private setUpPicture(attachement: AttachmentCustom): string {
    return `data:${attachement.type};base64,${attachement.content}`;
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
          const layer = this.getGlobalLayerById(existingMarkerInScanAreaId);
          const icon = layer.options.icon;
          layer.setLatLng(L.latLng(point.latitude, point.longitude));
          layer.setIcon(icon);
        } else {
          this.userService.getPersonalInfoWithPic(message.source)
            .subscribe(user => {
              if (user && user.profilePicture) {
                thisObject.addUserMarkerAtPointInsideScanArea(point, user);
              }
            });
        }
      } else {
        if (existingMarkerInScanAreaId) {
          const layer = this.getGlobalLayerById(existingMarkerInScanAreaId);
          this.removeMarkerFromGlobalMap(layer);
        }
      }
    }
  }

  private handleMarkerDeletedEvent(message: MarkerEventMessage) {
    if (this.scanArea && message.source && message.location && this.appUser.username !== message.source) {
      const existingMarkerInScanAreaId = this.getLeafletIdByRealId(message.location.id);
      if (existingMarkerInScanAreaId) {
        const layer = this.getGlobalLayerById(existingMarkerInScanAreaId);
        this.removeMarkerFromGlobalMap(layer);
      }
    }
  }
}
