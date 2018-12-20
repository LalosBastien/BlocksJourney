import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-tracking-dialog',
  templateUrl: './tracking-dialog.component.html',
  styleUrls: ['./tracking-dialog.component.scss']
})
export class TrackingDialogComponent implements OnInit {

  student: any;
  levels:any;
  constructor(
    public dialogRef: MatDialogRef<TrackingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public _student: any) {
    this.student = _student;
    this.levels = _student.progress.levels;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {

  }

}
