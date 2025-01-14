import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlogandregisterComponent } from './inlogandregister.component';

describe('InlogandregisterComponent', () => {
  let component: InlogandregisterComponent;
  let fixture: ComponentFixture<InlogandregisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlogandregisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlogandregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
