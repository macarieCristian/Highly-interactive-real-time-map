import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {ServerUrls} from '../constants/server-urls';
import {LocalStorageConstants} from '../constants/local-storage-constants';
import {MarkerEventMessage} from '../model/web-socket-model/marker-event-message';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient;
  private privateSubject = new Subject<any>();
  private broadcastSubject = new Subject<any>();
  private broadcastSubjectMarkerEvents = new Subject<any>();

  constructor() {
  }

  connectToSocket() {
    const ws = new SockJS(`${ServerUrls.SOCKET_URL}`);
    this.stompClient = Stomp.over(ws);
    const username = localStorage.getItem(LocalStorageConstants.USERNAME);
    this.stompClient.connect({user: username}, () => {
        console.log('connected!');
        this.stompClient.subscribe(`/user/${username}/queue/private/`, (message) => {
            this.privateSubject.next(message);
          },
          (error) => {
            console.log(error);
          });

        this.stompClient.subscribe(`/topic/broadcast`, (message) => {
            this.broadcastSubject.next(message);
          },
          (error) => {
            console.log(error);
          });

        this.stompClient.subscribe(`/topic/broadcast/marker-events`, (message) => {
            this.broadcastSubjectMarkerEvents.next(message);
          },
          (error) => {
            console.log(error);
          });
      },
      (error) => {
        console.log(error);
      });

  }

  privateChannel(): Observable<any> {
    return this.privateSubject.asObservable();
  }

  broadcastChannel(): Observable<any> {
    return this.broadcastSubject.asObservable();
  }

  broadcastMarkerEventsChannel(): Observable<any> {
    return this.broadcastSubjectMarkerEvents.asObservable();
  }

  disconnectSocket() {
    console.log('Disconnecting...');
    this.stompClient.disconnect();
  }

  sendPrivateMessage(message: any) {
    this.stompClient.send('/app/private/send', {}, JSON.stringify(message));
  }

  sendBroadcastMessage(message: any) {
    this.stompClient.send('/app/broadcast/send', {}, JSON.stringify(message));
  }

  sendBroadcastMarkerEvents(messages: MarkerEventMessage[]) {
    this.stompClient.send('/app/broadcast/marker-events/send', {}, JSON.stringify(messages));
  }
}
