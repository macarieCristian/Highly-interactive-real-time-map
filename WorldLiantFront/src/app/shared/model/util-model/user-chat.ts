import {ChatMessage} from '../web-socket-model/chat-message';

export class ChatContainer {
  messages: ChatMessage[];
  typing: boolean;
  lastMsgLength: number;
  usersTyping: number;


  constructor(messages: ChatMessage[]) {
    this.messages = messages;
    this.lastMsgLength = 0;
    this.usersTyping = 0;
  }
}
