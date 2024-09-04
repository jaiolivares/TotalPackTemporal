import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermisosGuard } from 'src/app/core/guards/permisos.guard';

const routes: Routes = [
    { path: 'inicio', loadChildren: () => import('./inicio/inicio.module').then((m) => m.InicioModule), canActivate:[PermisosGuard]},
    { path: 'general', loadChildren: () => import('./general/general.module').then((m) => m.GeneralModule),canActivate:[PermisosGuard]},
    { path: 'oficinas', loadChildren: () => import('./oficinas/oficinas.module').then((m) => m.OficinasModule),canActivate:[PermisosGuard]},
    { path: 'pacientes', loadChildren: () => import('./pacientes/pacientes.module').then((m) => m.PacientesModule),canActivate:[PermisosGuard]},
    { path: 'agenda', loadChildren: () => import('./agenda/agenda.module').then((m) => m.AgendaModule)},
    { path: 'reportes', loadChildren: () => import('./reportes/reportes.module').then((m) => m.ReportesModule)},
    { path: 'informes', loadChildren: () => import('./informes/informes.module').then((m) => m.InformesModule) },
    { path: 'alarmas', loadChildren: () => import('./alarmas/alarmas.module').then((m) => m.AlarmasModule) },
    { path: '', pathMatch: 'full', redirectTo: 'inicio' }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
