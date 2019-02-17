import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Constants} from '../constants/constants';
import {HttpClient} from '@angular/common/http';
import {ResponseContentType} from '@angular/http';

@Injectable({
  providedIn: 'root'
})
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


