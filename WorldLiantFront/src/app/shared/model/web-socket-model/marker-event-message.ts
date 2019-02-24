import {LocationCustom} from '../location-custom';

export class MarkerEventMessage {
  source: string;
  destination: string;
  eventType: string;
  location: LocationCustom;
}
