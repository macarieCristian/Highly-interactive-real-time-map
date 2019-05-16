import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from './validator/custom-validators';
import {Constants} from '../../shared/constants/constants';
import {FileSourcePair} from '../../shared/model/util-model/file-source-pair';
import {EventService} from '../../shared/service/event.service';
import {EventCustom} from '../../shared/model/event-custom';
import {LocationCustom} from '../../shared/model/location-custom';
import {AppUser} from '../../shared/model/app-user';
import {LocalStorageConstants} from '../../shared/constants/local-storage-constants';
import {ToastrUtilService} from '../../shared/service/toastr-util.service';
import {EventCustomProfilePic} from '../../shared/model/util-model/event-custom-profile-pic';
import {MapService} from '../service/map.service';
import {EventType} from '../../shared/model/enums/event-type';
import {WebSocketService} from '../../shared/service/web-socket.service';

declare let L;
export let mapAddEvent;

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit {
  @ViewChild('addEventModal') addEventModal;
  @ViewChild('carousel') carousel;
  @ViewChild('carouselImages') carouselImages;
  formGroup: FormGroup;
  today = new Date();
  locationMarker: any;
  profilePic: FileSourcePair = new FileSourcePair();
  uploadedPhotos: FileSourcePair[] = [];

  @Output() eventAdded: EventEmitter<EventCustomProfilePic> = new EventEmitter<EventCustomProfilePic>();

  constructor(private fb: FormBuilder,
              private eventService: EventService,
              private toastrUtilService: ToastrUtilService,
              private webSocketService: WebSocketService) {
    this.formGroup = this.fb.group(
      {
        title: ['', [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('^[a-zA-Z0-9 ]*$')
        ]],
        description: ['', [
          Validators.required,
          Validators.minLength(5)
        ]],
        startDate: [null, [
          Validators.required
        ]],
        endDate: [null, [
          Validators.required
        ]],
        profilePicture: [null, [
          Validators.required
        ]]
      },
      {validator: CustomValidators.DateRangeValidator});
  }

  get title() {
    return this.formGroup.get('title');
  }

  get description() {
    return this.formGroup.get('description');
  }

  get startDate() {
    return this.formGroup.get('startDate');
  }

  get endDate() {
    return this.formGroup.get('endDate');
  }

  get profilePicture() {
    return this.formGroup.get('profilePicture');
  }

  ngOnInit() {
    this.carousel.SWIPE_ACTION = {LEFT: '', RIGHT: ''};
    mapAddEvent = L.map('mapId').setView([0, 0], 13);
    L.tileLayer(Constants.LEAFLET_URL, Constants.LEAFLET_MAP_PROPERTIES).addTo(mapAddEvent);
    mapAddEvent.on('click', (event) => {
      if (this.locationMarker) {
        mapAddEvent.removeLayer(this.locationMarker);
      }
      this.locationMarker = L.marker(event.latlng).addTo(mapAddEvent);
      this.locationMarker.bindPopup('This will be the location of the event.', {className: 'simple-popup'});
      console.log(this.locationMarker);
    });
  }

  openAddEventModal(center: any) {
    this.addEventModal.show();
    mapAddEvent.setView([center.lat, center.lng], 13);
  }

  closeAddEventModal() {
    this.formGroup.reset();
    this.carousel.selectSlide(0);
    this.carouselImages.selectSlide(0);
    this.profilePic = new FileSourcePair();
    this.uploadedPhotos = [];
    this.addEventModal.hide();
    if (this.locationMarker) {
      mapAddEvent.removeLayer(this.locationMarker);
      this.locationMarker = undefined;
    }
  }

  addEvent() {
    const event = this.prepareEvent();
    const profilePicture = this.profilePic;
    this.eventService.saveEvent(event, profilePicture, this.uploadedPhotos)
      .subscribe(res => {
        event.id = res.id;
        event.location.id = res.location.id;
        this.eventAdded.emit({event, profilePicture});
        this.toastrUtilService.displaySuccessToastr('Event saved', 'The event was saved successfully!');
        const msg = MapService.prepareChatMessage(
          localStorage.getItem(LocalStorageConstants.USERNAME),
          '',
          EventType.NOTIFICATION_NEW_EVENT,
          `${event.id}`
        );
        this.webSocketService.sendPrivateNotificationMessage(msg);
      });
    this.closeAddEventModal();
  }

  uploadProfilePic(event) {
    if (event.target.files && event.target.files[0]) {
      this.profilePic.file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        this.profilePic.source = reader.result.toString();
      };
      reader.readAsDataURL(this.profilePic.file);
    }
  }

  setupMap() {
    mapAddEvent.invalidateSize();
  }

  uploadPhotos(event) {
    if (event.target.files) {
      const reader = new FileReader();
      this.uploadPhotoAux(reader, event.target.files, 0);
    }
  }

  uploadPhotoAux(reader: FileReader, files: File[], index: number) {
    if (index === files.length) {
      return;
    } else {
      reader.onload = e => {
        const fileSrc = new FileSourcePair();
        fileSrc.file = files[index];
        fileSrc.source = reader.result.toString();
        this.uploadedPhotos.push(fileSrc);
        this.uploadPhotoAux(reader, files, ++index);
      };
      reader.readAsDataURL(files[index]);
    }
  }

  private prepareEvent(): EventCustom {
    const latLng = this.locationMarker.getLatLng();
    const eventLocation = new LocationCustom();
    eventLocation.latitude = latLng.lat;
    eventLocation.longitude = latLng.lng;
    const contact = new AppUser();
    contact.id = +localStorage.getItem(LocalStorageConstants.ID);
    const event = new EventCustom();
    event.name = this.title.value;
    event.description = this.description.value;
    event.startDate = this.startDate.value;
    event.endDate = this.endDate.value;
    event.location = eventLocation;
    event.contactPerson = contact;
    return event;
  }
}
