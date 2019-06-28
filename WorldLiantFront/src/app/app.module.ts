import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, Injector, NgModule} from '@angular/core';
import {createCustomElement} from '@angular/elements';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {LoginComponent} from './login/login.component';
import {ErrorComponent} from './error/error.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginService} from './shared/service/login.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {RecaptchaModule} from 'angular-google-recaptcha';
import {Constants} from './shared/constants/constants';
import {SingupComponent} from './sign-up/signup.component';
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
import {UserService} from './shared/service/user.service';
import {CustomExceptionHandler} from './shared/util/custom-exception-handler';
import {ngxLoadingAnimationTypes, NgxLoadingModule} from 'ngx-loading';
import {MapService} from './home/service/map.service';
import {ChatService} from './shared/service/chat.service';
import {MapRepository} from './shared/repository/map-repository';
import {ChatComponent} from './home/chat/chat.component';
import {NgxAutoScrollModule} from 'ngx-auto-scroll';
import {ScanAreaComponent} from './home/scan-area/scan-area.component';
import {ScanAreaRepository} from './shared/repository/scan-area-repository';
import {ScanAreaService} from './shared/service/scan-area.service';
import {AddEventComponent} from './home/add-event/add-event.component';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {EventService} from './shared/service/event.service';
import {EventPopupComponent} from './shared/util/components/event-popup/event-popup.component';
import {NgxGalleryModule} from 'ngx-gallery';
import {GalleryPreviewComponent} from './shared/util/components/gallery-preview/gallery-preview.component';
import {UserLocationPopupComponent} from './shared/util/components/user-location-popup/user-location-popup.component';
import {VenuePopupComponent} from './shared/util/components/venue-popup/venue-popup.component';
import {LocationDetailsService} from './shared/service/location-details.service';
import {AuthService} from './shared/service/auth.service';
import {AuthGuard} from './shared/util/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ErrorComponent,
    SingupComponent,
    HomeComponent,
    ChatComponent,
    ScanAreaComponent,
    AddEventComponent,
    EventPopupComponent,
    GalleryPreviewComponent,
    UserLocationPopupComponent,
    VenuePopupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MDBBootstrapModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
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
    NgxAutoScrollModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxGalleryModule
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
    ScanAreaRepository,
    ScanAreaService,
    EventService,
    LocationDetailsService,
    AuthService,
    AuthGuard,
    {provide: HTTP_INTERCEPTORS, useClass: TokenHttpInterceptor, multi: true},
    {provide: ErrorHandler, useClass: CustomExceptionHandler}
  ],
  bootstrap: [AppComponent],
  entryComponents: [EventPopupComponent, UserLocationPopupComponent, VenuePopupComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const eventPopupComp = createCustomElement(EventPopupComponent, {injector});
    customElements.define('event-popup-element', eventPopupComp);
    const userLocationPopupComp = createCustomElement(UserLocationPopupComponent, {injector});
    customElements.define('user-location-popup-element', userLocationPopupComp);
    const venueLocationPopupComp = createCustomElement(VenuePopupComponent, {injector});
    customElements.define('venue-popup-element', venueLocationPopupComp);
  }
}
