import { Component, OnInit } from '@angular/core';
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
  userSelected: boolean = false;
  hasSession: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.state$.next(LoadState.home);
    this.user$.subscribe((user) => {
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
    this.hasSession = true;
    this.state$.next(LoadState.vote);
  }
}
