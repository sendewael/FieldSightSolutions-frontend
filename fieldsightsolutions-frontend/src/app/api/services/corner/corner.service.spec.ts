import { TestBed } from '@angular/core/testing';

import { CornerService } from './corner.service';

describe('CornerService', () => {
  let service: CornerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CornerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
