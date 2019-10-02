import { TestBed } from '@angular/core/testing';

import { NgxPatternService } from './ngx-pattern.service';

describe('NgxPatternService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxPatternService = TestBed.get(NgxPatternService);
    expect(service).toBeTruthy();
  });
});
