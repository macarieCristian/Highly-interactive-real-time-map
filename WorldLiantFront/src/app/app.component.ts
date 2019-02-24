import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebSocketService} from './shared/service/web-socket.service';
import {UtilityService} from './shared/service/utility.service';
import {TransportService} from './shared/service/transport.service';
import {WebSocketCommand} from './shared/constants/web-socket-command';
import {EventType} from './shared/model/web-socket-model/event-type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private socketService: WebSocketService,
              private transportService: TransportService) {
  }

  ngOnInit(): void {
    this.connectIfRequired();
    if (UtilityService.isUserLoggedIn()) {
      this.transportService.webSocketCommandSink(WebSocketCommand.CONNECT_AND_SUBSCRIBE_ALL);
    }
  }

  private connectIfRequired() {
    this.transportService.webSocketCommandStream()
      .subscribe(command => {
        switch (command) {
          case (WebSocketCommand.CONNECT_AND_SUBSCRIBE_ALL): {
            this.socketService.connectToSocket();
            this.socketService.privateChannel()
              .subscribe(message => console.log(message),
                err => console.log(err));
            this.socketService.broadcastChannel()
              .subscribe(message => console.log(message),
                err => console.log(err));
            this.socketService.broadcastMarkerEventsChannel()
              .subscribe(wrapper => {
                  console.log(wrapper);
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
            this.socketService.disconnectSocket();
            break;
          }
        }
      });
  }

  ngOnDestroy(): void {
    console.log('destroyed');
  }

  // disconnect() {
  //   this.transportService.webSocketCommandSink(WebSocketCommand.DISCONNECT);
  // }
  //
  // sendPrivateMess(to: string, message: string) {
  //   this.socketService.sendPrivateMessage({destination: to, content: message});
  // }
  //
  // sendBroadcastMess(message: string) {
  //   this.socketService.sendBroadcastMessage({content: message});
  // }
}
