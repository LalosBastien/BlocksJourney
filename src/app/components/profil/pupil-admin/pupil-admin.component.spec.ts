import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PupilAdminComponent } from './pupil-admin.component';

describe('PupilAdminComponent', () => {
  let component: PupilAdminComponent;
  let fixture: ComponentFixture<PupilAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PupilAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PupilAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
