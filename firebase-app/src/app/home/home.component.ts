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
    window.localStorage.setItem('session', 'true');
    this.user = {
      name: '',
      key: '',
      points: 0,
    };
  }

  ngOnInit(): void {}

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
    this.resetLocalStorage();
  }

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
  }
}
