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
  dateOfBirth: Date;
  homeLocation: LocationCustom;
}
