import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule} from '@angular/material/icon';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgxPaginationModule} from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask'
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';
import { NgApexchartsModule } from "ng-apexcharts";
import { GeneralModule } from '../general/general.module';


import { InformesComponent } from './informes.component';
import { InformesRoutingModule } from './informes-routing.module';
import { AnalisisDemandaComponent} from './components/analisis-demanda/analisis-demanda.component';
import { PausasPorSucursalComponent } from './components/pausas-por-sucursal/pausas-por-sucursal.component';
import { NivelDeServicioComponent} from './components/nivel-de-servicio/nivel-de-servicio.component';
import { AgendaListadoComponent } from './components/agenda-listado/agenda-listado.component';
import { AtencionesPorCategoriaComponent} from './components/atenciones-por-categoria/atenciones-por-categoria.component';
import { OficinasZonasComponent} from './components/oficinas-zonas/oficinas-zonas.component';
import { NivelDeServicioPorRegionComponent } from './components/nivel-de-servicio-por-region/nivel-de-servicio-por-region.component';
import { AgendaListadoReporteComponent } from './components/agenda-listado-reporte/agenda-listado-reporte.component';
import { DwhPausaComponent } from './components/dwh-pausa/dwh-pausa.component';
import { DwhAtencionProveedorComponent } from './components/dwh-atencion-proveedor/dwh-atencion-proveedor.component';
import { DwhComponent } from './components/dwh/dwh.component';


defineLocale('es', esLocale);

@NgModule({
  declarations: [
    InformesComponent,
    AnalisisDemandaComponent,
    PausasPorSucursalComponent,
    NivelDeServicioComponent,
    AgendaListadoComponent,
    AgendaListadoReporteComponent,
    AtencionesPorCategoriaComponent,
    OficinasZonasComponent,
    NivelDeServicioPorRegionComponent,
    DwhPausaComponent,
    DwhAtencionProveedorComponent,
    DwhComponent
  ],

  imports: [
    CommonModule,
    InformesRoutingModule,
    MatTabsModule,
    FormsModule,
    MatIconModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    PipesModule,
    ReactiveFormsModule,
    DragDropModule,
    BsDatepickerModule.forRoot(),
    NgApexchartsModule,
    GeneralModule,
    NgxMaskModule.forRoot(),
    TimepickerModule
  ],
    exports: [
        AtencionesPorCategoriaComponent
    ],
})
export class InformesModule {
  constructor( private bsLocaleService: BsLocaleService){
    this.bsLocaleService.use('es');//fecha en español, datepicker
  }
 }
