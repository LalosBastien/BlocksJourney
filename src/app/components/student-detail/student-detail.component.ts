import { ActivatedRoute } from '@angular/router';
import {
    Component,
    OnInit
} from '@angular/core';
import {
    LevelRequestService
} from '../../providers/Api/levelRequest.service';
import {
    BehaviorSubject
} from 'rxjs/BehaviorSubject';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

export interface LevelHisto {
    algoTime: string;
    totalTime: string;
    status: string;
}

@Component({
    selector: 'app-student-detail',
    templateUrl: './student-detail.component.html',
    styleUrls: ['./student-detail.component.scss'],
    providers: [LevelRequestService]
})
export class StudentDetailComponent implements OnInit {

    error: any;
    progression: number;
    displayedColumns: string[] = ['totalTime', 'algoTime', 'status'];
    onErrorTriggered: BehaviorSubject<any>;
    levels: any;
    dataSources: MatTableDataSource<LevelHisto>[];

    constructor(private _url: ActivatedRoute, private _api: LevelRequestService,
        public _snackBar: MatSnackBar, private _translate: TranslateService) {
        this.dataSources = [];
    }

    ngOnInit() {
        this._url.params.subscribe(params => {
            console.log(params['id']);
            this.getLevels(params['id']);
        });

        this.onErrorTriggered = new BehaviorSubject(null);
        this.onErrorTriggered.subscribe((error) => {
            if (error != null) {
                this.openSnackBar('Une erreur s\'est produite : ' + error, 'Ok');
            }
        });
    }

    colorByDifficulty(difficulty: number) {
        let name: string;
        if (difficulty <= 4) {
            name = 'mat-slider-green';
        } else if (difficulty > 7) {
            name = 'mat-slider-red';
        } else {
            name = 'mat-slider-yellow';
        }
        console.log(name);
        return name;
    }

    statusIcon(status: string) {
        if (!status) {
            return 'fiber_new';
        }
        if (status === 'in_progress') {
            return 'timelapse';
        }
        if (status === 'success') {
            return 'done';
        }
    }

    statusColor(status: string) {
        if (!status) {
            return 'orange';
        }
        if (status === 'in_progress') {
            return 'grey';
        }
        if (status === 'success') {
            return 'green';
        }
    }

    toggleExpansion(level: any) {
        level.isExpended = !level.isExpended;
    }

    async getLevels(id: number) {
        try {
            const response = await this._api.getAll();
            const history = await this._api.getUserHistory(id);

            console.log('response', response);
            console.log('history 1', history);

            if (!response || response.error) {
                throw response.error;
            } else {
                this.levels = response.list;
                console.log('history 2', history);
                history.levels = history.levels
                    .map((level, i) => {
                        const newLevel = level;
                        newLevel.history.map(levelHistory => {
                            levelHistory.totalTime = moment.utc(levelHistory.totalTime * 1000).format('HH:mm:ss');
                            levelHistory.algoTime = moment.utc(levelHistory.algoTime).format('HH:mm:ss.SSS');
                        });
                        newLevel.historyDataSource = new MatTableDataSource<LevelHisto>(newLevel.history);
                        return newLevel;
                    })
                    .map(level => ({ ...level, isExpended: false }));

                console.log('history 3', history);
                this.progression = history.progression * 100;
                this.levels = this.levels
                    .map((level) => history.levels.find(l => l.id === level.id) || level)
                    .map(level => ({ ...level, difficultyColor: this.colorByDifficulty(level.difficulty) }));

                console.log('levels', this.levels);
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

}
