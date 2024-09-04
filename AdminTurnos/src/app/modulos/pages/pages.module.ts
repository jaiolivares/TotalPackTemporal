import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';

import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule} from '@angular/material/icon';

import { PagesComponent } from './pages.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    PagesComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    MatTabsModule,
    MatIconModule,
  ]
})
export class PagesModule { }
