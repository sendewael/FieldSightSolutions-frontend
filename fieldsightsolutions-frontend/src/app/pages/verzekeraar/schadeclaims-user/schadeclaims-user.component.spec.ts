import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchadeclaimsUserComponent } from './schadeclaims-user.component';

describe('SchadeclaimsUserComponent', () => {
  let component: SchadeclaimsUserComponent;
  let fixture: ComponentFixture<SchadeclaimsUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchadeclaimsUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchadeclaimsUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
