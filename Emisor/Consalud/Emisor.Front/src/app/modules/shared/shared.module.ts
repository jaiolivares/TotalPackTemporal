import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//components
import { FooterComponent } from './footer/footer.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    FooterComponent,
    KeyboardComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    KeyboardComponent,
    FooterComponent,
    HeaderComponent
  ]
})
export class SharedModule { }
