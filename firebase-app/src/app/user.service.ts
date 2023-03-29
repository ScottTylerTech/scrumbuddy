import { Injectable } from '@angular/core';
import { BehaviorSubject, last, Observable, of } from 'rxjs';
import { IUser } from './entities/IUser';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user$: BehaviorSubject<IUser> = new BehaviorSubject({} as IUser);

  constructor() {}

  setUser(user: IUser): void {
    this.user$.next(user);
  }

  getUser(): IUser {
    return this.user$.getValue();
  }

  isUserHost(): boolean {
    return this.user$.getValue().amHost ?? false;
  }
}
