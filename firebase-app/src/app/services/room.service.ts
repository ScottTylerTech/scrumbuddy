import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { BehaviorSubject, last, map, takeLast } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { FirebaseService } from './firebase.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  room$: BehaviorSubject<IRoom> = new BehaviorSubject({} as IRoom);

  constructor(
    private firebase: AngularFireDatabase,
    private userService: UserService
  ) {}

  setRoom(room: IRoom): void {
    const user = this.userService.getUser();

    var usersDBRef = this.firebase.database.ref(
      'rooms/' + room.uid + '/users/'
    );
    usersDBRef.child(user.uid).set(user);

    this.room$.next(room);
  }

  getRoom(): IRoom {
    return this.room$.getValue();
  }
}
