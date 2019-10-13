import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material';

@Component({
  selector: 'app-form-step',
  templateUrl: './form-step.component.html',
  styleUrls: ['./form-step.component.scss']
})
export class RegisterStepComponent implements OnInit {
  @Input() groupLabel: string;
  @Input() formGroup: FormGroup;

  @Input() color: ThemePalette = 'primary';

  constructor() { }

  ngOnInit() {
  }

}
