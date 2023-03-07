import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NavigationEnd, Router } from '@angular/router';
import { IUser } from './entities/IUser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'firebase-app';
  user: IUser;

  constructor(private router: Router) {
    // this.resetLocalStorage();
  }

  ngOnInit(): void {
    // this.router.navigate(['/home']);
    // this.router.events.subscribe((event: any) => {
    //   if (event instanceof NavigationEnd) {
    //     const urlParams = event.url.split(';');
    //     this.title = urlParams[0].slice(1);
    //   }
    // });
  }

  public imgClick(): void {
    this.resetLocalStorage();
    localStorage.setItem('session', '');
    this.router.navigateByUrl('/home');
  }

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
  }
}
