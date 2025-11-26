import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffOverview } from './staff-overview';

describe('StaffOverview', () => {
  let component: StaffOverview;
  let fixture: ComponentFixture<StaffOverview>;

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
