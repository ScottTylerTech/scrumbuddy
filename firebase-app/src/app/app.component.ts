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
    this.resetLocalStorage();
    localStorage.setItem('session', 'true');
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
    this.resetLocalStorage();
    this.router.navigateByUrl('/home');
  }

  private resetLocalStorage(): void {
    localStorage.setItem('session', '');
    localStorage.setItem('user', '');
    localStorage.setItem('amHost', '');
    localStorage.setItem('roomKey', '');
  }
}
