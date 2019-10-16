import { Component, OnInit } from '@angular/core';
import {
  TeacherRequestService
} from './../../providers/Api/teacherRequest.service';
import { RequestService } from '../../providers/Api/request.service';
import { ChartBuilderService } from '../../providers/chart-builder.service';
import { MatSnackBar, MatTableDataSource, MatDialog, MatDialogConfig } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-panel',
  templateUrl: './teacherPanel.component.html',
  styleUrls: ['./teacherPanel.component.scss'],
  providers: [TeacherRequestService]
})
export class TeacherPanelComponent implements OnInit {

  error: any;
  onErrorTriggered: BehaviorSubject<any>;
  displayedColumns = ['id', 'username', 'lastname', 'firstname', 'progression', 'action'];
  dataSource;
  addStudentFormGroup: FormGroup;
  pieChart: any;
  barChart: any;
  nbStudent;
  nbGames;
  nbLevels;
  levelStats = [];

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  constructor(private _chartBuilder: ChartBuilderService, private _api: TeacherRequestService,
    public _snackBar: MatSnackBar, private _fb: FormBuilder, public _dialog: MatDialog, private _router: Router) {
    this.addStudentFormGroup = this._fb.group({
      email: ['', [Validators.email, Validators.required]]
    });

  }

  ngOnInit() {
    this.onErrorTriggered = new BehaviorSubject(null);
    this.onErrorTriggered.subscribe((error) => {
      if (error != null) {
        this.openSnackBar('Une erreur s\'est produite : ' + error, 'Ok');
      }
    });
    this.getLadder();
    this.getGlobalStats();
    this.getLevelStats();

  }

  getPieChart(globalProgress: any) {
    console.log(globalProgress);
    this.pieChart = this._chartBuilder.generatePieChart('Éleves ayant terminé le jeu', 450, 450, [{
      name: 'Terminé',
      y: Math.round((globalProgress.complete).toFixed(2) * 100)
    }, {
      name: 'En cours',
      y: Math.round((globalProgress.inProgress).toFixed(2) * 100)
    }, {
      name: 'Pas commencé',
      y: Math.round((globalProgress.notStarted).toFixed(2) * 100)
    }]);
  }
  getStackChart(progressByLevel) {
    this.barChart = this._chartBuilder.generateStackBarChart('Taux de réussite par niveaux', 450, 450, [{
      name: 'Terminé',
      data: progressByLevel.series.complete
    }, {
      name: 'En cours',
      data: progressByLevel.series.inProgress
    }, {
      name: 'Non commencé',
      data: progressByLevel.series.notStarted
    }], progressByLevel.xAxis);
  }
  async getLadder() {
    try {
      let response = await this._api.getLadder();

      if (!response || response.error) {
        throw response.error;
      } else {
        response = response.map(element => {
          element.progression = (element.progress.progression * 100).toFixed(2);
          return element;
        });
        this.dataSource = new MatTableDataSource(response);
      }
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  async getGlobalStats() {
    try {
      const response = await this._api.getGlobalStats();

      if (!response || response.error) {
        throw response.error;
      } else {
        this.nbStudent = response.nbStudent;
        this.nbGames = response.nbGamePlayed;
        this.nbLevels = response.nbLevels;
        this.getPieChart(response.globalProgress);
        this.getStackChart(response.progressByLevel);
        return response;
      }
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  async getLevelStats() {
    try {
      const response = await this._api.getLevelStats();

      if (!response || response.error) {
        throw response.error;
      } else {
        response.forEach(element => {
          this.levelStats.push(element);
          console.log(element);
        });
        return this.levelStats;
      }
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
    });
  }

  moveToDetail(id: number) {
    this._router.navigate(['teacherPanel/student/' + id]);
  }

}

export interface Element {
  id: string;
  username: number;
  prenom: number;
  nom: number;
  progression: number;
}

const ELEMENT_DATA: Element[] = [];
