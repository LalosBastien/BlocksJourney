import {
    Injectable
  } from '@angular/core';
  import {
    Chart
  } from 'angular-highcharts';
  import {
    ChartModule
  } from 'angular-highcharts/chart.module';
  import {
    HIGHCHARTS_MODULES
  } from 'angular-highcharts/chart.service';

  @Injectable()
  export class ChartBuilderService {

    constructor() {}

    public generatePieChart(title: string, graphHeight: number, graphWidth: number, datas: any) {
        return new Chart({
            chart: {
            height: graphHeight,
            width: graphWidth,
            type: 'pie'
            },
            colors: ['#9CE86A','#E8A502','#D10000'],
            title: {
              text: title,
              style: { 'color': '#333', 'fontSize': '18px', 'fontWeight': 'bold'},
            },
            credits: {
              enabled: false
            },
            tooltip: {
              enabled: true,
              valueSuffix: ' %'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Pourcentage',
                data: datas
          }]
        });
    }

    public generateStackBarChart(title: string, graphHeight: number, graphWidth: number, datas: any,xAxis) {
        console.log(datas);
        return new Chart({
            chart: {
            height: graphHeight,
            width: graphWidth,
            type: 'bar'
            },
            colors: ['#9CE86A','#E8A502','#D10000'],
            title: {
              text: title,
              style: { 'color': '#333', 'fontSize': '18px', 'fontWeight': 'bold'},
            },
            credits: {
              enabled: false
            },
            tooltip: {
              enabled: true,
              valueSuffix: ' %'
            },
            xAxis: {
                categories: xAxis
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Taux de réussite'
                }
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: datas
        });
    }
  }
