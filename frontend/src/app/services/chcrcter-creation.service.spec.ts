import { TestBed } from '@angular/core/testing';

import { ChcrcterCreationService } from './chcrcter-creation.service';

describe('ChcrcterCreationService', () => {
  let service: ChcrcterCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChcrcterCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
