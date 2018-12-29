import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AppUserCredentials} from '../shared/model/app-user-credentials';
import {LoginService} from '../shared/service/login.service';
import * as jwt_decode from 'jwt-decode';

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
              private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginService.getCarouselData()
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
          localStorage.setItem('user', res.sub);
          localStorage.setItem('auth', res.auth);
          localStorage.setItem('token', token.token);
        });
    }
  }

  dummyFun() {

  }
}