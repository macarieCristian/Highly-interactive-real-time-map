import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AppUserCredentials} from '../shared/model/app-user-credentials';
import {LoginService} from '../shared/service/user/login.service';
import * as jwt_decode from 'jwt-decode';
import {ClientUrls} from '../shared/constants/client-urls';
import {TransportService} from '../shared/service/transport.service';
import {UtilityService} from '../shared/service/utility.service';
import {LocalStorageConstants} from '../shared/constants/local-storage-constants';
import {WebSocketCommand} from '../shared/constants/web-socket-command';
import {ToastrUtilService} from '../shared/service/toastr-util.service';
import {UtilExceptionMessage} from '../shared/constants/util-exception-message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  imgList: Array<any>;
  model: AppUserCredentials = new AppUserCredentials();
  recaptcha: boolean;

  constructor(private router: Router,
              private transportService: TransportService,
              private utilityService: UtilityService,
              private loginService: LoginService,
              private toastrUtilService: ToastrUtilService) {
  }

  ngOnInit() {
    this.utilityService.getCarouselData()
      .subscribe((data) => {
        this.imgList = this.shuffle(data.slidesData);
      });

  }

  shuffle(arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('Expected Array, got ' + typeof arr);
    }

    let rand;
    let tmp;
    let len = arr.length;
    const ret = arr.slice();

    while (len) {
      rand = Math.floor(Math.random() * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }
    return ret;
  }

  submitLogin() {
    if (this.model.username && this.model.password) {
      this.loginService.login(this.model)
        .subscribe((token) => {
            const res = jwt_decode(token.token);
            localStorage.setItem(LocalStorageConstants.USERNAME, res.sub);
            localStorage.setItem(LocalStorageConstants.ROLE, res.auth);
            localStorage.setItem(LocalStorageConstants.TOKEN, token.token);
            this.router.navigateByUrl(ClientUrls.HOME_PAGE);
            this.transportService.webSocketCommandSink(WebSocketCommand.CONNECT_AND_SUBSCRIBE_ALL);
          },
          err => {
            this.toastrUtilService.displayErrorToastr('Error', UtilExceptionMessage.LOGIN_FAILED);
          });
    }
  }

}
