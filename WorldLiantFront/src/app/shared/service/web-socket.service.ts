import {Injectable} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {ServerUrls} from '../constants/server-urls';
import {LocalStorageConstants} from '../constants/local-storage-constants';
import {MarkerEventMessage} from '../model/web-socket-model/marker-event-message';
import {ChatMessage} from '../model/web-socket-model/chat-message';
import {StandardMessage} from '../model/web-socket-model/standard-message';
import {MapService} from '../../home/service/map.service';
import {StandardMessageType} from '../model/enums/standard-message-type';

@Injectable()
export class WebSocketService {

  private stompClient;
  private privateSubject = new Subject<any>();
  private broadcastSubject = new Subject<any>();
  private broadcastSubjectMarkerEvents = new Subject<any>();

  private privateSubscription: Subscription;
  private broadcastSubscription: Subscription;
  private markerEventSubscription: Subscription;

  constructor() {
  }

  connectToSocket() {
    const sockJs = new SockJS(`${ServerUrls.SOCKET_URL}`);
    this.stompClient = Stomp.over(sockJs);
    this.stompClient.debug = () => {};
    const username = localStorage.getItem(LocalStorageConstants.USERNAME);
    this.stompClient.connect({user: username}, () => {
        console.log('connected!');
        this.privateSubscription = this.stompClient.subscribe(`/user/${username}/queue/private/`, (message) => {
            this.privateSubject.next(message);
          },
          (error) => {
            console.log(error);
          });

        this.broadcastSubscription = this.stompClient.subscribe(`/topic/broadcast`, (message) => {
            this.broadcastSubject.next(message);
          },
          (error) => {
            console.log(error);
          });

        this.markerEventSubscription = this.stompClient.subscribe(`/topic/broadcast/marker-events`, (message) => {
            this.broadcastSubjectMarkerEvents.next(message);
          },
          (error) => {
            console.log(error);
          });

        const msg = MapService.prepareBroadcastStandardMessage(
          localStorage.getItem(LocalStorageConstants.USERNAME),
          StandardMessageType.LOGGED_IN,
          '');
        this.sendBroadcastMessage(msg);
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

  disconnectSocket(username: string) {
    console.log('Disconnecting...');

    const msg = MapService.prepareBroadcastStandardMessage(username, StandardMessageType.LOGGED_OUT, '');
    this.sendBroadcastMessage(msg);

    this.privateSubscription.unsubscribe();
    this.broadcastSubscription.unsubscribe();
    this.markerEventSubscription.unsubscribe();
    this.stompClient.disconnect(() => {
      console.log('Disconnected!');
    });
  }

  sendPrivateMessage(message: ChatMessage) {
    this.stompClient.send('/app/private/send', {}, JSON.stringify(message));
  }

  sendPrivateChatRoomMessage(message: ChatMessage) {
    this.stompClient.send('/app/private/chat-room/send', {}, JSON.stringify(message));
  }

  sendPrivateNotificationMessage(message: ChatMessage) {
    this.stompClient.send('/app/private/notification/send', {}, JSON.stringify(message));
  }

  sendBroadcastMessage(message: StandardMessage) {
    this.stompClient.send('/app/broadcast/send', {}, JSON.stringify(message));
  }

  sendBroadcastMarkerEvents(messages: MarkerEventMessage[]) {
    this.stompClient.send('/app/broadcast/marker-events/send', {}, JSON.stringify(messages));
  }
}
