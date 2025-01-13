import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchadeclaimFormComponent } from './schadeclaim-form.component';

describe('SchadeclaimFormComponent', () => {
  let component: SchadeclaimFormComponent;
  let fixture: ComponentFixture<SchadeclaimFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchadeclaimFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchadeclaimFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
