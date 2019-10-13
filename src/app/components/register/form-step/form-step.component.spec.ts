import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterStepComponent } from './form-step.component';

describe('RegisterStepComponent', () => {
  let component: RegisterStepComponent;
  let fixture: ComponentFixture<RegisterStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
