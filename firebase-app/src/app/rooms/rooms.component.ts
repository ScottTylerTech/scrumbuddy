import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit {
  @ViewChild('roomButtons') roomButtons: ElementRef;

  continueSession: boolean;
  hasSession: any;
  name: string = '';

  roomsRef$: AngularFireList<any>;
  rooms$: Observable<any[]>;

  roomCount: number = 0;

  //---
  @Input() user: IUser;
  // roomRef
  roomDBRef: any;
  // database
  firebase: AngularFireDatabase;

  constructor(
    private asf: AngularFirestore,
    private db: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.firebase = db;
  }

  ngOnInit(): void {
    // this.hasSession = localStorage.getItem('session');
    // if (this.hasSession == null || this.user.name === '') {
    //   console.log('No user, no session, redirect from rooms');
    //   // no user, no session, redirect
    //   this.router.navigateByUrl('/home');
    // }

    // get local storage

    this.roomDBRef = this.firebase.database.ref('rooms');

    // set currentUser from local storage
    this.name = window.localStorage.getItem('name') ?? '';

    this.roomsRef$ = this.db.list('rooms');
    this.rooms$ = this.roomsRef$.valueChanges();
    this.rooms$.subscribe((res) => {
      this.roomCount = res.length;
      console.log('Rooms', { res });
    });
  }

  public joinRoom(room: any): void {
    var roomKey = room.key;
    localStorage.setItem('currentRoom', room);
    this.continueSession = true;
    this.router.navigateByUrl('/vote');
  }

  public getDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const date = JSON.parse(value);
    return new Date(date);
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // end session if navigating away from ScrumBuddy
    if (!this.continueSession) {
      localStorage.setItem('session', 'false');
    }
  }
}
