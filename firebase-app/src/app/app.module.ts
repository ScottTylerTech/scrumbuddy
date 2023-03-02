import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AngularFireDatabase } from '@angular/fire/compat/database';
// import { FireserviceService } from './fireservice.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RoomsComponent } from './rooms/rooms.component';
import { HostComponent } from './host/host.component';
import { VoteComponent } from './vote/vote.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomsComponent,
    HostComponent,
    VoteComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    FormsModule
  ],
  exports: [
    FormsModule
  ],
  providers: [
    AngularFireDatabase,
    // FireserviceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
