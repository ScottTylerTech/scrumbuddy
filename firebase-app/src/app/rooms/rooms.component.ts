import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, Subject } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { IUser } from '../entities/IUser';
import { LoadState } from '../entities/LoadState';
import { RoomService } from '../services/room.service';
import { StateService } from '../services/state.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit {
  @Output() roomSelectEvent: EventEmitter<IRoom> = new EventEmitter<IRoom>();
  @Output() updateUserEvent: EventEmitter<IUser> = new EventEmitter<IUser>();
  rooms$: Observable<IRoom[]>;
  user: IUser = {} as IUser;
  roomCount: number = 0;

  constructor(
    private firebase: AngularFireDatabase,
    private stateService: StateService,
    private userService: UserService,
    private roomService: RoomService
  ) {}

  async ngOnInit(): Promise<void> {
    let roomsRef: any = await this.firebase.list('rooms/');
    this.rooms$ = roomsRef.valueChanges();
    this.rooms$.subscribe((res) => {
      this.roomCount = res.length;
    });

    this.user = this.userService.getUser();
  }

  public joinRoom(roomUID: string): void {
    let selectedRoom: IRoom = {} as IRoom;
    this.firebase.database.ref('rooms/' + roomUID).once('value', (room) => {
      selectedRoom = room.val();
    });

    var ref = this.firebase.database.ref('rooms/' + roomUID + '/users');
    ref.child(this.user.uid).set(this.user);
    this.roomSelectEvent.emit(selectedRoom);
  }

  public host(): void {
    this.user.amHost = true;
    this.updateUserEvent.emit(this.user);
  }

  public getDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const date = JSON.parse(value);
    return new Date(date);
  }

  getRoomCount(value: any): number {
    return Object.keys(value).length;
  }

  public onCancelClick(): void {
    this.stateService.next(LoadState.home);
  }
}
