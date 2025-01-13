import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchadeclaimComponent } from './schadeclaim.component';

describe('SchadeclaimComponent', () => {
  let component: SchadeclaimComponent;
  let fixture: ComponentFixture<SchadeclaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchadeclaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchadeclaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
