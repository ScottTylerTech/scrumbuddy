import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RoomsComponent } from './rooms/rooms.component';
import { HostComponent } from './host/host.component';
import { VoteComponent } from './vote/vote.component';
import { ChartComponent } from './chart/chart.component';
import { NgChartsModule } from 'ng2-charts';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomsComponent,
    HostComponent,
    VoteComponent,
    ChartComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    FormsModule,
    NgChartsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  exports: [
    FormsModule,
    AppComponent,
    HomeComponent,
    RoomsComponent,
    HostComponent,
    VoteComponent,
    ChartComponent,
  ],
  providers: [AngularFireDatabase],
  bootstrap: [AppComponent],
})
export class AppModule {}
