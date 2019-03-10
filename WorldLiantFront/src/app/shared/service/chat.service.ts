import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ChatMessage} from '../model/web-socket-model/chat-message';
import {ServerUrls} from '../constants/server-urls';

@Injectable()
export class ChatService {

  constructor(private httpClient: HttpClient) {
  }

  getConversation(source: string, destination: string): Observable<ChatMessage[]> {
    const params = new HttpParams()
      .set('source', source)
      .set('destination', destination);
    return this.httpClient.get<ChatMessage[]>(ServerUrls.CONVERSATION, {params: params});
  }
}
