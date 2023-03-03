import { Component, HostListener, OnInit } from '@angular/core';
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
  pluck,
  Subject,
} from 'rxjs';
import { Chart } from 'chart.js';

export interface IUser {
  key: string;
  name: string;
  vote: number;
}

export interface IRoom {
  createTime: Date;
  host: string;
  key: string;
  roomName: string;
  users: IUser[];
}

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit {
  myDatabase: any;

  continueSession: boolean;
  userName: string = '';
  roomName: string = '';
  roomsRef$: AngularFireList<any>;
  roomUserRef$: AngularFireList<any>;

  hasSession: any;
  amHost: any;
  roomKey: any;

  userID: any;
  userCount: number = 0;
  roomUserRef: any;
  roomUsersRef: any;
  roomUsersValueChanges$: Observable<any[]>;

  roomRef: any;
  roomValueChanges$: Observable<any>;
  room$: Observable<IRoom>;
  roomSub: Subject<IRoom> = new Subject<IRoom>();
  room: IRoom;

  pointRef: any;
  selectedButton: number = 0;

  effortPoints: number[] = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  votes: any[] = [];
  votes$: Observable<number[]>;

  constructor(
    private asf: AngularFirestore,
    private db: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.myDatabase = db.database;
    this.continueSession = false;
    this.hasSession = localStorage.getItem('session');

    // no session, redirect
    if (this.hasSession == null || this.hasSession == 'false') {
      console.log('no session, redirecting to home from vote');
      this.router.navigateByUrl('/home');
    }
    this.roomKey = localStorage.getItem('currentRoom');
    var roomRef = this.db.database.ref('rooms/' + this.roomKey);
    roomRef.on('value', this.gotData, this.errData);
  }

  private gotData(data: any) {
    var room = data.val();
    console.log('room', room);

    var keys = Object.keys(room);
    console.log('key', keys);

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var host = room[k].host;
      var date = room[k].createTime;
      var roomName = room[k].roomName;
      var key = room[k].key;
      console.log(host, date, roomName, key);
    }
  }

  private errData(err: any) {
    console.log('Error!');
  }

  ngOnInit(): void {
    this.amHost = localStorage.getItem('amHost');
    console.log('amHost: ', this.amHost);
    // removes the user if navigating away from the vote page
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.removeUser(event);
        localStorage.setItem('session', 'false');
      }
    });

    // set currentUser from local storage
    this.userName = window.localStorage.getItem('name') ?? '';

    // this.roomsRef$ = this.myDatabase.ref("rooms/" + this.roomKey + "/users");

    console.log('room key', this.roomKey);
    this.roomRef = this.db.database.ref('rooms/' + this.roomKey);
    // this.roomValueChanges$ = this.roomRef.valueChanges();
    // this.getRoom();

    // this.room$ = this.roomRef.valueChanges();

    console.log('room', this.room);
    //  this.roomRef.once('value')
    //    .then((s: { val: () => any; }) => {
    //      this.room = {
    //        createTime: s.val().createTime as Date,
    //        host: s.val().host.toString(),
    //        key: s.val().key.toString(),
    //        roomName: s.val().roomName.toString(),
    //        users: new Array<IUser>()
    //      };
    //      console.log('room', this.room);
    //    });

    var roomUsersRef = this.myDatabase.ref('rooms/' + this.roomKey + '/users');
    this.roomsRef$ = roomUsersRef;
    // add user to room
    var newUserData = {
      key: '',
      name: this.userName,
      point: 0,
    };

    var newUser = roomUsersRef.push();
    this.userID = newUser.key;
    newUserData.key = this.userID;
    console.log('user ID', this.userID);
    localStorage.setItem('currentUser', this.userID);

    this.roomUsersRef = this.db.list('rooms/' + this.roomKey + '/users');
    this.roomUsersValueChanges$ = this.roomUsersRef.valueChanges();
    this.roomUsersValueChanges$.subscribe((users: any) => {
      this.userCount = users.length;
    });

    this.votes$ = this.roomUsersValueChanges$.pipe(
      map((users) => users.map((user) => user.point))
    );

    this.roomUserRef = this.myDatabase.ref(
      'rooms/' + this.roomKey + '/users/' + this.userID
    );
    this.pointRef = this.myDatabase.ref(
      'rooms/' + this.roomKey + '/users/' + this.userID + '/point'
    );
    newUser.set(newUserData);
  }

  public castVote(point: number): void {
    this.myDatabase
      .ref('rooms/' + this.roomKey + '/users/' + this.userID + '/point')
      .set(point);
    this.selectedButton = point;
    console.log('selected button: ', this.selectedButton);
  }

  public async callVote(): Promise<void> {
    if (!this.amHost) return;
    // this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
    // this.roomUsersRef = this.db.list("rooms/" + this.userRoom + "/users");
    // this.roomUsers$ = this.roomUsersRef.valueChanges();
    this.roomUsersValueChanges$.subscribe((users) => {
      console.log('users', users);
    });
    console.log('votes', this.votes);
    this.votes = await lastValueFrom(
      this.roomUsersValueChanges$.pipe(
        map((users) =>
          users.map((user) => {
            user.point;
          })
        ),
        catchError((err) => {
          console.log(err);
          return EMPTY;
        })
      )
    );

    this.resetVote();
  }

  private resetVote(): void {
    this.roomKey = window.localStorage.getItem('currentRoom') ?? '';
    this.roomUsersRef = this.db.list('rooms/' + this.roomKey + '/users');
  }

  private removeUser(event: any): void {
    if (event.url == '/vote') return;
    // remove user from room
    var userRef = this.myDatabase.ref(
      'rooms/' + this.roomKey + '/users/' + this.userID
    );
    userRef.remove();
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // end session if navigating away from ScrumBuddy
    if (!this.continueSession) {
      localStorage.setItem('session', 'false');
    }
    localStorage.setItem('session', 'false');

    this.router.navigateByUrl('/home');
  }
}
