import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {MarkerEventMessage} from '../model/web-socket-model/marker-event-message';
import {ChatMessage} from '../model/web-socket-model/chat-message';
import {StandardMessage} from '../model/web-socket-model/standard-message';

@Injectable()
export class TransportService {

  private subject = new Subject<string>();
  private subjectMarkerEvents = new Subject<MarkerEventMessage>();
  private subjectChatEvents = new Subject<ChatMessage>();
  private subjectBroadcastMessages = new Subject<StandardMessage>();
  private subjectModalConfirm = new Subject<any>();

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

  chatEventsStream(): Observable<ChatMessage> {
    return this.subjectChatEvents.asObservable();
  }

  chatEventsSink(message: ChatMessage) {
    this.subjectChatEvents.next(message);
  }

  broadcastMessagesStream(): Observable<StandardMessage> {
    return this.subjectBroadcastMessages.asObservable();
  }

  broadcastMessagesSink(message: StandardMessage) {
    this.subjectBroadcastMessages.next(message);
  }

  modalConfirmStream(): Observable<any> {
    return this.subjectModalConfirm.asObservable();
  }

  modalConfirmSink(message: any) {
    this.subjectModalConfirm.next(message);
  }

}
