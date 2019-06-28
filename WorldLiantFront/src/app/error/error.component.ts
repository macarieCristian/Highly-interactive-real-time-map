import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-error',
  template: `
    <div style="width: 100%; height: 100%; background: url('../../assets/carouselImgs/city.jpg');
    display: flex; align-items: center; justify-content: center;">
      <img src="../../assets/img/404.gif" alt="Page not found" style="mix-blend-mode: multiply;">
    </div>
  `,
  styles: []
})
export class ErrorComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
