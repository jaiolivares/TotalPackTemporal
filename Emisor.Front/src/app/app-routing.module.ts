import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//guard que valida que existe un rut en el flujo para continuar
import { flujoGuard } from 'src/app/core/guards/flujo.guard';

//components
import { DniComponent } from './modules/dni/dni.component';
import { SeriesComponent } from './modules/series/series.component';
import { EmitterComponent } from './modules/emitter/emitter.component';
import { TicketComponent } from './modules/ticket/ticket.component';
import { InformativeTicketComponent } from './modules/informative-ticket/informative-ticket.component';

const routes: Routes = [
  { path: 'dni', component: DniComponent },
  { path: 'series', component: SeriesComponent, canActivate: [flujoGuard] },
  { path: 'ticket', component: TicketComponent, canActivate: [flujoGuard] },
  { path: 'informative-ticket', component: InformativeTicketComponent, canActivate: [flujoGuard] },
  { path: ':id', component: EmitterComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
