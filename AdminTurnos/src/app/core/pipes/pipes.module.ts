import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuscadorPipe } from './buscador.pipe';
import { FiltroPipe } from './filtro.pipe';

@NgModule({
  declarations: [
    BuscadorPipe,
    FiltroPipe
  ],
  imports: [
    CommonModule
  ],
  exports:[
    BuscadorPipe,
    FiltroPipe
  ],
  providers: [BuscadorPipe, FiltroPipe]
})
export class PipesModule { }
