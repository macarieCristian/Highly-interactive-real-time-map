import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppUserCredentials} from '../model/app-user-credentials';
import {ServerUrls} from '../constants/server-urls';
import {Token} from '../model/token';
import {Observable} from 'rxjs';
import {AppUser} from '../model/app-user';

@Injectable()
export class LoginService {

  constructor(private httpClient: HttpClient) {
  }

  login(body: AppUserCredentials): Observable<Token> {
    return this.httpClient
      .post<Token>(ServerUrls.LOGIN, body);
  }

  signUp(appUser: AppUser, profilePicture: File): Observable<boolean> {
    const formData = new FormData();
    const userBlob = new Blob([JSON.stringify(appUser)], { type: 'application/json'});
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
      formData.append('appUser', userBlob);
      return this.httpClient
        .post<boolean>(ServerUrls.REGISTER, formData);
    } else {
      formData.append('appUser', userBlob);
      return this.httpClient
        .post<boolean>(ServerUrls.REGISTER, formData);
    }
  }
}
