import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EventCustom} from '../model/event-custom';
import {FileSourcePair} from '../model/util-model/file-source-pair';
import {ServerUrls} from '../constants/server-urls';
import {AppUser} from '../model/app-user';

@Injectable()
export class EventService {

  constructor(private httpClient: HttpClient) {
  }

  getAllUserEvents(username: string): Observable<EventCustom[]> {
    return this.httpClient.get<EventCustom[]>(`${ServerUrls.EVENTS}/${username}`);
  }

  getEventById(eventId: number): Observable<EventCustom> {
    return this.httpClient.get<EventCustom>(`${ServerUrls.EVENT}/${eventId}`);
  }

  getEventsScan(lat: number, lng: number, rad: number): Observable<EventCustom[]> {
    const params = {
      lat: `${lat}`,
      lng: `${lng}`,
      rad: `${rad}`
    };
    return this.httpClient.get<EventCustom[]>(`${ServerUrls.SCAN_EVENTS}`, {params: params});
  }

  saveEvent(event: EventCustom, profilePicture: FileSourcePair, photos: FileSourcePair[]): Observable<EventCustom> {
    const formData = new FormData();
    const eventBlob = new Blob([JSON.stringify(event)], {type: 'application/json'});
    formData.append('event', eventBlob);
    formData.append('profilePicture', profilePicture.file);
    for (const photo of photos) {
      formData.append('photos', photo.file);
    }
    return this.httpClient.post<EventCustom>(ServerUrls.EVENTS, formData);
  }

  deleteEvents(eventIds: number[]): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${ServerUrls.EVENTS}/${eventIds}`);
  }
}
