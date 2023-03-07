import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartComponent } from './chart/chart.component';
import { HomeComponent } from './home/home.component';
import { HostComponent } from './host/host.component';
import { RoomsComponent } from './rooms/rooms.component';
import { VoteComponent } from './vote/vote.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'host', component: HostComponent },
  { path: 'vote', component: VoteComponent },
  { path: 'chart', component: ChartComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
