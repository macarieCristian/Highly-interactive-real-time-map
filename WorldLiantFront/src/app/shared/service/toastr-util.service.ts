import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class ToastrUtilService {

  private config = {
    closeButton: false,
    timeOut: 7000,
    extendedTimeOut: 3000,
    progressBar: true,
    positionClass: 'toast-bottom-right'
  };

  constructor(private toastrService: ToastrService) {
  }

  displayErrorToastr(title: string, message: string) {
    this.toastrService.error(message, title, this.config);
  }

  displayWarningToastr(title: string, message: string) {
    this.toastrService.warning(message, title, this.config);
  }

  displayInfoToastr(title: string, message: string) {
    this.toastrService.info(message, title, this.config);
  }

  displaySuccessToastr(title: string, message: string) {
    this.toastrService.success(message, title, this.config);
  }
}
