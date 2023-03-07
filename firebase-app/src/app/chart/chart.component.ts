import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { IVote } from '../entities/IVote';
import { BaseChartDirective } from 'ng2-charts';
import { finalize, interval, Subject, takeUntil, timer } from 'rxjs';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input() effortPoints: string[] = [];
  @Input() voteDistribution: number[] = [];
  // @Input() voteData: IVote[] = [];
  @Input() callVote: Subject<IUser[]> = new Subject();
  @Input() resetVote = new Subject();
  @Input() result: number;
  @Input() isCountingDown: boolean = false;

  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'];

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };

  public barChartLabels: String[] = this.effortPoints;

  missedCount: number = 0;
  missedUsers: IUser[] = [];
  voterCount: number = 0;
  votedUsers: IUser[] = [];
  minPoint: number = 0;
  maxPoint: number = 0;
  pointNum: number = 0;
  minVoter: IUser[] = [];
  maxVoter: IUser[] = [];
  countArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  modeArray: number[] = [];
  mode: number = 0;

  constructor() {
    this.voteDistribution = [0, 2, 1, 3, 1, 0, 0, 0, 0, 0];
    this.effortPoints = ['1', '2', '3', '5', '8', '13', '21', '34', '55'];
  }

  createChart(): void {
    this.isCountingDown = false;
    this.barChartData = {
      labels: this.effortPoints,
      datasets: [{ data: this.countArray, label: 'Task 1' }],
    };
  }

  ngOnInit(): void {
    this.callVote.subscribe((v) => {
      this.showUserVotes(v);
      this.createChart();
      console.log('value is changing', v);
    });

    this.resetVote.subscribe((v) => {
      this.resetChart();
      this.createChart();
    });
  }

  resetChart(): void {
    this.missedCount = 0;
    this.missedUsers = [];
    this.voterCount = 0;
    this.votedUsers = [];
    this.minPoint = 0;
    this.maxPoint = 0;
    this.pointNum = 0;
    this.minVoter = [];
    this.maxVoter = [];
    this.countArray = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.modeArray = [];
    this.mode = 0;
  }

  private showUserVotes(voteData: IUser[]): void {
    this.votedUsers = voteData.filter((v) => v.points != 0);
    this.missedUsers = voteData.filter((v) => v.points == 0);
    this.missedCount = this.missedUsers.length;

    this.createCountArray(this.votedUsers);

    this.modeArray = this.countArray.filter(
      (v) => v == Math.max(...this.countArray)
    );
    this.mode = this.modeArray[0];
    this.minPoint = Math.min(...this.votedUsers.map((v) => v.points));
    this.maxPoint = Math.max(...this.votedUsers.map((v) => v.points));
    this.pointNum = this.votedUsers.length;
    this.minVoter = this.votedUsers.filter((v) => v.points == this.minPoint);
    this.maxVoter = this.votedUsers.filter((v) => v.points == this.maxPoint);
  }

  private createCountArray(users: IUser[]): void {
    users.forEach((user) => {
      switch (user.points) {
        case 1:
          this.countArray[0]++;
          break;
        case 2:
          this.countArray[1]++;
          break;
        case 3:
          this.countArray[2]++;
          break;
        case 5:
          this.countArray[3]++;
          break;
        case 8:
          this.countArray[4]++;
          break;
        case 13:
          this.countArray[5]++;
          break;
        case 21:
          this.countArray[6]++;
          break;
        case 34:
          this.countArray[7]++;
          break;
        case 55:
          this.countArray[8]++;
          break;
      }
    });
  }
}
