import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//components
import { DniComponent } from './modules/dni/dni.component';
import { SeriesComponent } from './modules/series/series.component';
import { EmitterComponent } from './modules/emitter/emitter.component';
import { TicketComponent } from './modules/ticket/ticket.component';
import { InformativeTicketComponent } from './modules/informative-ticket/informative-ticket.component';

const routes: Routes = [
  { path: 'dni', component: DniComponent },
  { path: 'series', component: SeriesComponent },
  { path: 'ticket', component: TicketComponent },
  { path: 'informative-ticket', component: InformativeTicketComponent },
  { path: ':id', component: EmitterComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
