import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PacientesComponent } from './pacientes.component';
import { MedicosComponent } from './components/medicos/medicos.component';
import { PantallasComponent } from './components/pantallas/pantallas.component';

const routes: Routes = [
  { path: '', component: PacientesComponent, data:{breadcrumb:'Llamado Pacientes'} },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacientesRoutingModule { }
