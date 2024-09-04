import { HomeComponent } from './home/home.component';
import { IndexComponent } from './modulos/index/index.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { ValidateGuard } from './core/guards/validate.guard';

import { PagesComponent } from './modulos/pages/pages.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'index' },
  { path: 'index', component: IndexComponent },
  {
    path: 'login',
    canActivate: [ValidateGuard],
    loadChildren: () => import('./modulos/login/login.module').then((m) => m.LoginModule)
  },
  {
    path: 'admin',
    component: PagesComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./modulos/pages/pages.module').then((m) => m.PagesModule)
  },
  { path: ':id', component: HomeComponent },
  {
    path: '**',
    redirectTo: 'index',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
