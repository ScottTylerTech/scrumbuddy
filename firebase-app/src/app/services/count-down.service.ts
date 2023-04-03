import { EventEmitter, Injectable } from '@angular/core';
import { take, interval, finalize, BehaviorSubject } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { FirebaseService } from './firebase.service';
import { RoomService } from './room.service';

@Injectable({
  providedIn: 'root',
})
export class CountDownService {
  public startCountDownEmitter: EventEmitter<number> =
    new EventEmitter<number>();
  room: IRoom = {} as IRoom;
  count: BehaviorSubject<number> = new BehaviorSubject(0);
  isCountingDown: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private roomService: RoomService,
    private firebaseService: FirebaseService
  ) {
    this.startCountDownEmitter.subscribe((counter) => {
      this.room = this.roomService.getRoom();
      this.isCountingDown.next(true);
      const counter$ = interval(1000).pipe(
        take(counter + 2),
        finalize(() => {
          this.firebaseService.enqueueUpdate(
            'rooms/' + this.room.uid + '/isVoting',
            true
          );
          this.firebaseService.enqueueUpdate(
            'rooms/' + this.room.uid + '/startCountDown',
            false
          );
          this.firebaseService.postUpdates();
          this.isCountingDown.next(false);
          this.count.next(counter);
        })
      );

      counter$.subscribe((v) => {
        this.count.next(counter - v);
      });
    });
  }
}
