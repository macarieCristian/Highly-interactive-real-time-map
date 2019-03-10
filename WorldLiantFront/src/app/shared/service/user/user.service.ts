import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AppUser} from '../../model/app-user';
import {ServerUrls} from '../../constants/server-urls';
import {LocationCustom} from '../../model/location-custom';

@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient) {
  }

  getImage(imageUrl: string): Observable<Blob> {
    return this.httpClient.get(imageUrl, {responseType: 'blob'});
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

  logout(username: string): Observable<boolean> {
    return this.httpClient.post<boolean>(`${ServerUrls.LOGOUT}${username}`, {});
  }
}
