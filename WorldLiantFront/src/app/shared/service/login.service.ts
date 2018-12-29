import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AppUserCredentials} from '../model/app-user-credentials';
import {ServerUrls} from '../constants/server-urls';
import {Token} from '../model/token';
import {Observable} from 'rxjs';
import {AppUser} from '../model/app-user';
import {Constants} from '../constants/constants';

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

  getReverseGeocoding(country: string, county: string, city: string): Observable<any[]> {
    return this.httpClient
      .get<any[]>(Constants.REVERSE_GEOCODING_URL, { params: { country: country, county: county, city: city, format: 'json' } });
  }
}