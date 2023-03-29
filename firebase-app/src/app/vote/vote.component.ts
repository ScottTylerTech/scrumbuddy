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
import { environment } from 'src/environments/environment';
import { UserService } from '../user.service';
import { RoomService } from '../room.service';
import { StateService } from '../state.service';

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
  effortPoints: string[];

  amHost: boolean = false;
  showVotesToggle: boolean = false;
  showNumbersToggle: boolean = false;
  isCountingDown: boolean = false;
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

  constructor(
    private firebase: AngularFireDatabase,
    private userService: UserService,
    private roomService: RoomService,
    public stateService: StateService
  ) {}

  ngOnInit(): void {
    this.effortPoints = environment.effortPoints;
    // this.user$.subscribe((user) => {
    //   this.user = user;
    // });

    // user
    this.user = this.userService.getUser();
    // room
    this.room = this.roomService.getRoom();
    // this.room$.subscribe((room) => {
    //   this.room = room;
    // });

    this.roomValueChanges$ = this.firebase
      .object('rooms/' + this.room.uid)
      .valueChanges();

    this.roomValueChanges$.subscribe((room) => {
      if (room === null) {
        this.leaveRoom();
        return;
      }

      this.countDownStart$.next(
        this.room.countDown === this.room.countDownReset
      );
      this.isVoteCalled = room.isVoting;
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
    this.isCountingDown = false;
    this.countdown = this.room.countDownReset;
    this.voteCountDownNumber = this.room.countDownReset;
    var updates: any = {};
    updates['rooms/' + this.room.uid + '/isVoting'] = this.isVoteCalled;
    updates['rooms/' + this.room.uid + '/countDown'] = this.room.countDownReset;
    this.firebase.database.ref().update(updates);
  }

  public callVote(): void {
    if (!this.amHost) return;
    if (this.isCountingDown) {
      this.ResetCountDown();
      return;
    }
    this.isCountingDown = true;
    this.voteCountDownNumber = this.room.countDownReset;

    var updates: any = {};
    updates['rooms/' + this.room.uid + '/countDown'] = this.voteCountDownNumber;
    this.firebase.database.ref().update(updates);

    const counter$ = interval(1000).pipe(
      take(this.room.countDownReset + 1),
      finalize(() => {
        this.isVoteCalled = true;
        this.isCountingDown = false;

        var updates: any = {};
        updates['rooms/' + this.room.uid + '/isVoting'] = this.isVoteCalled;
        updates['rooms/' + this.room.uid + '/countDown'] =
          this.room.countDownReset;
        this.firebase.database.ref().update(updates);
      })
    );

    counter$.subscribe(() => {
      this.voteCountDownNumber--;
      this.countDownStart$.next(
        this.voteCountDownNumber !== this.room.countDownReset
      );
      console.log(
        'countdown: ',
        this.voteCountDownNumber,
        ' .. ',
        this.room.countDownReset
      );
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
    updates['rooms/' + this.room.uid + '/countDown'] = this.room.countDownReset;
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
