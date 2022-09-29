import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @HostBinding('class.active')
  @Input() active?: boolean;
  @Input() size = 'small';

  constructor() {
  }

  ngOnInit() {
  }

  get cardClass(): string {
    const {size} = this;
    return size ? `card-${size}` : '';
  }
}
