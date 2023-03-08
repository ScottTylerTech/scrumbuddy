import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  user: IUser;
  hasSession: boolean = false;

  constructor(private router: Router) {
    this.resetLocalStorage();
    this.user = {
      name: '',
      key: '',
      points: 0,
    };
  }

  public join(): void {
    if (this.user.name !== '') {
      window.localStorage.setItem('user', JSON.stringify(this.user));
      this.router.navigateByUrl('/rooms');
    }
  }

  public async host(): Promise<void> {
    if (this.user.name !== '') {
      window.localStorage.setItem('user', JSON.stringify(this.user));
      this.router.navigateByUrl('/host');
    }
  }

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
  }
}
