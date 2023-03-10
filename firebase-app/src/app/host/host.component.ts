import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IRoom } from '../entities/IRoom';
import {
  AngularFireDatabase,
  PathReference,
} from '@angular/fire/compat/database';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
})
export class HostComponent implements OnInit {
  user: IUser;
  room: IRoom = {} as IRoom;
  roomDBRef: any;
  hasSession: any;

  constructor(private router: Router, private firebase: AngularFireDatabase) {
    // get from local storage
    this.room.roomName = '';
    this.hasSession = localStorage.getItem('session');
    this.user = JSON.parse(localStorage.getItem('user') ?? '');
    this.roomDBRef = this.firebase.database.ref('rooms');
  }

  ngOnInit(): void {}

  public createRoom(): void {
    var newRoom = this.roomDBRef.push();
    // var roomUsersDBRef = this.firebase.database.ref(
    //   'rooms/' + this.room.key + '/users'
    // );
    // var newUser = roomUsersDBRef.push();
    // this.user.key = newUser.key || '';

    this.room.createTime = JSON.stringify(new Date());
    this.room.host = this.user;
    this.room.roomName = this.room.roomName;
    this.room.key = newRoom.key;
    this.room.users = [];
    this.room.isVoting = false;

    localStorage.setItem('roomKey', this.room.key);
    localStorage.setItem('amHost', 'true');

    newRoom.set(this.room);

    // if (this.user.key === '') {
    //   console.log('user key is empty');
    //   return;
    // }

    window.localStorage.setItem('roomKey', this.room.key);
    window.localStorage.setItem('user', JSON.stringify(this.user));
    this.router.navigateByUrl('/vote');
  }
}
