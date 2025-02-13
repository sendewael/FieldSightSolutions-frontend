import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeheerUsersComponent } from './beheer-users.component';

describe('BeheerUsersComponent', () => {
  let component: BeheerUsersComponent;
  let fixture: ComponentFixture<BeheerUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeheerUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeheerUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
