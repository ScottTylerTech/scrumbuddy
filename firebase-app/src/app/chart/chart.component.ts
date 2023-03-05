import { Component, Input, OnInit } from '@angular/core';
import { Chart, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input() effortPoints: number[] = [];
  @Input() voteDistribution: number[] = [];

  constructor() {}

  ngOnInit(): void {
    // chart setup
    var canvas = <HTMLCanvasElement>document.getElementById('barChart');
    var context = <CanvasRenderingContext2D>canvas.getContext('2d');
    var line: ChartType = 'bar';
    var chart = new Chart(context, {
      type: line,
      data: {
        labels: this.effortPoints,
        datasets: [
          {
            label: '# of Votes',
            data: this.voteDistribution,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
    });

    // var polarcanvas = <HTMLCanvasElement>(
    //   document.getElementById('chartpolarArea')
    // );
    // var polarcontext = <CanvasRenderingContext2D>canvas.getContext('2d');
    // var polarArea: ChartType = 'polarArea';
    // var areaChart = new Chart(polarcontext, {
    //   type: polarArea,
    //   data: {
    //     labels: this.effortPoints,
    //     datasets: [
    //       {
    //         label: '# of Votes',
    //         data: [12, 19, 3, 5, 2, 3],
    //         backgroundColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)',
    //         ],
    //         borderColor: [
    //           'rgba(255, 99, 132, 1)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)',
    //         ],
    //         borderWidth: 1,
    //       },
    //     ],
    //   },
    // });

    //--------------------------------------------------------------------------------//
    // chart setup
  }
}
