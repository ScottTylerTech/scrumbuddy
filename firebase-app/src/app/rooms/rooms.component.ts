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
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
  }

  ngOnInit(): void {
    // this.router.events.subscribe((event: any) => {
    //   if (
    //     !this.hasSession &&
    //     event instanceof NavigationEnd &&
    //     event.url != '/rooms'
    //   ) {
    //     console.log('removing room and user from ' + event.url);
    //     this.resetLocalStorage();
    //   }
    // });

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

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {}
}
