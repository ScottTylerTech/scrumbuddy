import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoadState } from '../entities/LoadState';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  state$ = new BehaviorSubject<LoadState>(LoadState.home);
  constructor() {}

  next(state: LoadState): void {
    this.state$.next(state);
  }
}
