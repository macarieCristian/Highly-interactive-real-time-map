import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppUserCredentials} from '../model/app-user-credentials';
import {ServerUrls} from '../constants/server-urls';
import {Token} from '../model/token';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient) {
  }

  getCarouselData(): any {
    return this.httpClient
      .get<any>('assets/carouseldata/carouseldata.json');
  }

  login(body: AppUserCredentials): Observable<Token> {
    return this.httpClient
      .post<Token>(`${ServerUrls.LOGIN}`, body);
  }
}
