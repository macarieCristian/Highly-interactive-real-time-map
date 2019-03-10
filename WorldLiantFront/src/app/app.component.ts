import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebSocketService} from './shared/service/web-socket.service';
import {UtilityService} from './shared/service/utility.service';
import {TransportService} from './shared/service/transport.service';
import {WebSocketCommand} from './shared/constants/web-socket-command';
import {EventType} from './shared/model/web-socket-model/event-type';
import {LocalStorageConstants} from './shared/constants/local-storage-constants';
import {StandardMessageType} from './shared/model/web-socket-model/standard-message-type';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private privateChannelSubscription: Subscription;
  private broadcastChannelSubscription: Subscription;
  private markerEventsChannelSubscription: Subscription;
  private transportServiceSubscription: Subscription;

  constructor(private socketService: WebSocketService,
              private transportService: TransportService) {
  }

  ngOnInit() {
    this.connectIfRequired();
    if (UtilityService.isUserLoggedIn()) {
      this.transportService.webSocketCommandSink(WebSocketCommand.CONNECT_AND_SUBSCRIBE_ALL);
    }
  }

  ngOnDestroy() {
    this.privateChannelSubscription.unsubscribe();
    this.broadcastChannelSubscription.unsubscribe();
    this.markerEventsChannelSubscription.unsubscribe();
    this.transportServiceSubscription.unsubscribe();
  }

  private connectIfRequired() {
    this.transportServiceSubscription = this.transportService.webSocketCommandStream()
      .subscribe(command => {
        switch (command) {
          case (WebSocketCommand.CONNECT_AND_SUBSCRIBE_ALL): {
            this.socketService.connectToSocket();
            this.privateChannelSubscription = this.socketService.privateChannel()
              .subscribe(wrapper => {
                  const message = JSON.parse(wrapper.body);
                  switch (message.eventType) {
                    case EventType.CHAT_MESSAGE:
                    case EventType.TYPING_STOP:
                    case EventType.TYPING: {
                      this.transportService.chatEventsSink(message);
                      break;
                    }
                    default: {
                      break;
                    }
                  }
                },
                err => console.log(err));
            this.broadcastChannelSubscription = this.socketService.broadcastChannel()
              .subscribe(wrapper => {
                  const message = JSON.parse(wrapper.body);
                  switch (message.standardMessageType) {
                    case StandardMessageType.LOGGED_IN:
                    case StandardMessageType.LOGGED_OUT: {
                      this.transportService.broadcastMessagesSink(message);
                      break;
                    }
                    default: {
                      break;
                    }
                  }
                },
                err => console.log(err));
            this.markerEventsChannelSubscription = this.socketService.broadcastMarkerEventsChannel()
              .subscribe(wrapper => {
                  const messages = JSON.parse(wrapper.body);
                  messages.forEach(message => {
                    switch (message.eventType) {
                      case EventType.MARKER_CREATED:
                      case EventType.MARKER_DELETED:
                      case EventType.MARKER_UPDATED: {
                        this.transportService.markerEventsSink(message);
                        break;
                      }
                      default: {
                        break;
                      }
                    }
                  });
                },
                err => console.log(err));
            break;
          }
          case (WebSocketCommand.DISCONNECT): {
            this.privateChannelSubscription.unsubscribe();
            this.broadcastChannelSubscription.unsubscribe();
            this.markerEventsChannelSubscription.unsubscribe();
            const username = localStorage.getItem(LocalStorageConstants.USERNAME);
            this.socketService.disconnectSocket(username);
            break;
          }
        }
      });
  }
}
