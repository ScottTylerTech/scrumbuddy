import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { User } from '../app.component';
import { IRoom } from '../entities/IRoom';
import * as firebase from 'firebase/compat';
import { map, tap } from 'rxjs/operators';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

export interface IUserVote { 
  name: string;
  vote: number;
}

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
})
  
export class HostComponent implements OnInit{

  startVote: boolean = false;
  voteTotal: number = 0;

  votes: any[] = [];

  isRoomHosted: boolean = false;
  continueSession: boolean;
  hasSession: any;
  myDatabase: any;
  roomName: string = '';
  roomID: string = '';

  userCollections: AngularFirestoreCollection<User>;
  users$: Observable<User[]> = new Observable<User[]>();
  
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

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private db: AngularFireDatabase,
  ) { 
    this.myDatabase = db.database;
    this.continueSession = false;
    this.hasSession = localStorage.getItem("session");

    if (this.hasSession == null || this.hasSession == "false")
    {
        // no session, redirect
        // this.router.navigateByUrl('/home');
    }

    // set currentUser from local storage
    this.userName = window.localStorage.getItem('name') ?? '';
    this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
    // user collection references
    this.userCollections = this.afs.collection<User>('users');
    this.users$ = this.userCollections.valueChanges();
  
    // rooms collection references
    this.roomCollection = this.afs.collection<any>('rooms');
    // this.rooms$ = this.roomCollection.valueChanges();
    console.log('room', this.userRoom);
    this.roomUsersRef = this.db.list("rooms/" + this.userRoom + "/users");
    this.roomUsers$ = this.roomUsersRef.valueChanges();



    this.roomsRef$ = this.db.list('rooms');
    this.rooms$ = this.roomsRef$.valueChanges();

    console.log('votes', this.votes);
  }

  ngOnInit(): void {
    
  }

  public createRoom(): void { 
    var roomRef = this.db.database.ref('rooms');
    var newRoomData = {
      createTime: JSON.stringify(new Date()),
      host: localStorage.getItem("name"),
      roomName: this.roomName,
      key: '',
      users: { 
        // name: this.userName,
        // point: 0
      }
    };
    
    var newRoom = roomRef.push();
    newRoomData.key = newRoom.key ?? '';
    localStorage.setItem('currentHostRoomID', newRoom.key ?? '');
    localStorage.setItem("currentRoom", newRoom.key ?? '');
    localStorage.setItem("amHost", "true");
    this.roomID = newRoom.key ?? '';
    newRoom.set(newRoomData);

    this.isRoomHosted = true
  }

  public async callVote(): Promise<void> { 
    this.resetVote();
    this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
    this.roomUsersRef = this.db.list("rooms/" + this.userRoom + "/users");
    this.roomUsers$ = this.roomUsersRef.valueChanges();
    this.roomUsers$.subscribe((users) => { console.log('users', users)});
    
    this.votes = await lastValueFrom(this.roomUsers$.pipe(
      map(users => users.map(user => { user.point })
      
      )));
    
    console.log('votes', this.votes);
      

  }

  private resetVote(): void { 
    this.voteTotal = 0;
    this.userRoom = window.localStorage.getItem('currentRoom') ?? '';
    this.roomUsersRef = this.db.list("rooms/" + this.userRoom + "/users");
    

  }

  

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // remove room if the user closes window
    // do NOT remove if window close is due to starting vote
    if (!this.startVote && this.roomID !== '')
    {
        var roomRef = this.myDatabase.ref("rooms/" + this.roomID);
        roomRef.remove();
    }
    // end session if navigating away from ScrumBuddy
    if (!this.continueSession)
    {
        localStorage.setItem("session", "false");
    }
  }
}
