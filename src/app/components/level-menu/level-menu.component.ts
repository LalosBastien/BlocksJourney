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
import { LevelHisto } from './../level-history/level-history.component';


@Component({
    selector: 'app-level-menu',
    templateUrl: './level-menu.component.html',
    styleUrls: ['./level-menu.component.scss'],
    providers: [LevelRequestService]
})
export class LevelMenuComponent implements OnInit {

    error: any;
    progression: number;
    displayedColumns: string[] = ['totalTime', 'algoTime', 'energy', 'status'];
    onErrorTriggered: BehaviorSubject<any>;
    chapters: any;
    emptyStars;
    oneStars;
    twoStars;
    threeStars;
    constructor(private _api: LevelRequestService, public _snackBar: MatSnackBar, private _translate: TranslateService) {
    }

    ngOnInit() {
        this.onErrorTriggered = new BehaviorSubject(null);
        this.onErrorTriggered.subscribe((error) => {
            if (error != null) {
                this.openSnackBar('Une erreur s\'est produite : ' + error, 'Ok');
            }
        });
        this.getLevels();
        this.initStarsAssets();
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
    getLevelStars(history){
        let fHist = history.filter(x => x.stars != null).map(x=> x.stars);
        fHist.push(0);
        let max = Math.max(...fHist);
        return max;
    }
    async getLevels() {
        try {
            const response = await this._api.getAllSortedByChapter();
            const history = await this._api.getHistory();

            if (!response || response.error) {
                throw response.error;
            } else {
                this.chapters = response.list;

                history.levels = history.levels
                    .map((level) => {
                        const newLevel = level;
                        newLevel.history.map(levelHistory => {
                            levelHistory.totalTime = moment.utc(levelHistory.totalTime * 1000).format('HH:mm:ss');
                            levelHistory.algoTime = moment.utc(levelHistory.algoTime).format('HH:mm:ss.SSS');
                        });
                        newLevel.stars = this.getLevelStars(newLevel.history);
                        newLevel.historyDataSource = new MatTableDataSource<LevelHisto>(newLevel.history);
                        return newLevel;
                    })
                    .map(level => ({ ...level, isExpended: false }));

                this.progression = history.progression * 100;
                this.chapters = this.chapters.map((chapter) => ({
                    ...chapter, levels: chapter.levels
                        .map((level) => history.levels.find(l => l.id === level.id) || level)
                        .map(level => ({ ...level, difficultyColor: this.colorByDifficulty(level.difficulty) }))
                }));
                console.log('levels', this.chapters);
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
    initStarsAssets(){
        this.emptyStars = require('../../../assets/game/star0.png');
        this.oneStars = require('./../../../assets/game/star1.png');
        this.twoStars = require('./../../../assets/game/star2.png');
        this.threeStars = require('./../../../assets/game/star3.png');
    }
}
