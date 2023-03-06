import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { IVote } from '../entities/IVote';
import { BaseChartDirective } from 'ng2-charts';
import { finalize, interval, Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input() effortPoints: string[] = [];
  @Input() voteDistribution: number[] = [];
  @Input() voteData: IVote[] = [];
  @Input() callVote: Subject<number[]> = new Subject();
  @Input() result: number;
  @Input() isCountingDown: boolean = false;

  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'];

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };

  public barChartLabels: String[] = this.effortPoints;

  constructor() {
    this.voteDistribution = [0, 2, 1, 3, 1, 0, 0, 0, 0, 0];
    this.effortPoints = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55'];
    // this.isCountingDown = true;
    // this.result = 3;
    // this.barChartData = {
    //   labels: this.effortPoints,
    //   datasets: [{ data: this.voteDistribution, label: 'Series A' }],
    // };
  }

  createChart(vD: number[]): void {
    this.isCountingDown = false;
    this.barChartData = {
      labels: this.effortPoints,
      datasets: [{ data: vD, label: 'Series A' }],
    };
  }

  ngOnInit(): void {
    this.callVote.subscribe((v) => {
      this.createChart(v);
      console.log('value is changing', v);
    });
  }
}
