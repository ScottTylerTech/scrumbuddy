import { Component, HostListener } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavigationEnd, Router } from '@angular/router';
import { IUser } from '../entities/IUser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  user: IUser;
  hasSession: boolean = false;

  constructor(private afs: AngularFirestore, private router: Router) {
    // window.localStorage.setItem('session', 'true');
    this.hasSession = localStorage.getItem('session') === 'true';
    this.user = {
      name: '',
      key: '',
      points: 0,
    };
  }

  ngOnInit(): void {
    // window.localStorage.setItem('session', 'true');
    // window.localStorage.setItem('session', 'true');
    // this.router.events.subscribe((event: any) => {
    //   if (
    //     this.hasSession &&
    //     event instanceof NavigationEnd &&
    //     event.url != '/home'
    //   ) {
    //     console.log('removing room and user from ' + event.url);
    //     this.resetLocalStorage();
    //   }
    // });
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
    // this.resetLocalStorage();
  }

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
  }
}
