import {Component, OnInit} from '@angular/core';
import {AppUser} from '../shared/model/app-user';
import {Constants} from '../shared/constants/constants';
import {LocationCustom} from '../shared/model/location-custom';
import {LoginService} from '../shared/service/login.service';
import {ToastrUtilService} from '../shared/service/toastr-util.service';
import {Router} from '@angular/router';
import {ClientUrls} from '../shared/constants/client-urls';
import {UtilityService} from '../shared/service/utility.service';

@Component({
  selector: 'app-singup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SingupComponent implements OnInit {
  rePass: string;
  model: AppUser = new AppUser();
  genders = Constants.genderList;
  imageSrc: string;
  imageFile: File;

  constructor(private loginService: LoginService,
              private router: Router,
              private utilityService: UtilityService,
              private toastrUtil: ToastrUtilService) {
  }

  ngOnInit() {
    this.model.gender = this.genders[2].value;
    this.model.homeLocation = new LocationCustom();
  }

  signUp() {
    this.utilityService.getGeocoding(this.model.homeLocation.country,
      this.model.homeLocation.county,
      this.model.homeLocation.city)
      .subscribe(res => {
        if (res.length === 0) {
          this.toastrUtil.displayErrorToastr('Location error', 'The location you entered does not exist.');
        } else {
          this.model.homeLocation.longitude = res[0].lon;
          this.model.homeLocation.latitude = res[0].lat;
          this.loginService.signUp(this.model, this.imageFile)
            .subscribe(result => {
              this.router.navigateByUrl(ClientUrls.LOGIN_PAGE);
            },
              err => console.log(err));
        }
      });
  }

  uploadImg(event) {
    if (event.target.files && event.target.files[0]) {
      this.imageFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        this.imageSrc = reader.result.toString();
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  displayFormError() {
    this.toastrUtil.displayErrorToastr('Input not valid', 'Some fields are not valid, please cheek them again.');
  }
}
