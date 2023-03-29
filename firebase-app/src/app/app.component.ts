import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { BehaviorSubject } from 'rxjs';
import { IRoom } from './entities/IRoom';
import { IUser } from './entities/IUser';
import { LoadState } from './entities/LoadState';
import { RoomService } from './room.service';
import { StateService } from './state.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  user$: BehaviorSubject<IUser> = new BehaviorSubject({} as IUser);
  user: IUser = {} as IUser;

  room$: BehaviorSubject<IRoom> = new BehaviorSubject({} as IRoom);
  state$ = new BehaviorSubject<LoadState>(LoadState.home);
  public LoadState = LoadState;

  amHost: boolean = false;

  constructor(
    private firebase: AngularFireDatabase,
    public stateService: StateService,
    private userService: UserService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.stateService.next(LoadState.home);
    // this.state$.next(LoadState.home);
    // this.user$.subscribe((user) => {
    //   this.user = user;
    //   this.amHost = user.amHost ?? false;
    // });
  }
  setUser(user: IUser): void {
    this.userService.setUser(user);
    if (this.userService.isUserHost()) {
      // this.state$.next(LoadState.host);
      this.stateService.next(LoadState.host);
    } else {
      this.stateService.next(LoadState.rooms);
      // this.state$.next(LoadState.rooms);
    }
  }

  setRoom(room: IRoom): void {
    // this.room$.next(room);
    // var usersDBRef = this.firebase.database.ref(
    //   'rooms/' + room.uid + '/users/'
    // );
    // usersDBRef.child(this.user.uid).set(this.user);
    // this.state$.next(LoadState.vote);

    this.roomService.setRoom(room);
    this.stateService.next(LoadState.vote);
  }

  updateState(state: LoadState): void {
    // this.state$.next(state);
    this.stateService.next(state);
  }
}
