import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ServerUrls} from '../constants/server-urls';
import {Observable} from 'rxjs';
import {LocationDetails} from '../model/location-details';

@Injectable({providedIn: 'root'})
export class LocationDetailsService {

  constructor(private httpClient: HttpClient) {
  }

  getLocationDetails(locationId: number): Observable<LocationDetails> {
    return this.httpClient.get<LocationDetails>(`${ServerUrls.LOCATION_DETAILS}${locationId}`);
  }

  saveLocationDetailsDescription(locationDetails: LocationDetails): Observable<boolean> {
    return this.httpClient.put<boolean>(ServerUrls.LOCATION_DETAILS_DESCRIPTION, locationDetails);
  }

  saveLocationDetailsAttachments(locationDetails: LocationDetails, files: File[]): Observable<number[]> {
    const formData = new FormData();
    const locationDetailsBlob = new Blob([JSON.stringify(locationDetails)], {type: 'application/json'});
    formData.append('locationDetails', locationDetailsBlob);
    for (const file of files) {
      formData.append('attachments', file);
    }
    return this.httpClient.post<number[]>(ServerUrls.LOCATION_DETAILS_ATTACHMENTS, formData);
  }
}
