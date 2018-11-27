import {Component, OnInit} from '@angular/core';
import {AppUser} from '../shared/model/app-user';

@Component({
  selector: 'app-singup',
  templateUrl: './singup.component.html',
  styleUrls: ['./singup.component.scss']
})
export class SingupComponent implements OnInit {

  model: AppUser = new AppUser();

  constructor() {
  }

  ngOnInit() {
  }

}
