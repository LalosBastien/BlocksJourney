import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';

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

export class LevelHistoryComponent implements OnInit {
    filtered: boolean;

    @Input() id: number;
    @Input() historyDataSource: MatTableDataSource<LevelHisto>;
    @Input() displayedColumns: string[];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor() {
    }

    ngOnInit(): void {
        this.filtered = true;
        this.historyDataSource.filterPredicate = function (data, f): boolean {
            return !f || data.status === f;
        };
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit() {
        this.historyDataSource.sort = this.sort;
        this.historyDataSource.paginator = this.paginator;
    }
}
