import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'firebase-app';

  constructor(private router: Router) {
    localStorage.setItem('session', '');
    localStorage.setItem('userName', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
    localStorage.setItem('currentUser', '');
  }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const urlParams = event.url.split(';');
        this.title = urlParams[0].slice(1);
      }
    });
  }

  public imgClick(): void {
    localStorage.setItem('session', 'false');
    localStorage.setItem('amHost', 'false');
    localStorage.setItem('currentRoom', '');
    localStorage.setItem('currentUser', '');

    this.router.navigateByUrl('/home');
  }
}
