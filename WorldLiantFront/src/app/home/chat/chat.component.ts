import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppUser} from '../../shared/model/app-user';
import {ChatContainer} from '../../shared/model/util-model/user-chat';
import {LocalStorageConstants} from '../../shared/constants/local-storage-constants';
import {ChatService} from '../../shared/service/chat.service';
import {ChatMessage} from '../../shared/model/web-socket-model/chat-message';
import {MapService} from '../service/map.service';
import {EventType} from '../../shared/model/enums/event-type';
import {WebSocketService} from '../../shared/service/web-socket.service';
import {Subscription} from 'rxjs';
import {TransportService} from '../../shared/service/transport.service';
import {StandardMessage} from '../../shared/model/web-socket-model/standard-message';
import {UserStatusType} from '../../shared/model/enums/user-status-type';
import {StandardMessageType} from '../../shared/model/enums/standard-message-type';
import {AttachmentCustom} from '../../shared/model/attachment-custom';
import {UserService} from '../../shared/service/user.service';
import {EventCustom} from '../../shared/model/event-custom';

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

  // list of open user chats
  openChatListUsers: AppUser[];
  // list of open event chats
  openChatListEvents: EventCustom[];

  // messages for user chats
  chatListMessagesMapUsers: Map<string, ChatContainer>;
  // messages for event chats
  chatListMessagesMapEvents: Map<number, ChatContainer>;

  // users in scan area
  scanAreaUsers: AppUser[];
  // events in scan area
  scanAreaEvents: EventCustom[];
  // added events
  addedEvents: EventCustom[];

  constructor(private chatService: ChatService,
              private userService: UserService,
              private webSocketService: WebSocketService,
              private transportService: TransportService) {
  }

  ngOnInit() {
    this.scanAreaUsers = [];
    this.scanAreaEvents = [];
    this.addedEvents = [];
    this.openChatListUsers = [];
    this.openChatListEvents = [];
    this.chatListMessagesMapUsers = new Map<string, ChatContainer>();
    this.chatListMessagesMapEvents = new Map<number, ChatContainer>();
    this.setupChatEventsListener();
    this.setupBroadcastMessagesListener();
    this.setupOpenChatListeners();
  }

  ngOnDestroy() {
    this.cleanUp();
  }

  cleanUp() {
    this.broadcastMessagesSubscription.unsubscribe();
    this.chatEventsSubscription.unsubscribe();
  }

  openChat(user: AppUser, messagesToAppend?: ChatMessage[]) {
    if (!this.openChatListUsers.find(u => u.username === user.username)) {
      this.openChatListUsers.push(user);
      this.chatService.getConversation(localStorage.getItem(LocalStorageConstants.USERNAME), user.username)
        .subscribe(messages => {
          if (!messagesToAppend) {
            this.chatListMessagesMapUsers.set(user.username, new ChatContainer(messages));
          } else {
            this.chatListMessagesMapUsers.set(user.username, new ChatContainer(messages.concat(messagesToAppend)));
          }
        });
    }
  }

  openChatEvent(event: EventCustom, messagesToAppend?: ChatMessage[]) {
    if (!this.openChatListEvents.find(e => e.id === event.id)) {
      this.openChatListEvents.push(event);
      const msg = MapService.prepareChatMessage(
        localStorage.getItem(LocalStorageConstants.USERNAME),
        `${event.id}`,
        EventType.CHAT_ROOM_NEW_PARTICIPANT,
        '');
      this.chatService.getConversationEvent(event.id)
        .subscribe(messages => {
          if (!messagesToAppend) {
            this.chatListMessagesMapEvents.set(event.id, new ChatContainer(messages));
          } else {
            this.chatListMessagesMapEvents.set(event.id, new ChatContainer(messages.concat(messagesToAppend)));
          }
          this.webSocketService.sendPrivateChatRoomMessage(msg);
        });
    }
  }

  closeChat(user: AppUser) {
    this.openChatListUsers = this.openChatListUsers.filter(u => u.username !== user.username);
    this.chatListMessagesMapUsers.delete(user.username);
  }

  closeChatEvent(event: EventCustom) {
    this.openChatListEvents = this.openChatListEvents.filter(e => e.id !== event.id);
    this.chatListMessagesMapEvents.delete(event.id);
    const msg = MapService.prepareChatMessage(
      localStorage.getItem(LocalStorageConstants.USERNAME),
      `${event.id}`,
      EventType.CHAT_ROOM_PARTICIPANT_LEFT,
      '');
    this.webSocketService.sendPrivateChatRoomMessage(msg);
  }

  private setupOpenChatListeners() {
    this.transportService.openChatStream()
      .subscribe(user => {
        this.openChat(user);
      });
    this.transportService.openChatEventStream()
      .subscribe(event => {
        this.openChatEvent(event);
      });
  }

  private setupChatEventsListener() {
    this.chatEventsSubscription = this.transportService.chatEventsStream()
      .subscribe(message => {
        switch (message.eventType) {
          case (EventType.CHAT_MESSAGE):
          case (EventType.CHAT_ROOM_MESSAGE): {
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
          case (EventType.CHAT_ROOM_TYPING): {
            this.handleReceivedChatRoomTypingEvent(message);
            break;
          }
          case (EventType.CHAT_ROOM_TYPING_STOP): {
            this.handleReceivedChatRoomTypingStopEvent(message);
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  private handleReceivedTypingEvent(message: ChatMessage) {
    const chatContainer = this.chatListMessagesMapUsers.get(message.source);
    if (chatContainer) {
      chatContainer.typing = true;
    }
  }

  private handleReceivedTypingStopEvent(message: ChatMessage) {
    const chatContainer = this.chatListMessagesMapUsers.get(message.source);
    if (chatContainer) {
      chatContainer.typing = false;
    }
  }

  private handleReceivedChatRoomTypingEvent(message: ChatMessage) {
    const chatContainer = this.chatListMessagesMapEvents.get(+message.destination);
    if (chatContainer) {
      chatContainer.usersTyping += 1;
    }
  }

  private handleReceivedChatRoomTypingStopEvent(message: ChatMessage) {
    const chatContainer = this.chatListMessagesMapEvents.get(+message.destination);
    if (chatContainer && chatContainer.usersTyping > 0) {
      chatContainer.usersTyping -= 1;
    }
  }

  private handleChatMessageReceivedEvent(message: ChatMessage) {
    if (message.eventType === EventType.CHAT_MESSAGE) {
      if (this.chatListMessagesMapUsers.has(message.source)) {
        // add notif
        this.chatListMessagesMapUsers.get(message.source).messages.push(message);
      } else {
        this.userService.getPersonalInfoWithPic(message.source)
          .subscribe(user => {
            this.openChat(user);
          });
      }
    } else if (message.eventType === EventType.CHAT_ROOM_MESSAGE) {
      if (this.chatListMessagesMapEvents.has(+message.destination)) {
        this.chatListMessagesMapEvents.get(+message.destination).messages.push(message);
      } else {
        alert('open event chat');
      }
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

  // current user can't be in this list
  private changeUserStatus(message: StandardMessage, status: string) {
    for (const user of this.scanAreaUsers) {
      if (user.username === message.source) {
        user.statusType = status;
        break;
      }
    }
    for (const user of this.openChatListUsers) {
      if (user.username === message.source) {
        user.statusType = status;
        break;
      }
    }
  }

  sendChatMessage(destination: string, eventType: string, message: string) {
    const msg = MapService.prepareChatMessage(localStorage.getItem(LocalStorageConstants.USERNAME), destination, eventType, message);
    this.webSocketService.sendPrivateMessage(msg);
    this.chatListMessagesMapUsers.get(destination).messages.push(msg);
  }

  sendChatRoomMessage(destination: number, eventType: string, message: string) {
    const msg = MapService.prepareChatMessage(localStorage.getItem(LocalStorageConstants.USERNAME), `${destination}`, eventType, message);
    this.webSocketService.sendPrivateChatRoomMessage(msg);
    this.chatListMessagesMapEvents.get(destination).messages.push(msg);
  }

  onKeyUpEventHandler(destination: string, typing: string) {
    const lastLen = this.chatListMessagesMapUsers.get(destination).lastMsgLength;
    const actualLen = typing.length;
    if (actualLen > 0 && lastLen === 0) {
      console.log('send typing');
      const msg = MapService.prepareChatMessage(
        localStorage.getItem(LocalStorageConstants.USERNAME),
        destination,
        EventType.TYPING,
        '');
      this.webSocketService.sendPrivateMessage(msg);
      this.chatListMessagesMapUsers.get(destination).lastMsgLength = actualLen;
    } else if (actualLen === 0 && lastLen > 0) {
      console.log('stop');
      const msg = MapService.prepareChatMessage(
        localStorage.getItem(LocalStorageConstants.USERNAME),
        destination,
        EventType.TYPING_STOP,
        '');
      this.webSocketService.sendPrivateMessage(msg);
      this.chatListMessagesMapUsers.get(destination).lastMsgLength = actualLen;
    }
  }

  onKeyUpEventHandlerChatRoom(destination: number, typing: string) {
    const lastLen = this.chatListMessagesMapEvents.get(destination).lastMsgLength;
    const actualLen = typing.length;
    if (actualLen > 0 && lastLen === 0) {
      console.log('send typing');
      const msg = MapService.prepareChatMessage(
        localStorage.getItem(LocalStorageConstants.USERNAME),
        `${destination}`,
        EventType.CHAT_ROOM_TYPING,
        '');
      this.webSocketService.sendPrivateChatRoomMessage(msg);
      this.chatListMessagesMapEvents.get(destination).lastMsgLength = actualLen;
    } else if (actualLen === 0 && lastLen > 0) {
      console.log('stop');
      const msg = MapService.prepareChatMessage(
        localStorage.getItem(LocalStorageConstants.USERNAME),
        `${destination}`,
        EventType.CHAT_ROOM_TYPING_STOP,
        '');
      this.webSocketService.sendPrivateChatRoomMessage(msg);
      this.chatListMessagesMapEvents.get(destination).lastMsgLength = actualLen;
    }
  }

  setUpPicture(attachement: AttachmentCustom): string {
    if (attachement.photoSource) {
      return attachement.photoSource;
    } else {
      return `data:${attachement.type};base64,${attachement.content}`;
    }
  }

}
