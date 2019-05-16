import {LocationCustom} from '../location-custom';

export class MarkerEventMessage {
  source: string;
  destination: string;
  eventType: string;
  idEvent: number;
  location: LocationCustom;
}
