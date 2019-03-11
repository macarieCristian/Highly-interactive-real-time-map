import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {LoginComponent} from './login/login.component';
import {ErrorComponent} from './error/error.component';
import {FormsModule} from '@angular/forms';
import {LoginService} from './shared/service/user/login.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {RecaptchaModule} from 'angular-google-recaptcha';
import {Constants} from './shared/constants/constants';
import {SingupComponent} from './sing-up/singup.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDatepickerModule, MatListModule, MatNativeDateModule, MatStepperModule} from '@angular/material';
import {NgSelectModule} from '@ng-select/ng-select';
import {ToastrModule} from 'ngx-toastr';
import {ToastrUtilService} from './shared/service/toastr-util.service';
import {HomeComponent} from './home/home.component';
import {WebSocketService} from './shared/service/web-socket.service';
import {UtilityService} from './shared/service/utility.service';
import {TransportService} from './shared/service/transport.service';
import {TokenHttpInterceptor} from './shared/util/token-http-interceptor';
import {UserService} from './shared/service/user/user.service';
import {CustomExceptionHandler} from './shared/util/custom-exception-handler';
import {NgxLoadingModule} from 'ngx-loading';
import {MapService} from './home/service/map.service';
import {ChatService} from './shared/service/chat.service';
import {MapRepository} from './shared/repository/map-repository';
import { ChatComponent } from './home/chat/chat.component';
import {NgxAutoScrollModule} from 'ngx-auto-scroll';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ErrorComponent,
    SingupComponent,
    HomeComponent,
    ChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    HttpClientModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    RecaptchaModule.forRoot({
      siteKey: Constants.SITE_KEY,
    }),
    BrowserAnimationsModule,
    NgSelectModule,
    ToastrModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    NgxAutoScrollModule
  ],
  providers: [
    LoginService,
    MatDatepickerModule,
    ToastrUtilService,
    WebSocketService,
    UtilityService,
    TransportService,
    UserService,
    MapService,
    ChatService,
    MapRepository,
    {provide: HTTP_INTERCEPTORS, useClass: TokenHttpInterceptor, multi: true},
    {provide: ErrorHandler, useClass: CustomExceptionHandler},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
