import {ChatMessage} from '../web-socket-model/chat-message';

export class UserChat {
  messages: ChatMessage[];
  typing: boolean;
  lastMsgLength: number;


  constructor(messages: ChatMessage[]) {
    this.messages = messages;
    this.lastMsgLength = 0;
  }
}
