import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';

const routes: Routes = [
  { path: '', component: ReportesComponent, data:{breadcrumb:'Reportes'} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ReprotesRoutingModule { }
