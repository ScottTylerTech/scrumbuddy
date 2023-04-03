import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IRoom } from '../entities/IRoom';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { IUser } from '../entities/IUser';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { uid } from 'uid';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { StateService } from '../services/state.service';
import { LoadState } from '../entities/LoadState';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
})
@Injectable()
export class HostComponent implements OnInit {
  roomForm: FormGroup;
  isOptionMenuClosed: boolean = false;
  @Input() user$: BehaviorSubject<IUser> = new BehaviorSubject({} as IUser);
  user: IUser = {} as IUser;
  @Output() roomCreateEvent: EventEmitter<IRoom> = new EventEmitter<IRoom>();

  constructor(
    private firebase: AngularFireDatabase,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      roomName: ['', [Validators.required, Validators.minLength(1)]],
      countDownTime: ['', [Validators.minLength(1)]],
    });
  }

  public createRoom(): void {
    const user = this.userService.getUser();
    const dbRef = this.firebase.database.ref('rooms');
    let room: IRoom = {
      createTime: JSON.stringify(new Date()),
      host: user,
      roomName: this.roomForm.value.roomName,
      uid: uid(),
      users: [],
      isVoting: false,
      startCountDown: false,
      countDown: 0,
      countDownReset:
        this.roomForm.value.countDownTime === ''
          ? 3
          : this.roomForm.value.countDownTime,
    };
    dbRef.child(room.uid).set(room);
    this.roomCreateEvent.emit(room);
  }

  public expandMenu(isClosed: boolean): void {
    this.isOptionMenuClosed = isClosed;
  }

  public onCancelClick(): void {
    this.stateService.next(LoadState.home);
  }
}
