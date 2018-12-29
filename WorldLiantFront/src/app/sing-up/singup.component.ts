import {Component, OnInit} from '@angular/core';
import {AppUser} from '../shared/model/app-user';
import {Constants} from '../shared/constants/constants';
import {LocationCustom} from '../shared/model/location-custom';
import {LoginService} from '../shared/service/login.service';
import {AttachmentCustom} from '../shared/model/attachment-custom';

@Component({
  selector: 'app-singup',
  templateUrl: './singup.component.html',
  styleUrls: ['./singup.component.scss']
})
export class SingupComponent implements OnInit {
  rePass: string;
  model: AppUser = new AppUser();
  genders = Constants.genderList;
  imageSrc: string;
  imageFile: File;

  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.model.gender = this.genders[2].value;
    this.model.homeLocation = new LocationCustom();
  }

  signUp() {
    this.loginService.getReverseGeocoding(this.model.homeLocation.country,
                                          this.model.homeLocation.county,
                                          this.model.homeLocation.city)
      .subscribe(res => {
        console.log(res);
        if (res.length === 0) {
          alert('Your location does not exists!');
        } else {
          this.model.homeLocation.longitude = res[0].lon;
          this.model.homeLocation.latitude = res[0].lat;
          console.log(this.model);
          this.loginService.signUp(this.model, this.imageFile)
            .subscribe(result => console.log(result),
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
}
