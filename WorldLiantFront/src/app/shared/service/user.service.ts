import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AppUser} from '../model/app-user';
import {ServerUrls} from '../constants/server-urls';
import {LocationCustom} from '../model/location-custom';
import {Scan} from '../model/scan';

@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient) {
  }

  loadImage(username: string): Observable<Blob> {
    return this.httpClient.get(`${ServerUrls.PROFILE_PIC}${username}`, {responseType: 'blob'});
  }

  getPersonalInfoWithLocations(username: string): Observable<AppUser> {
    return this.httpClient.get<AppUser>(`${ServerUrls.PERSONAL_INFO_DL}${username}`);
  }

  getPersonalInfoWithPic(username: string): Observable<AppUser> {
    return this.httpClient.get<AppUser>(`${ServerUrls.PERSONAL_INFO_PIC}${username}`);
  }

  getUsersScan(lat: number, lng: number, rad: number): Observable<AppUser[]> {
    const params = {
      lat: `${lat}`,
      lng: `${lng}`,
      rad: `${rad}`
    };
    return this.httpClient.get<AppUser[]>(`${ServerUrls.SCAN_USERS}`, {params: params});
  }

  saveDesiredLocation(userId: number, desiredLocation: LocationCustom): Observable<number> {
    return this.httpClient.post<number>(`${ServerUrls.ADD_DESIRED_LOCATION}${userId}`, desiredLocation);
  }

  updateDesiredLocations(userId: number, desiredLocations: LocationCustom[]): Observable<boolean> {
    return this.httpClient.put<boolean>(`${ServerUrls.DESIRED_LOCATIONS}${userId}`, desiredLocations);
  }

  deleteDesiredLocations(userId: number, locationsIds: number[]): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${ServerUrls.DESIRED_LOCATIONS}${userId}/${locationsIds}`);
  }

  getScanAreas(username: string): Observable<Scan[]> {
    return this.httpClient.get<Scan[]>(`${ServerUrls.SCAN_AREAS}${username}`);
  }

  logout(username: string): Observable<boolean> {
    return this.httpClient.post<boolean>(`${ServerUrls.LOGOUT}${username}`, {});
  }
}
