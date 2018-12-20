import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { MatSelect, MatDialog } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { TeacherRequestService } from '../../../providers/Api/teacherRequest.service';
import { TrackingDialogComponent } from './dialog/tracking-dialog/tracking-dialog.component';

@Component({
  selector: 'app-classes-tab',
  templateUrl: './classes-tab.component.html',
  styleUrls: ['./classes-tab.component.scss']
})
export class ClassesTabComponent implements OnInit {
  // classSel: FormGroup;
  // _typeApi: any;
  // listClass: Array<any>;
  listStudent: Array<any>;
  selectedClass: string;
  constructor(private _api: TeacherRequestService,private dialog:MatDialog) {

  }

  async ngOnInit() {

    // this.classSel = new FormGroup({
    //   currentClass: new FormControl()
    // });
    // this.initListClass();
    // this.classSel.valueChanges.subscribe(v => this.initListStudent())
    this.initListStudent();
  }
  async initListClass() {
    try {
      // let list = await this._typeApi.GetListClass(this.teacherID).toPromise();
      // if (!list) throw "EmptyList"
      // this.listClass = list;
      // this.listClass = [{ id: 1, libelle: 'Classe 1' }, { id: 2, libelle: 'Classe 2' }]
    } catch (err) { console.error(err) };
  }
  async initListStudent() {
    try {
      let l = await this._api.getLadder();
      console.log(l);
      if (!l) throw 'Datas Not available'
      this.listStudent = l;
      console.log(this.listStudent);
    } catch (err) {
      console.log(err);
    }
  }
  openAddClassDialog() {

  }
  openImproveTrackingDialog(student) {
    let ITD = this.dialog.open(TrackingDialogComponent,{data:student})

  }
}
