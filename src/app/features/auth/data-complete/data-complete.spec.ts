import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataComplete } from './data-complete';

describe('DataComplete', () => {
  let component: DataComplete;
  let fixture: ComponentFixture<DataComplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataComplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataComplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
