import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchadeclaimsComponent } from './schadeclaims.component';

describe('SchadeclaimsComponent', () => {
  let component: SchadeclaimsComponent;
  let fixture: ComponentFixture<SchadeclaimsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchadeclaimsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchadeclaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
