import {LocationCustom} from './location-custom';

export class AppUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  gender: string;
  statusType: string;
  accountStatusType: string;
  dateOfBirth: Date;
  homeLocation: LocationCustom;
  desiredLocations: LocationCustom[];
}
