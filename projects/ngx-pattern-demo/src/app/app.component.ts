import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngx-pattern-demo';
  activeInstall = 'ng';

  numbersOnly = /^[0-9]*$/;

  ngOnInit(): void {

  }
}
