import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDashboard } from './staff-overview';

describe('StaffOverview', () => {
  let component: StaffDashboard;
  let fixture: ComponentFixture<StaffDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
