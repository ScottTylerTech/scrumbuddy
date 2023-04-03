import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  updates: any = {};
  constructor(private firebase: AngularFireDatabase) {}

  enqueueUpdate(key: string, value: any): void {
    this.updates[key] = value;
  }
  postUpdates(): void {
    this.firebase.database.ref().update(this.updates);
    this.clearUpdates();
  }
  clearUpdates(): void {
    this.updates = {};
  }
}
