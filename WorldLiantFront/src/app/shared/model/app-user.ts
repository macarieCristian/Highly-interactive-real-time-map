import {LocationCustom} from './location-custom';
import {AttachmentCustom} from './attachment-custom';

export class AppUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  gender: string;
  profilePicture: AttachmentCustom;
  statusType: string;
  accountStatusType: string;
  dateOfBirth: Date;
  homeLocation: LocationCustom;
  desiredLocations: LocationCustom[];
}
