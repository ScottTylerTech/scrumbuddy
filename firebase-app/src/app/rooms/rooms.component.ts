import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { NavigationStart, Router } from '@angular/router';
import { map, Observable, Subject, tap } from 'rxjs';
import { IRoom } from '../entities/IRoom';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit, OnDestroy {
  @Input() user$: Subject<IUser> = new Subject();
  user: IUser = {} as IUser;
  roomsRef$: AngularFireList<any>;
  roomCount: number = 0;
  hasSession: boolean;
  roomDBRef: any;
  roomKey: string = '';
  rooms$: Observable<IRoom[]>;
  rooms: IRoom[] = [];

  constructor(private firebase: AngularFireDatabase, private router: Router) {}

  ngOnInit(): void {
    this.roomsRef$ = this.firebase.list('rooms');
    this.rooms$ = this.roomsRef$.valueChanges();
    this.rooms$.subscribe((res) => {
      this.roomCount = res.length;
      console.log('Rooms', { res });
    });

    // removes the user if navigating away from the vote page
    // this.router.events.subscribe((event: any) => {
    //   if (event instanceof NavigationStart) {
    //     console.log('NavigationEnd', this.router.navigated);
    //   }
    // });

    this.user$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }

  public joinRoom(room: string): void {
    localStorage.setItem('roomKey', room);
    this.router.navigateByUrl('/vote');
  }

  public host(): void {
    // change amHost to true in user$
    this.user.amHost = true;
    this.user$.next(this.user);
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
