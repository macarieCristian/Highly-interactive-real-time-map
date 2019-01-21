import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastrUtilService {

  constructor(private toastrService: ToastrService) { }

  displayErrorToastr(title: string, message: string) {
    this.toastrService.error(message, title, {
      closeButton: false,
      timeOut: 5000,
      extendedTimeOut: 3000,
      progressBar: true,
      positionClass: 'toast-bottom-right'
    });
  }
}
