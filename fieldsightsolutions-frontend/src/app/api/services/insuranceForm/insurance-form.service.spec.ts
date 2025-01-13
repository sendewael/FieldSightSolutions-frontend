import { TestBed } from '@angular/core/testing';

import { InsuranceFormService } from './insurance-form.service';

describe('InsuranceFormService', () => {
  let service: InsuranceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsuranceFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
