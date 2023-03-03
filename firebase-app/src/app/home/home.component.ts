import { Component, HostListener } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  user: IUser;
  // joinRoom: boolean = false;
  // hostRoom: boolean = false;

  constructor(private afs: AngularFirestore, private router: Router) {
    this.user = {
      name: '',
      key: '',
      points: 0,
    };
  }

  ngOnInit(): void {
    window.localStorage.setItem('session', 'true');
  }

  public join(): void {
    if (this.user.name !== '') {
      this.SetUserName();
      this.router.navigateByUrl('/rooms');
    }
  }

  public async host(): Promise<void> {
    if (this.user.name !== '') {
      this.SetUserName();
      this.router.navigateByUrl('/host');
    }
  }

  private SetUserName(): void {
    window.localStorage.setItem('user', JSON.stringify(this.user));
  }

  @HostListener('window:beforeunload')
  windowBeforeUnload() {
    this.ClearLocalStore();
  }

  ClearLocalStore() {
    window.localStorage.removeItem('name');
    window.localStorage.removeItem('session');
  }
}
