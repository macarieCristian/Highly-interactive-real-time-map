import {Injectable} from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import {LocalStorageConstants} from '../constants/local-storage-constants';

@Injectable()
export class AuthService {

  constructor() {
  }

  private static getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  isTokenExpired(token?: string): boolean {
    if (!token) {
      return false;
    }

    const date = AuthService.getTokenExpirationDate(token);
    if (date === undefined || date === null) {
      return false;
    }
    return date.valueOf() <= new Date().valueOf();
  }
}
