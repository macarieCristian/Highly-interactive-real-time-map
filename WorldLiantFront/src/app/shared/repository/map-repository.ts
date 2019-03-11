import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class MapRepository {
  leafletToRealId: Map<string, number>;

  constructor() {
    this.leafletToRealId = new Map<string, number>();
  }

  cleanUp() {
    this.leafletToRealId = new Map<string, number>();
  }

  getLeafletIdByRealId(id: number): string {
    for (const key of Array.from(this.leafletToRealId.keys())) {
      const value = this.leafletToRealId.get(key);
      if (id === value) {
        return key;
      }
    }
    return undefined;
  }
}
