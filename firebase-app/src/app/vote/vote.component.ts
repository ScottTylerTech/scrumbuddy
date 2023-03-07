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
  finalize,
  firstValueFrom,
  interval,
  lastValueFrom,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  take,
  takeUntil,
  tap,
  timer,
  VirtualTimeScheduler,
} from 'rxjs';
import { IUser } from '../entities/IUser';
import { IRoom } from '../entities/IRoom';
import { IVote } from '../entities/IVote';
import { __param } from 'tslib';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit {
  changingValue: Subject<IUser[]> = new Subject();
  resetVoteSub: Subject<any> = new Subject();
  voteListen$: Observable<any>;

  roomRef: any;
  roomValueChanges$: Observable<any>;
  pointRef: any;

  //----
  effortPoints: string[] = ['1', '2', '3', '5', '8', '13', '21', '34', '55'];

  // local storage
  hasSession: boolean = false;
  amHost: boolean = false;
  roomKey: string;

  // user
  userDBRef: any;
  user: IUser = {} as IUser;

  // room
  room$: Observable<any>;
  roomName: string = '';
  roomDBRef: any;

  // room users
  usersDBRef: any;
  users$: Observable<any>;
  users: IUser[] = [];
  userCount: number = 0;
  userSelection: string = '';

  // votes
  isVoteCalled: boolean = false;
  isVoteEnded: boolean = false;
  voteCount: number = 0;
  voteDistribution: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  voteData: IVote[] = [];
  // votes: any[] = [];
  votes$: Observable<number[]>;
  missedVotes: IUser[] = [];

  // counter
  result: any;

  constructor(
    private firebase: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // get local storage values
    this.hasSession = true;
    localStorage.setItem('session', 'true');
    this.amHost = localStorage.getItem('amHost') === 'true';
    this.roomKey = localStorage.getItem('roomKey') || '';
    const userString = localStorage.getItem('user') || '';

    // verify session
    // if (!this.hasSession || userString === '' || this.roomKey === '') {
    //   console.log(
    //     'session: ' +
    //       this.hasSession +
    //       ' user: ' +
    //       userString +
    //       'roomKey:, ' +
    //       this.roomKey +
    //       'redirecting to home from vote'
    //   );
    //   this.resetLocalStorage();
    //   this.router.navigateByUrl('/home');
    // }

    // get room and user references
    this.usersDBRef = this.firebase.database.ref(
      'rooms/' + this.roomKey + '/users/'
    );

    this.roomDBRef = this.firebase.database.ref('rooms/' + this.roomKey);
    this.room$ = this.firebase.object('rooms/' + this.roomKey).valueChanges();
    this.voteListen$ = this.firebase
      .object('rooms/' + this.roomKey + '/isVoting')
      .valueChanges();
    this.voteListen$.subscribe((val) => {
      if (val) {
        this.changingValue.next(this.users);
      } else {
        this.resetVoteSub.next({});
      }
    });

    this.room$.subscribe((room: IRoom) => {
      // this.isVoteCalled = room.isVoting;
      this.roomName = room.roomName;
      this.isVoteCalled = room.isVoting;
    });
    // parse and create user
    this.user = JSON.parse(userString) as IUser;
    var newUser = this.usersDBRef.push();
    this.user.key = newUser.key;
    newUser.set(this.user);

    this.userDBRef = this.firebase.database.ref(
      'rooms/' + this.roomKey + '/users/' + this.user.key
    );

    this.users$ = this.firebase
      .list('rooms/' + this.roomKey + '/users')
      .valueChanges();

    this.users$.subscribe((users: IUser[]) => {
      this.users = users as IUser[];
      var vc = users.filter((user) => user.points != 0);
      this.voteCount = vc.length;
      this.userCount = users.length;
      // console.log('users: ', users);
    });
  }

  public clickBtn() {
    console.log('click');
  }

  ngOnInit(): void {
    // removes the user if navigating away from the vote page
    // this.router.events.subscribe((event: any) => {
    //   if (event.url === '/home') {
    //     this.removeUser();
    //     localStorage.setItem('session', '');
    //   }
    // } else if (!this.hasSession && event instanceof NavigationEnd) {
    //   this.removeUser();
    //   localStorage.setItem('session', 'false');
    // } else if (this.hasSession && event instanceof NavigationStart) {
    //   this.removeUser();
    //   localStorage.setItem('session', 'false');
    // }
    // });
  }

  public castVote(point: string): void {
    this.userSelection = point;
    console.log('selected button: ', point);
    var updates: any = {};
    updates['rooms/' + this.roomKey + '/users/' + this.user.key + '/points'] =
      Number(point);

    this.firebase.database.ref().update(updates);
  }

  public callVote(): void {
    if (!this.amHost) return;
    this.isVoteCalled = true;
    var updates: any = {};
    updates['rooms/' + this.roomKey + '/isVoting'] = this.isVoteCalled;
    this.firebase.database.ref().update(updates);

    // await this.calculateResult();
    // this.changingValue.next(this.users);

    // for count down timer
    // const date = new Date();
    // date.setSeconds(date.getSeconds() + 3);
    // const source = interval(1000);
    // source
    //   .pipe(
    //     takeUntil(timer(5000)),
    //     finalize(async () => {
    //       this.isVoteCalled = false;
    //       this.isVoteEnded = true;
    //       var updates: any = {};
    //       updates['rooms/' + this.roomKey + '/isVoting'] = this.isVoteEnded;
    //       this.firebase.database.ref().update(updates);
    //       console.log('vote ended:' + this.isVoteEnded);
    //       await this.calculateResult();
    //       this.changingValue.next(this.voteDistribution);
    //     })
    //   )
    //   .subscribe((val) => (this.result = 3 - val));
  }

  public resetVote(): void {
    this.isVoteCalled = false;
    var updates: any = {};
    this.users.forEach((user) => {
      updates['rooms/' + this.roomKey + '/users/' + user.key + '/points'] = 0;
    });
    updates['rooms/' + this.roomKey + '/isVoting'] = this.isVoteCalled;
    this.firebase.database.ref().update(updates);
    this.userSelection = '';
  }

  public leaveRoom(): void {
    this.resetLocalStorage();
    this.router.navigateByUrl('/home');
  }

  private removeUser(): void {
    var ref = this.firebase.database.ref('/rooms/' + this.roomKey);
    ref.child('users/' + this.user.key).remove();
  }

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
    if (this.amHost) {
      this.firebase.database.ref('/rooms/' + this.roomKey).remove();
    } else {
      this.removeUser();
    }
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // this.resetLocalStorage();
    // this.router.navigateByUrl('/home');
  }
  @HostListener('window:refresh') windowRefresh() {
    // this.resetLocalStorage();
    // this.router.navigateByUrl('/home');
  }
}
