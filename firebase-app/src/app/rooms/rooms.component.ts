import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit {
  @ViewChild('roomButtons') roomButtons: ElementRef;

  roomsRef$: AngularFireList<any>;
  roomCount: number = 0;
  hasSession: boolean;
  roomDBRef: any;
  roomKey: string = '';
  rooms$: Observable<IRoom[]>;
  rooms: IRoom[] = [];

  constructor(
    private asf: AngularFirestore,
    private firebase: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // get local storage
    this.hasSession = localStorage.getItem('session') === 'true';

    // verify session
    if (!this.hasSession) {
      console.log('No session redirect from rooms');
      this.router.navigateByUrl('/home');
    }
  }

  ngOnInit(): void {
    this.roomsRef$ = this.firebase.list('rooms');
    this.rooms$ = this.roomsRef$.valueChanges();
    this.rooms$.subscribe((res) => {
      this.roomCount = res.length;
      console.log('Rooms', { res });
    });
  }

  public joinRoom(room: string): void {
    localStorage.setItem('roomKey', room);
    this.router.navigateByUrl('/vote');
  }

  public getDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const date = JSON.parse(value);
    return new Date(date);
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    // end session if navigating away from ScrumBuddy
    localStorage.setItem('session', 'false');
  }
}
