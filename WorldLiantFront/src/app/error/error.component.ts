import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error',
  template: `
    <p>
      error page works!
    </p>
  `,
  styles: []
})
export class ErrorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
