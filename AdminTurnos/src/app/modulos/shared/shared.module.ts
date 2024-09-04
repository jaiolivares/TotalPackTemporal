import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentheaderComponent } from './contentheader/contentheader.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ContentheaderComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
  ],
  exports: [
    ContentheaderComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ]
})
export class SharedModule { }
