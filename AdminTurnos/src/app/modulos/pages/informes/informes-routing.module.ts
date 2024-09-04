import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformesComponent } from './informes.component';

const routes: Routes = [
  { path: '', component: InformesComponent, data:{breadcrumb:'Informes'} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class InformesRoutingModule { }
