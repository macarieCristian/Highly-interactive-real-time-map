import {AppUser} from './app-user';
import {LocationCustom} from './location-custom';
import {AttachmentCustom} from './attachment-custom';

export class EventCustom {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  contactPerson: AppUser;
  location: LocationCustom;
  profilePicture: AttachmentCustom;
  attachments: AttachmentCustom[];
}
