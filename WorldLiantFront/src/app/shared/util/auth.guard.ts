import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../service/auth.service';
import {LocalStorageConstants} from '../constants/local-storage-constants';
import {ClientUrls} from '../constants/client-urls';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
              private authService: AuthService) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem(LocalStorageConstants.TOKEN);
    const username = localStorage.getItem(LocalStorageConstants.USERNAME);
    if (!token || !username || this.authService.isTokenExpired(token)) {
      this.router.navigateByUrl(ClientUrls.LOGIN_PAGE);
      return false;
    }
    return true;
  }
}
