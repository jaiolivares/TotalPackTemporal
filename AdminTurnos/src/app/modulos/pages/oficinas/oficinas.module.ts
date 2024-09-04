import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OficinasRoutingModule } from './oficinas-routing.module';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule} from '@angular/material/icon';
import { GeneralModule } from '../general/general.module';
import { PipesModule } from 'src/app/core/pipes/pipes.module';

import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs, 'es');

import { OficinasComponent } from './oficinas.component';
import { CrearSeleccionarComponent } from './components/crear-seleccionar/crear-seleccionar.component';
import { ServicioOficinaComponent } from './components/servicio-oficina/servicio-oficina.component';
import { PantallasComponent } from './components/pantallas/pantallas.component';
import { EscritoriosComponent } from './components/escritorios/escritorios.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OficinaEditComponent } from './components/crear-seleccionar/components/oficina-edit/oficina-edit.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { EscritoriosEditComponent } from './components/escritorios/components/escritorios-edit/escritorios-edit.component';
import { EscritoriosCreateComponent } from './components/escritorios/components/escritorios-create/escritorios-create.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PantallasEditComponent } from './components/pantallas/components/pantallas-edit/pantallas-edit.component';
import { BotonesComponent } from './components/botones/botones.component';
@NgModule({
  declarations: [
    OficinasComponent,
    CrearSeleccionarComponent,
    ServicioOficinaComponent,
    PantallasComponent,
    EscritoriosComponent,
    OficinaEditComponent,
    EscritoriosEditComponent,
    EscritoriosCreateComponent,
    PantallasEditComponent,
    BotonesComponent
  ],
  imports: [
    CommonModule,
    OficinasRoutingModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    GeneralModule,
    PipesModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    LeafletModule,
    DragDropModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ]
})
export class OficinasModule { }
