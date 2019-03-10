import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Constants} from '../constants/constants';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AppUser} from '../model/app-user';
import {ServerUrls} from '../constants/server-urls';

@Injectable()
export class UtilityService {

  constructor(private httpClient: HttpClient) {
  }

  static isUserLoggedIn(): boolean {
    return localStorage.getItem('user') != null;
  }

  getReverseGeocoding(country: string, county: string, city: string): Observable<any[]> {
    return this.httpClient
      .get<any[]>(Constants.REVERSE_GEOCODING_URL, {params: {country: country, county: county, city: city, format: 'json'}});
  }

  getCarouselData(): any {
    return this.httpClient
      .get<any>('assets/carouseldata/carouseldata.json');
  }
}


