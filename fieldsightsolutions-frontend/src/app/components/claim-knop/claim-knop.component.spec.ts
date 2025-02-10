import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimKnopComponent } from './claim-knop.component';

describe('ClaimKnopComponent', () => {
  let component: ClaimKnopComponent;
  let fixture: ComponentFixture<ClaimKnopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimKnopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimKnopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
