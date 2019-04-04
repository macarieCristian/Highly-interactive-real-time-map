import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Scan} from '../model/scan';
import {ServerUrls} from '../constants/server-urls';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ScanAreaService {

  constructor(private httpClient: HttpClient) {

  }

  saveScanArea(userId: number, scanArea: Scan): Observable<number> {
    return this.httpClient.post<number>(`${ServerUrls.SCAN_AREA}${userId}`, scanArea);
  }

  deleteScanArea(username: string, scanId: number): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${ServerUrls.SCAN_AREA}${username}/${scanId}`);
  }
}
