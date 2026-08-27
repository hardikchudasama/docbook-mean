import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorProfileView } from './doctor-profile-view';

describe('DoctorProfileView', () => {
  let component: DoctorProfileView;
  let fixture: ComponentFixture<DoctorProfileView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorProfileView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorProfileView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
