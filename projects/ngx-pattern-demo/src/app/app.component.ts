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
  value1: string;
  value2: string;
  value3: string;
  value4: string;
  value5: string;

  ngOnInit(): void {

  }
}
