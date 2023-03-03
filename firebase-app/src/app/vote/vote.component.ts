import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  ActivatedRoute,
  Data,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import {
  catchError,
  EMPTY,
  firstValueFrom,
  lastValueFrom,
  map,
  Observable,
  take,
  tap,
  VirtualTimeScheduler,
} from 'rxjs';
import {
  Chart,
  ChartData,
  ChartItem,
  ChartOptions,
  ChartType,
  registerables,
} from 'chart.js';
import { getRelativePosition } from 'chart.js/helpers';
import { IUser } from '../entities/IUser';
import { IRoom } from '../entities/IRoom';
import { __param } from 'tslib';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit {
  // chart: Chart;
  @ViewChild('chart') canvas: HTMLCanvasElement;
  // myDatabase: any;

  continueSession: boolean;
  userName: string = '';
  roomName: string = '';
  roomsRef$: AngularFireList<any>;
  roomUserRef$: AngularFireList<any>;

  userID: any;
  userCount: number = 0;
  roomUserRef: any;
  roomUsersDBRef: any;
  roomUsersValueChanges$: Observable<any[]>;

  roomRef: any;
  roomValueChanges$: Observable<any>;
  pointRef: any;

  votes: any[] = [];
  votes$: Observable<number[]>;

  //----
  effortPoints: number[] = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  voteDistribution: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  voteCount: number = 0;
  roomVotes = new Map();
  hasSession: boolean = false;
  amHost: boolean = false;
  isVoteCalled: boolean = false;
  roomKey: string;
  user: IUser = {} as IUser;
  room: IRoom = {
    createTime: '',
    host: 'default',
    key: '',
    roomName: '',
    users: [],
  };

  room$: Observable<any>;
  roomDBRef: any;

  users$: Observable<any>;
  usersDBRef: any;
  userSelection: number = 0;

  constructor(
    private firebase: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute
  ) {
    Chart.register(...registerables);

    // get local storage values
    this.hasSession = localStorage.getItem('session') === 'true';
    this.amHost = localStorage.getItem('amHost') === 'true';
    this.roomKey = localStorage.getItem('roomKey') || '';
    const userString = localStorage.getItem('user') || '';

    // verify session
    if (!this.hasSession || userString === '' || this.roomKey === '') {
      console.log(
        'no session, no user, no room key, redirecting to home from vote'
      );
      this.resetLocalStorage();
      this.router.navigateByUrl('/home');
    }

    // get room and user references
    this.roomDBRef = this.firebase.database.ref('rooms/' + this.roomKey);
    this.roomUsersDBRef = this.firebase.list(
      'rooms/' + this.roomKey + '/users'
    );

    // parse and create user
    this.user = JSON.parse(userString);
    var newUser = this.roomUsersDBRef.push();
    this.user.key = newUser.key;
    newUser.set(this.user);

    // set user observable
    this.room$ = this.roomDBRef.once(
      'value',
      (data: { val: () => IRoom }) => {
        this.room = data.val();
        this.userCount = this.room.users.length;
      },
      this.errData
    );

    this.usersDBRef = this.firebase.database.ref(
      'rooms/' + this.roomKey + 'users/'
    );

    this.users$ = this.firebase
      .list('rooms/' + this.roomKey + 'users/')
      .valueChanges();

    this.users$.subscribe((users) => {
      (user: { val: () => any }) => {
        console.log('users', user.val());
        var key = users.val().points;
        var vote = this.roomVotes.get(key);
        this.roomVotes.set(key, ++vote);
      };
    });

    this.usersDBRef.once(
      'value',
      (data: any[]) => {
        (data: any) => {
          console.log('user', data);
        };
      },
      this.errData
    );

    var ref = this.firebase.list('rooms/' + this.roomKey);
    console.log('ref', ref);
    this.room$ = ref.valueChanges();
    // this.room$.subscribe((rooms) => (this.room = rooms as IRoom));
  }

  private gotData(data: any) {
    this.room = data.val();

    // const r = data.val() as IRoom;
    // console.log('room', room);

    // var keys = Object.keys(room);
    // console.log('key', keys);

    // for (var i = 0; i < keys.length; i++) {
    //   var k = keys[i];
    //   var host = room[k].host;
    //   var date = room[k].createTime;
    //   var roomName = room[k].roomName;
    //   var key = room[k].key;
    //   console.log(host, date, roomName, key);
    // }
  }

  private errData(err: any) {
    console.log('Error!');
  }

  ngOnInit(): void {
    // removes the user if navigating away from the vote page
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.removeUser(event);
        localStorage.setItem('session', 'false');
      }
    });

    this.roomUsersValueChanges$ = this.roomUsersDBRef.valueChanges();
    this.roomUsersValueChanges$.subscribe((users: any) => {
      // this.userCount = users.length;
      this.voteCount = 0;
      (user: { points: number }) => {
        this.voteCount = user.points != 0 ? this.voteCount++ : this.voteCount;
      };
      console.log('voteCount', this.voteCount);
    });

    // this.votes$ = this.roomUsersValueChanges$.pipe(
    //   map((users) =>
    //     users.map((user) => {
    //       user.point;
    //       console.log('user', user);
    //     })
    //   )
    // );

    // set vote count subscription

    // this.voteCount$ = this.votes$.pipe(
    //   map((votes) =>
    //     votes.reduce(
    //       (accumulator, vote) => Number(accumulator) + Number(vote.points),
    //       0
    //     )
    //   )
    // );

    // set currentUser from local storage

    // this.roomsRef$ = this.myDatabase.ref("rooms/" + this.roomKey + "/users");

    // console.log('room key', this.roomKey);
    this.roomRef = this.firebase.database.ref('rooms/' + this.roomKey);

    // this.userID = newUser.key;
    // newUserData.key = this.userID;

    this.roomUserRef = this.firebase.database.ref(
      'rooms/' + this.roomKey + '/users/' + this.user.key
    );
    this.pointRef = this.firebase.database.ref(
      'rooms/' + this.roomKey + '/users/' + this.user.key + '/points'
    );
  }

  public castVote(point: number): void {
    var updates: any = {};
    updates['rooms/' + this.roomKey + '/users/' + this.user.key + '/points'] =
      point;

    this.firebase.database.ref().update(updates);
    this.userSelection = point;
    console.log('selected button: ', point);
  }

  public async callVote(): Promise<void> {
    if (!this.amHost) return;

    this.isVoteCalled = true;
    var userRef = this.firebase.database.ref(
      'rooms/' + this.roomKey + '/users'
    );

    // this.roomUsersValueChanges$.subscribe((users) => {
    //   console.log('users', users);
    // });
    // console.log('votes', this.votes);
    // this.votes = await lastValueFrom(
    //   this.roomUsersValueChanges$.pipe(
    //     map((users) =>
    //       users.map((user) => {
    //         user.point;
    //       })
    //     ),
    //     catchError((err) => {
    //       console.log(err);
    //       return EMPTY;
    //     })
    //   )
    // );
  }

  public resetVote(): void {
    this.isVoteCalled = false;
  }

  private removeUser(event: any): void {
    if (event.url == '/vote') return;
    // remove user from room
    var userRef = this.firebase.database.ref(
      'rooms/' + this.roomKey + '/users/' + this.userID
    );
    userRef.remove();
  }

  private resetLocalStorage(): void {
    this.removeUser({});
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    localStorage.setItem('session', 'false');
    this.removeUser({});
    this.router.navigateByUrl('/home');
  }
}
