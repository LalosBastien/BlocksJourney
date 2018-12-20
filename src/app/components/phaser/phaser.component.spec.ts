import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaserTestComponent } from './phaser.component';

describe('PhaserTestComponent', () => {
  let component: PhaserTestComponent;
  let fixture: ComponentFixture<PhaserTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaserTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaserTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
