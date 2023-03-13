import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IRoom } from './entities/IRoom';
import { IUser } from './entities/IUser';
import { LoadState } from './entities/LoadState';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // user$: Observable<IUser> = new Observable();
  user$: BehaviorSubject<IUser> = new BehaviorSubject({} as IUser);
  user: IUser = {} as IUser;

  room$: BehaviorSubject<IRoom> = new BehaviorSubject({} as IRoom);
  state$ = new BehaviorSubject<LoadState>(LoadState.home);
  public LoadState = LoadState;

  amHost: boolean = false;

  constructor(private firebase: AngularFireDatabase) {}

  ngOnInit(): void {
    this.state$.next(LoadState.home);
    this.user$.subscribe((user) => {
      this.user = user;
      this.amHost = user.amHost ?? false;
      console.log('user', { user });
    });
  }

  ngOnDestroy(): void {
    this.user$.unsubscribe();
    this.room$.unsubscribe();
    this.state$.unsubscribe();
  }

  setUser(user: IUser): void {
    this.user$.next(user);
    if (this.amHost) {
      this.state$.next(LoadState.host);
    } else {
      this.state$.next(LoadState.rooms);
    }
  }

  setRoom(room: IRoom): void {
    this.room$.next(room);

    var usersDBRef = this.firebase.database.ref(
      'rooms/' + room.uid + '/users/'
    );
    usersDBRef.child(this.user.uid).set(this.user);

    this.state$.next(LoadState.vote);
  }

  updateState(state: LoadState): void {
    this.state$.next(state);
  }
}
