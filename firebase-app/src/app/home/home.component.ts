import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IUser } from '../entities/IUser';
import { uid } from 'uid/single';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  @Input() user$: BehaviorSubject<IUser> = new BehaviorSubject({} as IUser);
  @Output() userCreateEvent: EventEmitter<IUser> = new EventEmitter<IUser>();

  hasSession: boolean = false;
  userForm: FormGroup;

  constructor(
    private firebase: AngularFireDatabase,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  createUser(isHost: boolean): void {
    var dbRef = this.firebase.database.ref('users');
    let user: IUser = {
      uid: uid(),
      name: this.userForm.value.name,
      points: 0,
      amHost: isHost,
    };
    dbRef.child(user.uid).set(user);
    this.user$.next(user);
    this.userCreateEvent.emit(user);
    console.log('user: ', user);
  }
}
