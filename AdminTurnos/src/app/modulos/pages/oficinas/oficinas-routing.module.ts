import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OficinasComponent } from './oficinas.component';

const routes: Routes = [
  { path: '', component: OficinasComponent, data:{breadcrumb:'Oficinas'} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OficinasRoutingModule { }
