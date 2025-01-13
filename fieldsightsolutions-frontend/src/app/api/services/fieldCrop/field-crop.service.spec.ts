import { TestBed } from '@angular/core/testing';

import { FieldCropService } from './field-crop.service';

describe('FieldCropService', () => {
  let service: FieldCropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FieldCropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
