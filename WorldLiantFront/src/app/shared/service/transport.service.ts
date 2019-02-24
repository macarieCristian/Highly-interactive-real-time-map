import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {MarkerEventMessage} from '../model/web-socket-model/marker-event-message';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  private subject = new Subject<string>();
  private subjectMarkerEvents = new Subject<MarkerEventMessage>();

  constructor() {
  }

  webSocketCommandStream(): Observable<string> {
    return this.subject.asObservable();
  }

  webSocketCommandSink(message: string) {
    this.subject.next(message);
  }

  markerEventsStream(): Observable<MarkerEventMessage> {
    return this.subjectMarkerEvents.asObservable();
  }

  markerEventsSink(message: MarkerEventMessage) {
    this.subjectMarkerEvents.next(message);
  }

}
