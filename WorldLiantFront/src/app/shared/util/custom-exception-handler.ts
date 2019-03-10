import {ErrorHandler, Injectable, Injector, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {ToastrUtilService} from '../service/toastr-util.service';
import {BAD_REQUEST, FORBIDDEN, NOT_FOUND, UNAUTHORIZED} from 'http-status-codes';
import {ClientUrls} from '../constants/client-urls';
import {UtilExceptionMessage} from '../constants/util-exception-message';
import {TransportService} from '../service/transport.service';
import {WebSocketCommand} from '../constants/web-socket-command';
import {WebSocketService} from '../service/web-socket.service';
import {LocalStorageConstants} from '../constants/local-storage-constants';


@Injectable()
export class CustomExceptionHandler implements ErrorHandler {
  private router: Router;
  private toastrUtilService;
  private webSocketService;

  constructor(private injector: Injector,
              private ngZone: NgZone) {
  }

  handleError(error: any): void {
    this.router = this.injector.get(Router);
    this.webSocketService = this.injector.get(WebSocketService);
    const httpErrorCode = error.status;
    if (httpErrorCode !== 0) {
      this.toastrUtilService = this.injector.get(ToastrUtilService);
      switch (httpErrorCode) {
        case NOT_FOUND: {
          this.toastrUtilService.displayErrorToastr('Error', UtilExceptionMessage.RESOURCE_NOT_FOUND);
          break;
        }
        case UNAUTHORIZED:
        case FORBIDDEN:
        case BAD_REQUEST: {
          const badRequestMsg = error.error.message ? error.error.message : UtilExceptionMessage.GENERIC_MESSAGE;
          this.toastrUtilService.displayErrorToastr('Error', badRequestMsg);
          break;
        }

        default: {
          this.toastrUtilService.displayErrorToastr('Error', UtilExceptionMessage.GENERIC_MESSAGE);
          break;
        }
      }
    } else {
      this.webSocketService.disconnectSocket(localStorage.getItem(LocalStorageConstants.USERNAME));
      localStorage.clear();
      this.router.navigateByUrl(ClientUrls.LOGIN_PAGE);
    }
  }
}
