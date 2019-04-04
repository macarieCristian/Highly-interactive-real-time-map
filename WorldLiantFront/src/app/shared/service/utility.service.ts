import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Constants} from '../constants/constants';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable()
export class UtilityService {

  constructor(private httpClient: HttpClient) {
  }

  static isUserLoggedIn(): boolean {
    return localStorage.getItem('user') != null;
  }

  getGeocoding(country: string, county: string, city: string): Observable<any[]> {
    const params = new HttpParams()
      .set('country', country)
      .set('county', county)
      .set('city', city)
      .set('format', 'json');
    return this.httpClient
      .get<any[]>(Constants.SEARCH_GEOCODING_URL, {params: params});
  }

  getLocationDetailsReverseGeocoding(lat: number, lng: number): Observable<any> {
    const params = new HttpParams()
      .set('lat', `${lat}`)
      .set('lon', `${lng}`)
      .set('format', 'json');
    return this.httpClient
      .get<any>(Constants.REVERSE_GEOCODING_URL, {params: params});
  }


  getCarouselData(): any {
    return this.httpClient
      .get<any>('assets/carouseldata/carouseldata.json');
  }
}


