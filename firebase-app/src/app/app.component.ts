import { Component, OnInit } from '@angular/core';
import { IRoom } from './entities/IRoom';
import { IUser } from './entities/IUser';
import { LoadState } from './entities/LoadState';
import { RoomService } from './services/room.service';
import { StateService } from './services/state.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  user: IUser = {} as IUser;
  public LoadState = LoadState;

  constructor(
    public stateService: StateService,
    private userService: UserService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.stateService.next(LoadState.home);
  }

  setUser(user: IUser): void {
    this.userService.setUser(user);
    if (this.userService.isUserHost()) {
      this.stateService.next(LoadState.host);
    } else {
      this.stateService.next(LoadState.rooms);
    }
  }

  setRoom(room: IRoom): void {
    this.roomService.setRoom(room);
    this.stateService.next(LoadState.vote);
  }

  updateState(state: LoadState): void {
    this.stateService.next(state);
  }
}
