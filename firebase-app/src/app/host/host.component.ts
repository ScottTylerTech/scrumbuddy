import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IRoom } from '../entities/IRoom';
import {
  AngularFireDatabase,
  PathReference,
} from '@angular/fire/compat/database';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
})
export class HostComponent implements OnInit {
  user: IUser;
  room: IRoom = {} as IRoom;
  roomDBRef: any;
  hasSession: any;

  constructor(private router: Router, private firebase: AngularFireDatabase) {
    // get from local storage
    this.hasSession = localStorage.getItem('session');
    this.user = JSON.parse(localStorage.getItem('user') ?? '');

    // verify session
    if (this.hasSession == null || this.user.name === '') {
      console.log('No user, no session, redirect from host');
      // no user, no session, redirect
      this.router.navigateByUrl('/home');
    }

    // set references to database
    this.roomDBRef = this.firebase.database.ref('rooms');
  }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd && event.url != '/host') {
        console.log('removing room and user from host');
        this.removeUser(event);
        // this.removeRoom(event);
        localStorage.setItem('session', 'false');
      }
    });
  }

  public createRoom(): void {
    var newRoom = this.roomDBRef.push();

    this.room.createTime = JSON.stringify(new Date());
    this.room.host = this.user.name;
    this.room.roomName = this.room.roomName;
    this.room.key = newRoom.key;
    this.room.users = [];

    localStorage.setItem('roomKey', this.room.key);
    localStorage.setItem('amHost', 'true');

    newRoom.set(this.room);

    var roomUsersDBRef = this.firebase.database.ref(
      'rooms/' + this.room.key + '/users'
    );
    var newUser = roomUsersDBRef.push();
    this.user.key = newUser.key || '';

    if (this.user.key === '') {
      console.log('user key is empty');
      return;
    }

    newUser.set(this.user);
    window.localStorage.setItem('roomKey', this.room.key);
    window.localStorage.setItem('user', JSON.stringify(this.user));
    this.router.navigateByUrl('/vote');
  }

  // public async callVote(): Promise<void> {
  //   this.resetVote();
  //   this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
  //   this.roomUsersRef = this.firebase.list('rooms/' + this.userRoom + '/users');
  //   this.roomUsers$ = this.roomUsersRef.valueChanges();
  //   this.roomUsers$.subscribe((users) => {
  //     console.log('users', users);
  //   });

  //   this.votes = await lastValueFrom(
  //     this.roomUsers$.pipe(
  //       map((users) =>
  //         users.map((user) => {
  //           user.point;
  //         })
  //       )
  //     )
  //   );

  //   console.log('votes', this.votes);
  // }

  // private resetVote(): void {
  //   this.voteTotal = 0;
  //   this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
  //   this.roomUsersRef = this.firebase.list('rooms/' + this.userRoom + '/users');
  // }

  private removeUser(event: any): void {
    if (event.url == '/host') return;
    // remove user from room
    var userRef = this.firebase.database.ref(
      'rooms/' + this.room.key + '/users/' + this.user.key
    );
    userRef.remove();
  }

  private removeRoom(event: any): void {
    if (event.url == '/host') return;
    // remove room from database
    var userRef = this.firebase.database.ref('rooms/' + this.room.key);
    // userRef.remove();
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // remove room if the user closes window
    // do NOT remove if window close is due to starting vote
    localStorage.setItem('amHost', 'false');
    var roomRef = this.firebase.database.ref('rooms/' + this.room.key);
    // roomRef.remove();
  }
}
