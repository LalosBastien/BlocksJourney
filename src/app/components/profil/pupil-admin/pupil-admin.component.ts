import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TeacherRequestService } from '../../../providers/Api/teacherRequest.service';
import { MatTableDataSource } from '@angular/material';
import { AuthRequestService } from '../../../providers/Api/authRequest.service';

declare var jsPDF: any;

@Component({
  selector: 'app-pupil-admin',
  templateUrl: './pupil-admin.component.html',
  styleUrls: ['./pupil-admin.component.scss'],
  providers: [AuthRequestService, TeacherRequestService]
})
export class PupilAdminComponent implements OnInit {

  @ViewChild('table') myTable: ElementRef;
  displayedColumns: string[] = ['username', 'name', 'firstname', 'password', 'actions'];
  onErrorTriggered: BehaviorSubject<any>;
  students: MatTableDataSource<any>;
  prof: any;



  constructor(private _api: TeacherRequestService) {
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
      nom: '',
      prenom: '',
      password: '',
      toCreate: true
    });
    this.students._updateChangeSubscription();
  }

  printTable() {
    try {
      const columns = ['Login', 'Name', 'Firstname', 'Password'];
      const doc = new jsPDF('p', 'px', 'a4');
      doc.setFontSize(36);
      doc.text(120, 24, 'Student list:');
      doc.autoTable(columns, this.students.data.map((student: any) => {
        const studentAsRow = [student.login, student.nom, student.prenom, student.password];
        return studentAsRow;
      }));
      doc.save('export.pdf');
    } catch (e) {
      console.log(e);
    }
  }

  async deleteStudent(student: { id: number }, index: number) {
    try {
      const response = await this._api.deleteStudent(student.id);
      if (!response || response.error) {
        throw response.error;
      } else {
        this.removeRow(index);
      }
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  removeRow(index: number) {
    this.students.data.splice(index, 1);
    this.students._updateChangeSubscription();
  }

  async renewPassword(students: { id: number; password: any; }[]) {
    try {
      const response = await this._api.renewStudentPassword(students.map(elem => elem.id));
      if (!response || response.error) {
        throw response.error;
      } else {
        for (const student of students) {
          student.password = response.find((s: { id: number; }) => {
            return s.id === student.id;
          }).password;
        }
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
        const response = await this._api.addStudents(
          studentToCreate.map(function (student) {
            return {
              nom: student.nom,
              prenom: student.prenom
            };
          })
        );
        this.students.data = this.students.data.filter(student => !student.toCreate);
        this.students.data = this.students.data.concat(response.students);
        this.students._updateChangeSubscription();
      } catch (error) {
        this.onErrorTriggered.next(error);
      }
    }
  }
}
