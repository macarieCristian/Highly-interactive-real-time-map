import {Component, OnInit, ViewChild} from '@angular/core';
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

  constructor(private fb: FormBuilder,
              private eventService: EventService,
              private toastrUtilService: ToastrUtilService) {
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
    this.eventService.saveEvent(this.prepareEvent(), this.profilePic, this.uploadedPhotos)
      .subscribe(res => {
        console.log(res);
        this.toastrUtilService.displaySuccessToastr('Event saved', 'The event was saved successfully!');
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
      for (const file of event.target.files) {
        const reader = new FileReader();
        const fileSrc = new FileSourcePair();
        reader.onload = e => {
          fileSrc.source = reader.result.toString();
          fileSrc.file = file;
          this.uploadedPhotos.push(fileSrc);
        };
        reader.readAsDataURL(file);
      }
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
