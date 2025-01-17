import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVerzekeraarComponent } from './dashboard-verzekeraar.component';

describe('DashboardVerzekeraarComponent', () => {
  let component: DashboardVerzekeraarComponent;
  let fixture: ComponentFixture<DashboardVerzekeraarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVerzekeraarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardVerzekeraarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
