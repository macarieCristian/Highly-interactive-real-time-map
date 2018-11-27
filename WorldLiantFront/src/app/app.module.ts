import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {LoginComponent} from './login/login.component';
import {ErrorComponent} from './error/error.component';
import {FormsModule} from '@angular/forms';
import {LoginService} from './shared/service/login.service';
import {HttpClientModule} from '@angular/common/http';
import {RecaptchaModule} from 'angular-google-recaptcha';
import {Constants} from './shared/constants/constants';
import { SingupComponent } from './sing-up/singup.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ErrorComponent,
    SingupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    HttpClientModule,
    RecaptchaModule.forRoot({
      siteKey: Constants.SITE_KEY,
    }),
  ],
  providers: [LoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
