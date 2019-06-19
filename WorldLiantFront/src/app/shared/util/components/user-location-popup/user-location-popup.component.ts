import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AppUser} from '../../../model/app-user';
import {LocationDetailsService} from '../../../service/location-details.service';
import {LocationCustom} from '../../../model/location-custom';
import {LocationDetails} from '../../../model/location-details';
import {LocalStorageConstants} from '../../../constants/local-storage-constants';
import {ToastrUtilService} from '../../../service/toastr-util.service';
import {AttachmentCustom} from '../../../model/attachment-custom';
import {TransportService} from '../../../service/transport.service';

@Component({
  selector: 'app-user-location-popup',
  templateUrl: './user-location-popup.component.html',
  styleUrls: ['./user-location-popup.component.scss']
})
export class UserLocationPopupComponent implements OnInit {
  @ViewChild('textAreaElement') textArea;

  @Input()
  picUrl: string;

  @Input()
  appUser: AppUser;

  @Input()
  location: LocationCustom;

  locationDetails: LocationDetails;

  isInput = true;
  more = false;
  descriptionLength = 50;
  oldDescription: string;

  constructor(private locationDetailsService: LocationDetailsService,
              private toastrUtilService: ToastrUtilService,
              private transportService: TransportService) {
  }

  ngOnInit() {
    this.locationDetails = new LocationDetails();
    this.locationDetailsService.getLocationDetails(this.location.id)
      .subscribe(details => {
        this.locationDetails = details;
        if (this.locationDetails.description) {
          this.isInput = false;
          this.oldDescription = this.locationDetails.description;
        }
      });
  }

  addOrModifyDescription() {
    this.isInput = false;
    if (this.locationDetails.description && this.locationDetails.description.length > 0 &&
      this.locationDetails.description !== this.oldDescription) {
      this.oldDescription = this.locationDetails.description;
      this.locationDetailsService.saveLocationDetailsDescription(this.locationDetails)
        .subscribe(result => result === true && this.toastrUtilService
          .displaySuccessToastr('Description saved', 'The new description was saved successfully!'));
    }
  }

  showTextArea() {
    this.isInput = true;
    setTimeout(() => this.textArea.nativeElement.focus());
  }

  isOwnerUser(): boolean {
    return localStorage.getItem(LocalStorageConstants.USERNAME) === this.appUser.username;
  }

  uploadPhotos(event) {
    if (event.target.files && event.target.files.length > 0) {
      const attachments = [];
      for (let i = 0; i < event.target.files.length; i++) {
        attachments.push(event.target.files[i]);
      }
      this.locationDetailsService.saveLocationDetailsAttachments(this.locationDetails, attachments)
        .subscribe(result => {
          this.locationDetails.attachments = result.map(id => AttachmentCustom.getNewWithId(id));
          this.toastrUtilService.displaySuccessToastr('Images added', 'The new images were added successfully!');
        });
    }
  }

  togglePreview() {
    if (this.existAttachments()) {
      this.transportService.photosPreviewSink(this.locationDetails.attachments.map(attachment => attachment.id));
    }
  }

  existAttachments() {
    return this.locationDetails.attachments && this.locationDetails.attachments.length > 0;
  }

  openChat() {
    this.transportService.openChatSink(this.appUser);
  }

}
