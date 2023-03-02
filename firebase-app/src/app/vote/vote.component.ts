import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ref, set } from "firebase/database";

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
  myDatabase: any;

  continueSession: boolean;
  userName: string = '';
  roomsRef$: AngularFireList<any>;
  roomUserRef$: AngularFireList<any>;
  
  hasSession: any;
  amHost: any;
  userRoom: any;
  userID: any;
  userCount: number = 0;
  roomUserRef: any;
  roomUsersRef: any;
  roomUsers$: Observable<any[]>;
  pointRef: any;
  selectedButton: number = 0;

  effortPoints: number[] = [1, 2, 3, 5, 8, 13, 21, 34, 55];

  constructor(
    private asf: AngularFirestore,
    private db: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.myDatabase = db.database;
    this.continueSession = false;
    this.hasSession = localStorage.getItem("session");
    
    // no session, redirect
    if (this.hasSession == null || this.hasSession == "false") {
      // this.router.navigateByUrl('/home');
    }

    this.amHost = localStorage.getItem("amHost");
    
    // set currentUser from local storage
    this.userName = window.localStorage.getItem('name') ?? '';
    this.userRoom = localStorage.getItem("currentHostRoomID");
    this.roomsRef$ = this.myDatabase.ref("rooms/" + this.userRoom + "/users");
    var roomRef = this.myDatabase.ref("rooms/" + this.userRoom + "/users");
    // add user to room
    var newUserData = {
      key: '',
      name: this.userName,
      point: 0
    };

    var newUser = roomRef.push();
    this.userID = newUser.key;
    newUserData.key = this.userID;
    console.log('user ID',this.userID);
    localStorage.setItem("currentUser", this.userID);
    this.roomUsersRef = this.db.list("rooms/" + this.userRoom + "/users");
    this.roomUsers$ = this.roomUsersRef.valueChanges();
    this.roomUsers$.subscribe((users: any) => { 
      this.userCount = users.length;
    });
    this.roomUserRef = this.myDatabase.ref("rooms/" + this.userRoom + "/users/" + this.userID);
    this.pointRef =  this.myDatabase.ref("rooms/" + this.userRoom + "/users/" + this.userID + "/point");
    newUser.set(newUserData);

    // this.pointRef.set(5);
  }
  
  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.removeUser(event);
        
      }
    });

  }

  public castVote(point: number): void { 
    console.log("castVote", point);
    console.log('user room: ', this.userRoom, ' user id:', this.userID);
    this.myDatabase.ref("rooms/" + this.userRoom + "/users/" + this.userID + "/point").set(point);
    this.selectedButton = point;
    console.log('selected button: ', this.selectedButton);
  }

  private removeUser(event: any): void { 
    if (event.url == '/vote') return;
        console.log(event.url);
        var userRef = this.myDatabase.ref("rooms/" + this.userRoom + "/users/" + this.userID);
        console.log('removing user ID', {userRef});
        userRef.remove();
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // end session if navigating away from ScrumBuddy
    if (!this.continueSession)
    {
        localStorage.setItem("session", "false");
    }

    // remove user from room
    var userRef = this.myDatabase.ref("rooms/" + this.userRoom + "/users/" + this.userID);
    console.log('removing user ID', {userRef});
    userRef.remove();
    this.router.navigateByUrl('/home');

  //   this.myDatabase.ref("rooms/" + this.userRoom).on("value", (snapshot: any) => {
  //     if (snapshot.val() == null)
  //     {
  //        // room is deleted, remove this voter
  //     }
  //  });
  }
}
