import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import {
  BehaviorSubject,
  finalize,
  interval,
  Observable,
  Subject,
  take,
} from 'rxjs';
import { IUser } from '../entities/IUser';
import { IRoom } from '../entities/IRoom';
import { __param } from 'tslib';
import { LoadState } from '../entities/LoadState';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit {
  @Output() leaveRoomEvent: EventEmitter<LoadState> =
    new EventEmitter<LoadState>();

  changingValue: BehaviorSubject<IUser[]> = new BehaviorSubject([] as IUser[]);
  resetVoteSub: Subject<any> = new Subject();
  voteListen$: Observable<any>;
  effortPoints: string[] = [
    '0',
    '1',
    '2',
    '3',
    '5',
    '8',
    '13',
    '21',
    '34',
    '55',
  ];

  amHost: boolean = false;
  showVotesToggle: boolean = false;
  showNumbersToggle: boolean = false;
  countDown: boolean = false;
  countdown: number = 0;
  voteCountDownNumber: number = 0;
  // user
  @Input() user$: BehaviorSubject<IUser> = new BehaviorSubject({} as IUser);
  user: IUser = {} as IUser;

  // room
  @Input() room$: BehaviorSubject<IRoom> = new BehaviorSubject({} as IRoom);
  roomValueChanges$: Observable<any>;
  room: IRoom = {} as IRoom;

  // room users
  users$: Observable<any>;
  users: IUser[] = [];
  userCount: number = 0;
  userSelection: string = '';

  // votes
  isVoteCalled: boolean = false;
  countDownStart$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  voteCount: number = 0;

  constructor(private firebase: AngularFireDatabase) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.user = user;
    });

    // room
    this.room$.subscribe((room) => {
      this.room = room;
    });

    this.roomValueChanges$ = this.firebase
      .object('rooms/' + this.room.uid)
      .valueChanges();

    this.roomValueChanges$.subscribe((room) => {
      // console.log('room: ', room);
      // leave room if empty
      if (room === null) {
        this.leaveRoom();
        return;
      }
      if (room.countDown === '') {
        var updates: any = {};
        updates['rooms/' + this.room.uid + '/countDown/'] = 3;
        this.firebase.database.ref().update(updates);
      }

      this.voteCountDownNumber = room.countDown;
      // console.log('room.countDown: ', room.countDown);
      this.countDownStart$.next(
        this.voteCountDownNumber !== this.room.countDown
      );
      // console.log('this.countDownStart$: ', this.countDownStart$.value);
      this.isVoteCalled = room.isVoting;
      // console.log('room.isVoting: ', room.isVoting);
    });

    // room.users
    this.users$ = this.firebase
      .list('rooms/' + this.room.uid + '/users')
      .valueChanges();
    this.users$.subscribe((users: IUser[]) => {
      this.users = users as IUser[];
      var vc = users.filter((user) => user.points != 0);
      this.voteCount = vc.length;
      this.userCount = users.length;
    });
    this.amHost = this.user.uid === this.room.host.uid;

    // room.isVoting
    this.voteListen$ = this.firebase
      .object('rooms/' + this.room.uid + '/isVoting')
      .valueChanges();
    this.voteListen$.subscribe((val) => {
      if (val) {
        this.changingValue.next(this.users);
      } else {
        this.resetVoteSub.next({});
        this.userSelection = '';
      }
    });
  }

  public castVote(point: string): void {
    this.userSelection = point;
    // console.log('selected button: ', point);
    var updates: any = {};
    updates['rooms/' + this.room.uid + '/users/' + this.user.uid + '/points'] =
      Number(point);

    this.firebase.database.ref().update(updates);
  }

  private ResetCountDown(): void {
    this.countDown = false;
    this.countdown = this.room.countDown;
    this.voteCountDownNumber = this.room.countDown;
    var updates: any = {};
    updates['rooms/' + this.room.uid + '/isVoting'] = this.isVoteCalled;
    updates['rooms/' + this.room.uid + '/countDown'] = this.room.countDown;
    this.firebase.database.ref().update(updates);
  }

  public callVote(): void {
    if (!this.amHost) return;
    if (this.countDown) {
      this.ResetCountDown();
      return;
    }

    this.countDown = true;
    this.countdown = this.room.countDown;
    const countdown$ = interval(1000).pipe(
      take(this.voteCountDownNumber),
      finalize(() => {
        this.isVoteCalled = true;
        this.countDown = false;
        var updates: any = {};
        updates['rooms/' + this.room.uid + '/isVoting'] = this.isVoteCalled;
        updates['rooms/' + this.room.uid + '/countDown'] = this.room.countDown;

        this.firebase.database.ref().update(updates);
        this.countdown = this.room.countDown;
      })
    );

    countdown$.subscribe(() => {
      // this.countdown--;
      this.voteCountDownNumber--;
      var updates: any = {};
      updates['rooms/' + this.room.uid + '/countDown'] =
        this.voteCountDownNumber;
      this.firebase.database.ref().update(updates);
    });
  }

  public resetVote(): void {
    this.isVoteCalled = false;
    var updates: any = {};
    this.users.forEach((user) => {
      updates['rooms/' + this.room.uid + '/users/' + user.uid + '/points'] = 0;
    });
    updates['rooms/' + this.room.uid + '/isVoting'] = this.isVoteCalled;
    updates['rooms/' + this.room.uid + '/countDown'] = this.room.countDown;
    this.firebase.database.ref().update(updates);
    this.countdown = this.room.countDown;
    this.userSelection = '';
  }

  public leaveRoom(): void {
    if (this.amHost) {
      if (this.userCount > 1) {
        if (
          !confirm(
            'Are you sure you want to leave the room?\n' +
              'Users in the room will be kicked out.'
          )
        )
          return;
      }
    }
    this.resetLocalStorage();
    this.leaveRoomEvent.emit(LoadState.home);
  }

  public showVotes(): void {
    this.showVotesToggle = !this.showVotesToggle;
  }

  public showNumbers(): void {
    this.showNumbersToggle = !this.showNumbersToggle;
  }

  private resetLocalStorage(): void {
    // remove room if host
    if (this.amHost) {
      this.firebase.database.ref('/rooms/' + this.room.uid).remove();
    } else {
      // remove user from room
      var ref = this.firebase.database.ref('/rooms/' + this.room.uid);
      ref.child('users/' + this.user.uid).remove();
    }

    // remove user from auth list
    this.firebase.database.ref('/users/' + this.user.uid).remove();
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    this.leaveRoom();
  }
}
