import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TeacherRequestService } from '../../../../providers/Api/teacherRequest.service';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss'],
  providers: [TeacherRequestService]
})
export class AddStudentComponent implements OnInit {

  addStudentFormGroup: FormGroup;

  constructor(private _translate: TranslateService,
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<AddStudentComponent>,
    private _api: TeacherRequestService) {

    this.addStudentFormGroup = this._fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
  async confirmAddStudent() {
    if (this.addStudentFormGroup.valid) {
      const email = this.addStudentFormGroup.controls.email.value;
      try {
        const res = await this._api.inviteStudent([email]);
        if (res && res.message) {
          this.dialogRef.close({ message: res.message });
        }
      } catch (err) {
        this.dialogRef.close({ error: err });
      }
    }
  }
  ngOnInit(): void {

  }
}
