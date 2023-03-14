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

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
})
@Injectable()
export class HostComponent implements OnInit {
  roomForm: FormGroup;

  @Input() user$: BehaviorSubject<IUser> = new BehaviorSubject({} as IUser);
  user: IUser = {} as IUser;
  @Output() roomCreateEvent: EventEmitter<IRoom> = new EventEmitter<IRoom>();

  constructor(
    private firebase: AngularFireDatabase,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      roomName: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  public createRoom(): void {
    this.user$.subscribe((user) => {
      this.user = user;
    });

    var dbRef = this.firebase.database.ref('rooms');
    let room: IRoom = {
      createTime: JSON.stringify(new Date()),
      host: this.user,
      roomName: this.roomForm.value.roomName,
      uid: uid(),
      users: [],
      isVoting: false,
    };
    dbRef.child(room.uid).set(room);
    this.roomCreateEvent.emit(room);
  }
}
