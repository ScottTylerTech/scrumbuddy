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

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit {
  @Input() user$: Subject<IUser> = new Subject();
  @Output() roomSelectEvent: EventEmitter<IRoom> = new EventEmitter<IRoom>();
  @Output() updateUserEvent: EventEmitter<IUser> = new EventEmitter<IUser>();
  rooms$: Observable<IRoom[]>;
  user: IUser = {} as IUser;
  roomCount: number = 0;

  constructor(private firebase: AngularFireDatabase) {}

  async ngOnInit(): Promise<void> {
    let roomsRef: any = await this.firebase.list('rooms/');
    this.rooms$ = roomsRef.valueChanges();
    this.rooms$.subscribe((res) => {
      this.roomCount = res.length;
      // console.log('Rooms', { res });
    });

    this.user$.subscribe((user) => {
      this.user = user;
    });
  }

  public joinRoom(roomUID: string): void {
    let selectedRoom: IRoom = {} as IRoom;
    this.firebase.database.ref('rooms/' + roomUID).once('value', (room) => {
      selectedRoom = room.val();
    });

    var ref = this.firebase.database.ref('rooms/' + roomUID + '/users');
    ref.child(this.user.uid).set(this.user);
    // console.log('selectedRoom', { selectedRoom });
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

  getRomCount(value: any): number {
    return Object.keys(value).length;
  }
}
