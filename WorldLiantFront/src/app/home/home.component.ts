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
  locationLeafletIdMap: Map<string, number>;

  constructor(private utilityService: UtilityService,
              private userService: UserService,
              private router: Router,
              private toastrUtilService: ToastrUtilService,
              private transportService: TransportService) {
  }

  ngOnInit() {
    this.computeDistance();
    this.locationLeafletIdMap = new Map<string, number>();
    thisObject = this;
    this.getProfileInfo();
  }

  getProfileInfo() {
    const username = localStorage.getItem(LocalStorageConstants.USERNAME);
    if (username) {
      this.userService.getPersonalInfo(username)
        .subscribe(result => {
          this.appUser = result;
          this.homeCoordinates = [+this.appUser.homeLocation.latitude, +this.appUser.homeLocation.longitude];
          this.getProfilePicture();
        });
    }
  }

  getProfilePicture() {
    const url = ServerUrls.PROFILE_PIC + localStorage.getItem(LocalStorageConstants.USERNAME);
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
      html: `<div class="pin2"><img class="img-inside" src="${profilePicUrl}"></div>`
    });

    this.addDesiredLocationMarkers();
    const options = {
      position: 'topright',
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
            clickable: true
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

    mapGlobal.on(L.Draw.Event.CREATED, this.editableLayersCreate);
    mapGlobal.on(L.Draw.Event.EDITED, this.editableLayersUpdate);
    mapGlobal.on(L.Draw.Event.DELETED, this.editableLayersDelete);
  }

  // Create layers callback
  private editableLayersCreate(e: any) {
    const type = e.layerType;
    const layer = e.layer;

    switch (type) {
      case 'marker': {
        // layer.bindPopup('A popup!');
        thisObject.saveDesiredLocation(layer);
        break;
      }
      case 'circle': {
        thisObject.deleteAllCircles();
        const addedLayer = thisObject.addScanCircle(layer);
        thisObject.processScan(addedLayer);
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
    const layers = e.layers;
    layers.eachLayer(function (l) {
      if (l instanceof L.Marker) {
        const newLocation = new LocationCustom();
        newLocation.id = thisObject.locationLeafletIdMap.get(editableLayers.getLayerId(l));
        const latlng = l.getLatLng();
        newLocation.longitude = latlng.lng;
        newLocation.latitude = latlng.lat;
        updatedLocations.push(newLocation);
      }
    });
    if (updatedLocations.length > 0) {
      thisObject.userService.updateDesiredLocations(thisObject.appUser.id, updatedLocations)
        .subscribe(res => {
          thisObject.toastrUtilService
            .displaySuccessToastr('Update complete!', 'Your desired locations were updated successfully.');
        });
    }
  }

  // Delete layers callback
  private editableLayersDelete(e: any) {
    const deleteLayersIds = [];
    const layers = e.layers;
    layers.eachLayer(function (l) {
      if (l instanceof L.Marker) {
        const id = thisObject.locationLeafletIdMap.get(editableLayers.getLayerId(l));
        deleteLayersIds.push(id);
      }
    });
    if (deleteLayersIds.length > 0) {
      thisObject.userService.deleteDesiredLocations(thisObject.appUser.id, deleteLayersIds)
        .subscribe(res => {
          thisObject.toastrUtilService
            .displaySuccessToastr('Delete complete!', 'Your desired locations were deleted successfully.');
        });
    }
  }

  private saveDesiredLocation(layer: any) {
    const wrapper = layer.getLatLng();
    const location = new LocationCustom();
    location.longitude = wrapper.lng;
    location.latitude = wrapper.lat;

    layer.bindPopup(`lat: ${wrapper.lat},  lng: ${wrapper.lng}`);

    this.userService.saveDesiredLocation(this.appUser.id, location)
      .subscribe(res => {
        editableLayers.addLayer(layer);
        this.locationLeafletIdMap.set(editableLayers.getLayerId(layer), res);
        location.id = res;
        this.appUser.desiredLocations.push(location);
      });
  }


  // UTIL functions

  // Populate map with saved markers
  private addDesiredLocationMarkers() {
    this.appUser.desiredLocations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude],
        {
          icon: personalMarkerImage
        }).addTo(editableLayers);
      marker.bindPopup('A popup!');
      this.locationLeafletIdMap.set(editableLayers.getLayerId(marker), location.id);
    });
  }

  private deleteAllCircles() {
    editableLayers.eachLayer(function (el) {
      if (el instanceof L.Circle) {
        editableLayers.removeLayer(el);
      }
    });
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

  private processScan(layer: any) {
    console.log(layer);
    console.log(layer.getRadius());
    console.log(layer.getLatLng());
    const latlng = layer.getLatLng();
    thisObject.userService.getUsersScan(latlng.lat, latlng.lng, layer.getRadius())
      .subscribe(res => {
        console.log(res);
      });
  }

  addFAMarker(latlng: number[], iconName: string, color: string) {
    const marker =
      L.marker(latlng,
        {
          icon: L.AwesomeMarkers.icon({
            icon: iconName,
            prefix: 'fa',
            markerColor: color
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


  // Haversine Formula
  // dlon = lon2 - lon1
  // dlat = lat2 - lat1
  // a = (sin(dlat/2))^2 + cos(lat1) * cos(lat2) * (sin(dlon/2))^2
  // c = 2 * atan2( sqrt(a), sqrt(1-a) )
  // d = R * c (where R is the radius of the Earth) 6373 km
  // lat: 46.81110426881619, lng: 23.564815521240238
  // lat: 46.809224459253954, lng: 23.64480972290039
  computeDistance() {
    // var Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator

    let lat1 = 46.81110426881619;
    let lng1 = 23.564815521240238;
    let lat2 = 46.809224459253954;
    let lng2 = 23.64480972290039;

    // convert coordinates to radians
    lat1 = this.deg2rad(lat1);
    lng1 = this.deg2rad(lng1);
    lat2 = this.deg2rad(lat2);
    lng2 = this.deg2rad(lng2);

    const dlng = lng2 - lng1;
    const dlat = lat2 - lat1;

    const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlng / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
    const dk = 6373 * c; // great circle distance in km
    const km = this.round(dk); // round the results down to the nearest 1/1000
    console.log(km);
  }

  // round to the nearest 1/1000
  round(x) {
    return Math.round(x * 1000) / 1000;
  }

  // convert degrees to radians
  deg2rad(deg) {
    const rad = deg * Math.PI / 180; // radians = degrees * pi/180
    return rad;
  }

  // dlon = lon2 - lon1
  // dlat = lat2 - lat1
  // a = (sin(dlat/2))^2 + cos(lat1) * cos(lat2) * (sin(dlon/2))^2
  // c = 2 * atan2( sqrt(a), sqrt(1-a) )
  // d = R * c (where R is the radius of the Earth)


}
