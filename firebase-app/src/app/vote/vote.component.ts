import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { IUser } from '../entities/IUser';
import { IRoom } from '../entities/IRoom';
import { IVote } from '../entities/IVote';
import { __param } from 'tslib';
import { ThisReceiver } from '@angular/compiler';

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
  host: IUser = {} as IUser;
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
  voteDistribution: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  voteData: IVote[] = [];
  voteResult: number = 0;
  votes$: Observable<number[]>;
  missedVotes: IUser[] = [];

  // counter
  result: any;

  constructor(private firebase: AngularFireDatabase, private router: Router) {
    // get local storage values
    this.hasSession = localStorage.getItem('session') === 'true';
    this.amHost = localStorage.getItem('amHost') === 'true';
    this.roomKey = localStorage.getItem('roomKey') || '';
    const userString = localStorage.getItem('user') || '';

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
      // if room has 0 users close
      if (room === null) {
        this.leaveRoom();
        return;
      }
      // this.isVoteCalled = room.isVoting;
      this.roomName = room.roomName;
      this.host = room.host as IUser;
      this.isVoteCalled = room.isVoting;
    });

    // parse and create user if not already created
    if (!this.hasSession) {
      this.user = JSON.parse(userString) as IUser;
      var newUser = this.usersDBRef.push();
      this.user.key = newUser.key;
      newUser.set(this.user);
      this.hasSession = true;
      localStorage.setItem('session', 'true');
      if (this.amHost) {
        this.host = this.user;
        var updates: any = {};
        updates['rooms/' + this.roomKey + '/host/'] = this.host;

        this.firebase.database.ref().update(updates);
      }
    }

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
    });
  }

  public clickBtn() {
    console.log('click');
  }

  ngOnInit(): void {}

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

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
    if (this.amHost) {
      this.firebase.database.ref('/rooms/' + this.roomKey).remove();
    } else {
      var ref = this.firebase.database.ref('/rooms/' + this.roomKey);
      ref.child('users/' + this.user.key).remove();
    }
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    this.resetLocalStorage();
  }
}
