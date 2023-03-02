import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { map, Observable } from 'rxjs';

interface IItem { name: string; id?: number; }
interface IUser { id: number; name: string; }

export type User = {uid: number, id: number; name: string;} | null;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  itemsCollection: AngularFirestoreCollection<IItem>;
  items$: Observable<IItem[]> = new Observable<IItem[]>();

  userCollections: AngularFirestoreCollection<User>;
  users$: Observable<User[]> = new Observable<User[]>();

  localUser: User = null;
  number: number = 0;
  title = 'firebase-app';

  name: string = '';

  id: string = '';
  constructor(
    private afs: AngularFirestore,
    private router: Router,
  ) { }
  
  ngOnInit(): void {
    this.itemsCollection = this.afs.collection<IItem>('items'); // reference to the collection
    this.items$ = this.itemsCollection.valueChanges(); // observable of the collection

    this.userCollections = this.afs.collection<User>('users');
    this.users$ = this.userCollections.valueChanges();

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
       this.title = event.url.slice(1);
        
      }
    });
  }

  public addItem() {
    const item: IItem = 
    {
      // id: faker.datatype.number(),
      // name: faker.commerce.product(),
      id: ++this.number,
      name: 'test',
    }
    this.itemsCollection.add(item);
  }

  public join(): void { 
    const user: User = {
      uid: 0,
      id: Math.random() * 100,
      name: this.name,
    };
    console.log(user);
    window.localStorage.setItem('user', JSON.stringify(user));
    this.userCollections.add(user);
    this.users$.subscribe(u => console.log(u));
  }

  public async host(): Promise<void> {
    const localStorage = window.localStorage.getItem('user');
    if (!localStorage) return;
    const user = JSON.parse(localStorage);

    this.userCollections.snapshotChanges().pipe(
      map(a => { 
        return a.map(b => { 
          const data = b.payload.doc.data();
          const id = b.payload.doc.id;
          return id;
        });
      }),
    ).subscribe(value => console.log('value', value));
    console.log(user);
    await this.afs.collection('users').doc(user.id.toString()).delete();
  }

  public imgClick(): void {
    this.router.navigateByUrl('/home');
  }
}
