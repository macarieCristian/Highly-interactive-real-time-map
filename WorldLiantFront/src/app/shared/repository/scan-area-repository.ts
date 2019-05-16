import {Injectable} from '@angular/core';
import {Constants} from '../constants/constants';
import {SearchOption} from '../model/util-model/search-option';

@Injectable({providedIn: 'root'})
export class ScanAreaRepository {
  userMarkers: Map<string, string>;
  venueMarkers: Set<string>;
  eventMarkers: Set<string>;
  scanArea: any;
  searchOptions: SearchOption[];


  constructor() {
    this.userMarkers = new Map<string, string>();
    this.venueMarkers = new Set<string>();
    this.eventMarkers = new Set<string>();
    // Forsquare search option
    this.searchOptions = [
      {
        name: 'Night Life',
        icon: 'fa fa-glass',
        value: false,
        id: Constants.NIGHT_LIFE_CATEGORY_ID,
      },
      {
        name: 'Eat&Drink',
        icon: 'fa fa-cutlery',
        value: false,
        id: Constants.FOOD_CATEGORY_ID,
      },
      {
        name: 'Universities',
        icon: 'fa fa-university',
        value: false,
        id: Constants.UNIVERSITY_CATEGORY_ID,
      },
      {
        name: 'Sports',
        icon: 'fa fa-futbol-o',
        value: false,
        id: Constants.SPORTS_CATEGORY_ID,
      },
      {
        name: 'Public events',
        icon: 'fa fa-calendar',
        value: false,
        id: Constants.PUBLIC_EVENTS_CATEGORY_ID,
      },
      {
        name: 'Travel&Transport',
        icon: 'fa fa-suitcase',
        value: false,
        id: Constants.TRAVEL_AND_TRANSPORT_CATEGORY_ID,
      },
    ];
  }

  cleanUp() {
    this.userMarkers = new Map<string, string>();
    this.venueMarkers = new Set<string>();
    this.eventMarkers = new Set<string>();
    this.scanArea = undefined;
  }

  existUser(username: string): boolean {
    return !!Array.from(this.userMarkers.values()).find(value => value === username);
  }

  getSelectedScanAreaOptionIds(): string {
    let res;
    const ids: string[] = this.searchOptions
      .filter(option => option.value === true)
      .map(option => option.id);
    if (ids.length > 0) {
      res = ids.join(',');
    } else {
      res = null;
    }
    return res;
  }

  setSearchOptions(searchOptions: string) {
    this.searchOptions = this.searchOptions.map(option => {
      option.value = searchOptions.includes(option.id);
      return option;
    });
  }

  clearSearchOptionValues() {
    this.searchOptions = this.searchOptions.map(option => {
      option.value = false;
      return option;
    });
  }
}
