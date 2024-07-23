import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//components
import { FooterComponent } from './footer/footer.component';
import { KeyboardComponent } from './keyboard/keyboard.component';

@NgModule({
  declarations: [
    FooterComponent,
    KeyboardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    KeyboardComponent,
    FooterComponent
  ]
})
export class SharedModule { }
