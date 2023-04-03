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
import { UserService } from '../services/user.service';
import { RoomService } from '../services/room.service';
import { StateService } from '../services/state.service';
import { CountDownService } from '../services/count-down.service';
import { FirebaseService } from '../services/firebase.service';

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
  startCountDown$: any;

  constructor(
    private firebase: AngularFireDatabase,
    private userService: UserService,
    private roomService: RoomService,
    public stateService: StateService,
    private countDownService: CountDownService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.effortPoints = environment.effortPoints;

    // user
    this.user = this.userService.getUser();
    // room
    this.room = this.roomService.getRoom();

    this.roomValueChanges$ = this.firebase
      .object('rooms/' + this.room.uid)
      .valueChanges();

    this.startCountDown$ = this.firebase
      .object('rooms/' + this.room.uid + '/startCountDown')
      .valueChanges();

    this.startCountDown$.subscribe((bool: boolean) => {
      if (bool) {
        this.countDownService.startCountDownEmitter.emit(
          this.room.countDownReset
        );
      }
    });

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
    this.firebaseService.enqueueUpdate(
      'rooms/' + this.room.uid + '/users/' + this.user.uid + '/points',
      Number(point)
    );
    this.firebaseService.postUpdates();
  }

  private ResetCountDown(): void {
    this.isCountingDown = false;
    this.countdown = this.room.countDownReset;
    this.voteCountDownNumber = this.room.countDownReset;

    this.firebaseService.enqueueUpdate(
      'rooms/' + this.room.uid + '/isVoting',
      this.isVoteCalled
    );
    this.firebaseService.enqueueUpdate(
      'rooms/' + this.room.uid + '/countDown',
      this.room.countDownReset
    );
    this.firebaseService.postUpdates();
  }

  public callVote(): void {
    // if (!this.amHost) return;
    // if (this.isCountingDown) {
    //   this.ResetCountDown();
    //   return;
    // }
    // this.isCountingDown = true;
    // this.voteCountDownNumber = this.room.countDownReset;

    this.firebaseService.enqueueUpdate(
      'rooms/' + this.room.uid + '/countDown',
      this.voteCountDownNumber
    );
    this.firebaseService.enqueueUpdate(
      'rooms/' + this.room.uid + '/startCountDown',
      true
    );
    this.firebaseService.postUpdates();
  }

  public resetVote(): void {
    this.isVoteCalled = false;
    this.users.forEach((user) => {
      this.firebaseService.enqueueUpdate(
        'rooms/' + this.room.uid + '/users/' + user.uid + '/points',
        0
      );
    });
    this.firebaseService.enqueueUpdate(
      'rooms/' + this.room.uid + '/isVoting',
      this.isVoteCalled
    );
    this.firebaseService.enqueueUpdate(
      'rooms/' + this.room.uid + '/countDown',
      this.room.countDownReset
    );
    this.firebaseService.postUpdates();
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
