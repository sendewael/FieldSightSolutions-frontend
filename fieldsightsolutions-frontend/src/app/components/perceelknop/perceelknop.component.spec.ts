import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerceelknopComponent } from './perceelknop.component';

describe('PerceelknopComponent', () => {
  let component: PerceelknopComponent;
  let fixture: ComponentFixture<PerceelknopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerceelknopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerceelknopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
