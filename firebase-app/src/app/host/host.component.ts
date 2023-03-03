import { Component, HostListener, Input, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { map, tap } from 'rxjs/operators';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { IUser } from '../entities/IUser';

export interface IUserVote {
  name: string;
  vote: number;
}

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
})
export class HostComponent implements OnInit {
  startVote: boolean = false;
  voteTotal: number = 0;

  votes: any[] = [];

  isRoomHosted: boolean = false;
  continueSession: boolean;
  hasSession: any;
  firebase: any;
  roomName: string = '';
  roomID: string = '';

  roomCollection: AngularFirestoreCollection<any>;
  // rooms$: Observable<IRoom[]> = new Observable<IRoom[]>();
  // roomsRef$: Observable<any> = new Observable<any>();

  roomsRef$: AngularFireList<any>;
  rooms$: Observable<any[]>;
  roomUsersRef: any;
  roomUsers$: Observable<any[]>;
  userName: string = '';
  userRoom: any;
  userID: any;

  // ----
  // @Input() user: IUser;
  user: IUser;

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private db: AngularFireDatabase
  ) {
    this.firebase = db.database;

    // get from local storage
    this.hasSession = localStorage.getItem('session');
    this.user = JSON.parse(localStorage.getItem('user') ?? '');

    if (this.hasSession == null || this.user.name === '') {
      console.log('No user, no session, redirect from host');
      // no user, no session, redirect
      this.router.navigateByUrl('/home');
    }

    // rooms collection references
    this.roomCollection = this.afs.collection<any>('rooms');
    // this.rooms$ = this.roomCollection.valueChanges();
    console.log('room', this.userRoom);
    this.roomUsersRef = this.db.list('rooms/' + this.userRoom + '/users');
    this.roomUsers$ = this.roomUsersRef.valueChanges();

    this.roomsRef$ = this.db.list('rooms');
    this.rooms$ = this.roomsRef$.valueChanges();

    console.log('votes', this.votes);
  }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        console.log('remvoing user from host');
        this.removeUser(event);
        this.removeRoom(event);
        localStorage.setItem('session', 'false');
      }
    });
  }

  public createRoom(): void {
    var roomRef = this.db.database.ref('rooms');
    var newRoomData = {
      createTime: JSON.stringify(new Date()),
      host: localStorage.getItem('name'),
      roomName: this.roomName,
      key: '',
      users: {
        // name: this.userName,
        // point: 0
      },
    };

    var newRoom = roomRef.push();
    newRoomData.key = newRoom.key ?? '';
    localStorage.setItem('currentHostRoomID', newRoom.key ?? '');
    localStorage.setItem('currentRoom', newRoom.key ?? '');
    localStorage.setItem('amHost', 'true');
    this.roomID = newRoom.key ?? '';
    newRoom.set(newRoomData);

    this.isRoomHosted = true;
  }

  public async callVote(): Promise<void> {
    this.resetVote();
    this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
    this.roomUsersRef = this.db.list('rooms/' + this.userRoom + '/users');
    this.roomUsers$ = this.roomUsersRef.valueChanges();
    this.roomUsers$.subscribe((users) => {
      console.log('users', users);
    });

    this.votes = await lastValueFrom(
      this.roomUsers$.pipe(
        map((users) =>
          users.map((user) => {
            user.point;
          })
        )
      )
    );

    console.log('votes', this.votes);
  }

  private resetVote(): void {
    this.voteTotal = 0;
    this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
    this.roomUsersRef = this.db.list('rooms/' + this.userRoom + '/users');
  }

  private removeUser(event: any): void {
    if (event.url == '/host') return;
    // remove user from room
    var userRef = this.firebase.ref(
      'rooms/' + this.userRoom + '/users/' + this.userID
    );
    userRef.remove();
  }

  private removeRoom(event: any): void {
    if (event.url == '/host') return;
    // remove user from room
    var userRef = this.firebase.ref('rooms/' + this.userRoom);
    userRef.remove();
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // remove room if the user closes window
    // do NOT remove if window close is due to starting vote
    if (!this.startVote && this.roomID !== '') {
      localStorage.setItem('session', 'false');
      localStorage.setItem('amHost', 'false');

      var roomRef = this.firebase.ref('rooms/' + this.roomID);
      roomRef.remove();
    }
    // end session if navigating away from ScrumBuddy
    if (!this.continueSession) {
      localStorage.setItem('session', 'false');
      localStorage.setItem('amHost', 'false');
    }
  }
}
