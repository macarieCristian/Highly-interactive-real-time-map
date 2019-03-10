import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LocalStorageConstants} from '../constants/local-storage-constants';

export class TokenHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem(LocalStorageConstants.TOKEN);
    if (token && !req.url.includes('foursquare')) {
      const cloneRequest = req.clone({
        setHeaders: {'Authorization': `Bearer ${token}`}
      });
      return next.handle(cloneRequest);
    }
    return next.handle(req);
  }
}
