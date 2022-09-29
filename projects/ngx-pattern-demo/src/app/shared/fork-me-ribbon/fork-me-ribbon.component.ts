import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fork-me-ribbon',
  templateUrl: './fork-me-ribbon.component.html',
  styleUrls: ['./fork-me-ribbon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkMeRibbonComponent implements OnInit {
  @Input() repo = '';

  constructor() {
  }

  ngOnInit() {
  }

  get href(): string {
    return `https://github.com/${this.repo}`;
  }

}
