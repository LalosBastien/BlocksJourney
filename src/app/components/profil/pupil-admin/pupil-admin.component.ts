import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TeacherRequestService } from '../../../providers/Api/teacherRequest.service';
import { MatTableDataSource } from '@angular/material';
import { AuthRequestService } from '../../../providers/Api/authRequest.service';
import { element } from 'protractor';

@Component({
  selector: 'app-pupil-admin',
  templateUrl: './pupil-admin.component.html',
  styleUrls: ['./pupil-admin.component.scss'],
  providers: [AuthRequestService, TeacherRequestService]
})
export class PupilAdminComponent implements OnInit {

  displayedColumns: string[] = ['username', 'name', 'firstname', 'password', 'actions'];
  onErrorTriggered: BehaviorSubject<any>;
  students: MatTableDataSource<any>;
  prof: any;

  constructor(private _api: TeacherRequestService, private _apiAuth: AuthRequestService) {
  }

  ngOnInit() {
    this.onErrorTriggered = new BehaviorSubject(null);
    this.onErrorTriggered.subscribe((error) => {
      if (error != null) {
        console.log('Une erreur s\'est produite : ' + error, 'Ok');
      }
    });
    this.getStudents();
  }

  async getStudents() {
    try {
      const response = await this._api.getStudents();
      if (!response || response.error) {
        throw response.error;
      } else {
        this.students = new MatTableDataSource<any>(response.map((element: any) => {
          element.password = '';
          element.toCreate = false;
          return element;
        }));
        console.log(this.students);
      }
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  addStudent() {
    this.students.data.push({
      login: '',
      name: '',
      firstname: '',
      password: '',
      toCreate: true
    });
    this.students._updateChangeSubscription();
  }

  cancelAdd(index: number) {
    this.students.data.splice(index, 1);
    this.students._updateChangeSubscription();
  }

  async renewPassword(students: { id: number; password: any; }[]) {
    try {
      const response = await this._api.renewStudentPassword(students.map(elem => elem.id));
      if (!response || response.error) {
        throw response.error;
      } else {
        students = response;
        console.log(students);
      }
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  async renewAllStudents() {
    this.renewPassword(this.students.data);
  }

  async createStudents() {
    const studentToCreate = this.students.data.filter(student => student.toCreate);
    if (studentToCreate.length > 0) {
      try {
        const newStudents = await this._api.addStudents({
          students: studentToCreate.map(function (student) {
            return {
              name: student.nom,
              firstname: student.prenom
            };
          })
        });
        this.students.data = this.students.data.filter(student => !student.toCreate);
        this.students.data.concat(newStudents);
        this.students._updateChangeSubscription();
      } catch (error) {
        this.onErrorTriggered.next(error);
      }
    }
  }
}
