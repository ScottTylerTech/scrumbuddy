import { Component, HostListener } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase/compat';
import { map, Observable } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { User } from '../entities/user';


// export type User = {uid: number, id: number; name: string;} | null;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  continueSession: boolean;

  userCollections: AngularFirestoreCollection<User>;
  users$: Observable<User[]> = new Observable<User[]>();

  localUser: User = null;
  number: number = 0;
  title = 'firebase-app';

  name: string = '';

  id: string = '';

  constructor(
    private afs: AngularFirestore,
    private router: Router,
  ) { }
  
  ngOnInit(): void {
    // user collection references
    this.userCollections = this.afs.collection<User>('users');
    this.users$ = this.userCollections.valueChanges();

    localStorage.setItem("session", "true");
    this.continueSession = false;
  }

  public join(): void { 
    if (!this.nameIsEmpty()) { 
      this.SetUserName();
      this.continueSession = true;
      this.router.navigateByUrl('/rooms');
    }

  }

  public async host(): Promise<void> {
    if (!this.nameIsEmpty()) {
      this.SetUserName();
      this.continueSession = true;
      this.router.navigateByUrl('/host');
    }
  }

  public nameIsEmpty(): boolean { 
    if (this.name === '') { 
      return true;
    }
    return false;
  }


  private SetUserName(): void { 
    // const user: User = {
    //   uid: 0,
    //   id: Math.random() * 100,
    //   name: this.name,
    // };
    // window.localStorage.setItem('user', JSON.stringify(user));
    // this.userCollections.add(user);
    window.localStorage.setItem('name', this.name);
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    if (!this.continueSession) {
      localStorage.setItem("session", "false");
    }
  }
}
