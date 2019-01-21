import { Component, OnInit } from '@angular/core';
import {ServerUrls} from '../shared/constants/server-urls';
import {UtilityService} from '../shared/service/utility.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  profilePictureUrl: string;
  constructor(private utilityService: UtilityService) { }

  ngOnInit() {
    this.getProfilePicture();
  }

  getProfilePicture() {
    const url = ServerUrls.PROFILE_PIC + localStorage.getItem('user');
    this.utilityService.getImage(url)
      .subscribe(img => {
        const reader = new FileReader();
        reader.onload = e => {
          this.profilePictureUrl = reader.result.toString();
        };
        reader.readAsDataURL(img);
      });
  }





}
