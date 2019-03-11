import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppUser} from '../../shared/model/app-user';
import {UserChat} from '../../shared/model/util-model/user-chat';
import {LocalStorageConstants} from '../../shared/constants/local-storage-constants';
import {ChatService} from '../../shared/service/chat.service';
import {ChatMessage} from '../../shared/model/web-socket-model/chat-message';
import {MapService} from '../service/map.service';
import {EventType} from '../../shared/model/web-socket-model/event-type';
import {WebSocketService} from '../../shared/service/web-socket.service';
import {Subscription} from 'rxjs';
import {TransportService} from '../../shared/service/transport.service';
import {StandardMessage} from '../../shared/model/web-socket-model/standard-message';
import {UserStatusType} from '../../shared/model/user-status-type';
import {StandardMessageType} from '../../shared/model/web-socket-model/standard-message-type';
import {AttachmentCustom} from '../../shared/model/attachment-custom';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  chatEventsSubscription: Subscription;
  broadcastMessagesSubscription: Subscription;

  // current logged user
  appUser: AppUser;

  sideChat = false;

  // list of open chats
  openChatList: AppUser[];

  // messages for chats
  chatListMessagesMap: Map<string, UserChat>;

  // users in scan area
  scanAreaUsers: AppUser[];

  notes = [
    {
      name: 'Andrei Numefoartelung',
      updated: new Date('1/17/16'),
      photo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Alberto_conversi_profile_pic.jpg'
    },
    {
      name: 'Bogdan Florina',
      updated: new Date('1/28/16'),
      photo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Alberto_conversi_profile_pic.jpg'
    }
  ];

  constructor(private chatService: ChatService,
              private webSocketService: WebSocketService,
              private transportService: TransportService) {
  }

  ngOnInit() {
    this.scanAreaUsers = [];
    this.openChatList = [];
    this.chatListMessagesMap = new Map<string, UserChat>();
    this.setupChatEventsListener();
    this.setupBroadcastMessagesListener();
  }

  ngOnDestroy() {
    this.cleanUp();
  }

  cleanUp() {
    this.broadcastMessagesSubscription.unsubscribe();
    this.chatEventsSubscription.unsubscribe();
  }

  openChat(user: AppUser) {
    if (!this.openChatList.find(u => u.username === user.username)) {
      this.openChatList.push(user);
      this.chatService.getConversation(localStorage.getItem(LocalStorageConstants.USERNAME), user.username)
        .subscribe(messages => {
          this.chatListMessagesMap.set(user.username, new UserChat(messages));
        });
    }
  }

  closeChat(user: AppUser) {
    this.openChatList = this.openChatList.filter(u => u.username !== user.username);
    this.chatListMessagesMap.delete(user.username);
  }

  private setupChatEventsListener() {
    this.chatEventsSubscription = this.transportService.chatEventsStream()
      .subscribe(message => {
        switch (message.eventType) {
          case (EventType.CHAT_MESSAGE): {
            this.handleChatMessageReceivedEvent(message);
            break;
          }
          case (EventType.TYPING): {
            this.handleReceivedTypingEvent(message);
            break;
          }
          case (EventType.TYPING_STOP): {
            this.handleReceivedTypingStopEvent(message);
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  private handleReceivedTypingEvent(message: ChatMessage) {
    if (this.openChatList.find(user => user.username === message.source)) {
      this.chatListMessagesMap.get(message.source).typing = true;
    }
  }

  private handleReceivedTypingStopEvent(message: ChatMessage) {
    if (this.openChatList.find(user => user.username === message.source)) {
      this.chatListMessagesMap.get(message.source).typing = false;
    }
  }

  private handleChatMessageReceivedEvent(message: ChatMessage) {
    if (this.chatListMessagesMap.has(message.source)) {
      // add notif
      this.chatListMessagesMap.get(message.source).messages.push(message);
    }
  }

  private setupBroadcastMessagesListener() {
    this.broadcastMessagesSubscription = this.transportService.broadcastMessagesStream()
      .subscribe(message => {
        switch (message.standardMessageType) {
          case (StandardMessageType.LOGGED_IN): {
            this.changeUserStatus(message, UserStatusType.ONLINE);
            break;
          }
          case (StandardMessageType.LOGGED_OUT): {
            this.changeUserStatus(message, UserStatusType.OFFLINE);
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  // logged in user can't be in this list
  private changeUserStatus(message: StandardMessage, status: string) {
    for (const user of this.scanAreaUsers) {
      if (user.username === message.source) {
        user.statusType = status;
        break;
      }
    }
  }

  sendChatMessage(destination: string, eventType: string, message: string) {
    const msg = MapService.prepareChatMessage(localStorage.getItem(LocalStorageConstants.USERNAME), destination, eventType, message);
    this.webSocketService.sendPrivateMessage(msg);
    this.chatListMessagesMap.get(destination).messages.push(msg);
  }

  onKeyUpEventHandler(destination: string, typing: string) {
    const lastLen = this.chatListMessagesMap.get(destination).lastMsgLength;
    const actualLen = typing.length;
    const msg = MapService.prepareChatMessage(localStorage.getItem(LocalStorageConstants.USERNAME), destination, EventType.TYPING, '');
    if (actualLen > 0 && lastLen === 0) {
      console.log('send typing');
      this.webSocketService.sendPrivateMessage(msg);
      this.chatListMessagesMap.get(destination).lastMsgLength = actualLen;
    } else if (actualLen === 0 && lastLen > 0) {
      console.log('stop');
      msg.eventType = EventType.TYPING_STOP;
      this.webSocketService.sendPrivateMessage(msg);
      this.chatListMessagesMap.get(destination).lastMsgLength = actualLen;
    }
  }

  setUpPicture(attachement: AttachmentCustom): string {
    return `data:${attachement.type};base64,${attachement.content}`;
  }

}
