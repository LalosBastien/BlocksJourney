import { Component, Input, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

export interface LevelHisto {
    algoTime: string;
    totalTime: string;
    energy: number;
    status: string;
}

@Component({
    selector: 'app-level-history',
    templateUrl: './level-history.component.html',
    styleUrls: ['./level-history.component.scss']
})

export class LevelHistoryComponent {
    @Input() historyDataSource: MatTableDataSource<LevelHisto>;
    @Input() displayedColumns: string[];

    @ViewChild(MatSort) sort: MatSort;

    constructor() {
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit() {
        this.historyDataSource.sort = this.sort;
    }
}
