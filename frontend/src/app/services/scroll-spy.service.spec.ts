import { TestBed } from '@angular/core/testing';

import { ScrollSpyService } from './scroll-spy.service';

describe('ScrollSpyService', () => {
  let service: ScrollSpyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollSpyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
