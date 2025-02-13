import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOverheidComponent } from './dashboard-overheid.component';

describe('DashboardVerzekeraarComponent', () => {
  let component: DashboardOverheidComponent;
  let fixture: ComponentFixture<DashboardOverheidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOverheidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardOverheidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
