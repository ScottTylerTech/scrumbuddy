import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration, Color } from 'chart.js';
import { Subject } from 'rxjs';
import { IUser } from '../entities/IUser';

interface IResult {
  ep: string;
  count: number;
  users: IUser[];
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input() effortPoints: string[] = [];
  voteDistribution: number[] = [];
  @Input() counter: number = 0;
  @Input() callVote: Subject<IUser[]> = new Subject();
  @Input() resetVote = new Subject();
  @Input() voteIsCalled: boolean = false;

  public barChartLegend = false;
  public barChartPlugins = [];
  public barChartData: ChartConfiguration<'bar'>['data'];

  public barChartOptions: any = {
    plugins: {
      tooltip: {
        enabled: true,
        displayColors: false,
        yAlign: 'center',
        callbacks: {
          label: (c: any) => {
            let labelUsers = this.votedUsers
              .filter((u) => u.points === Number(c.label))
              .map((u) => {
                return u.name;
              });
            return labelUsers.join(', ');
          },
        },
      },
    },
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      x: {},
      y: {
        weight: 2,
        type: 'linear',
        ticks: {
          stepSize: 1,
          beginAtZero: true,
        },
      },
    },
  };

  public barChartLabels: String[] = this.effortPoints;

  missedCount: number = 0;
  missedUsers: IUser[] = [];
  voterCount: number = 0;
  votedUsers: IUser[] = [];
  minPoint: number = 0;
  maxPoint: number = 0;
  pointNum: number = 0;
  minVoterLabel: string = '';
  modeVoterLabel: string = '';
  maxVoterLabel: string = '';
  countArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  modes: IResult[] = [];

  modeArray: IUser[] = [];
  mode: number = 0;

  voteCalled: boolean = false;
  constructor() {
    this.voteDistribution = [0, 2, 1, 3, 1, 0, 0, 0, 0, 0];
    this.effortPoints = ['1', '2', '3', '5', '8', '13', '21', '34', '55'];
    this.mode = 0;
    this.modes = [{ ep: '0', count: 0, users: [] }];
  }

  createChart(): void {
    this.barChartData = {
      labels: this.effortPoints,
      datasets: [
        {
          // no top label

          label: '',
          data: this.countArray,
          backgroundColor: [
            'hsl(0, 100%, 80%)',
            'hsl(15, 100%, 80%)',
            'hsl(30, 100%, 80%)',
            'hsl(45, 100%, 80%)',
            'hsl(210, 100%, 80%)',
            'hsl(225, 100%, 80%)',
            'hsl(265, 100%, 80%)',
            'hsl(300, 100%, 80%)',
            'hsl(330, 100%, 80%)',
          ],
          borderColor: [
            'hsl(0, 100%,   50%)',
            'hsl(15, 100%,  50%)',
            'hsl(30, 100%,  50%)',
            'hsl(45, 100%,  50%)',
            'hsl(210, 100%, 50%)',
            'hsl(225, 100%, 50%)',
            'hsl(265, 100%, 50%)',
            'hsl(300, 100%, 50%)',
            'hsl(330, 100%, 50%)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }

  ngOnInit(): void {
    this.callVote.subscribe((v) => {
      this.voteCalled = true;
      this.showUserVotes(v);
      this.createChart();
    });

    this.resetVote.subscribe((v) => {
      this.voteCalled = false;
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
    this.countArray = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.modeArray = [];
    this.mode = 0;
    this.modes = [{ ep: '', count: 0, users: [] }];
    this.minVoterLabel = '';
    this.modeVoterLabel = '';
    this.maxVoterLabel = '';
  }

  getVoteResult(): number {
    return this.mode;
  }

  private showUserVotes(voteData: IUser[]): void {
    this.votedUsers = voteData.filter((v) => v.points != 0);
    this.voterCount = this.votedUsers.length;
    this.missedUsers = voteData.filter((v) => v.points == 0);
    this.missedCount = this.missedUsers.length;

    this.createCountArray(this.votedUsers);

    let r: IResult[] = [];
    for (let i = 0; i < this.countArray.length; i++) {
      var users = this.votedUsers.filter(
        (user) => user.points == Number(this.effortPoints[i])
      );
      r.push({
        ep: this.effortPoints[i],
        count: this.countArray[i],
        users: users,
      });
    }
    r.sort((a, b) => b.count - a.count);

    const topMode = r[0].count;
    this.modes = r.filter((result) => result.count == topMode);
    this.modeVoterLabel = r
      .filter((result) => result.count == topMode)
      .map((filterResult) => filterResult.users.map((user) => user.name))
      .join(', ');

    this.modeArray = this.votedUsers.filter((v) => v.points == this.mode);

    const modeIndex = this.countArray.indexOf(Math.max(...this.countArray));

    this.mode =
      this.votedUsers.length === 0 ? 0 : Number(this.effortPoints[modeIndex]);

    this.minPoint =
      this.votedUsers.length === 0
        ? 0
        : Math.min(...this.votedUsers.map((v) => v.points));
    this.maxPoint =
      this.votedUsers.length === 0
        ? 0
        : Math.max(...this.votedUsers.map((v) => v.points));
    this.pointNum = this.votedUsers.length;
    this.minVoterLabel = this.votedUsers
      .filter((v) => v.points == this.minPoint)
      .map((v) => {
        return v.name;
      })
      .join(', ');
    this.maxVoterLabel = this.votedUsers
      .filter((v) => v.points == this.maxPoint)
      .map((v) => {
        return v.name;
      })
      .join(', ');
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
