import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  private subject = new Subject<string>();

  constructor() {
  }

  webSocketCommandStream(): Observable<string> {
    return this.subject.asObservable();
  }

  webSocketCommandSink(message: string) {
    this.subject.next(message);
  }

}
