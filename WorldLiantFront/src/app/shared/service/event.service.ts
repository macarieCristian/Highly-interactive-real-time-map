import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EventCustom} from '../model/event-custom';
import {FileSourcePair} from '../model/util-model/file-source-pair';
import {ServerUrls} from '../constants/server-urls';

@Injectable()
export class EventService {

  constructor(private httpClient: HttpClient) {
  }

  saveEvent(event: EventCustom, profilePicture: FileSourcePair, photos: FileSourcePair[]): Observable<boolean> {
    const formData = new FormData();
    const eventBlob = new Blob([JSON.stringify(event)], {type: 'application/json'});
    formData.append('event', eventBlob);
    formData.append('profilePicture', profilePicture.file);
    for (const photo of photos) {
      formData.append('photos', photo.file);
    }
    return this.httpClient.post<boolean>(ServerUrls.EVENTS, formData);
  }
}
