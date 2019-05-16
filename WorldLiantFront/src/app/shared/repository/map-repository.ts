import {Injectable} from '@angular/core';
import {CustomMarkerDetails} from '../model/util-model/custom-marker-details';

@Injectable({providedIn: 'root'})
export class MapRepository {
  leafletToRealId: Map<string, CustomMarkerDetails>;

  constructor() {
    this.leafletToRealId = new Map<string, CustomMarkerDetails>();
  }

  cleanUp() {
    this.leafletToRealId = new Map<string, CustomMarkerDetails>();
  }

  getLeafletIdByRealId(id: number): string {
    for (const key of Array.from(this.leafletToRealId.keys())) {
      const value = this.leafletToRealId.get(key).id;
      if (id === value) {
        return key;
      }
    }
    return undefined;
  }
}
