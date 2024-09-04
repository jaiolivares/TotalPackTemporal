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
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';
import { NgApexchartsModule } from "ng-apexcharts";
import { GeneralModule } from '../general/general.module';


import { ReportesComponent } from './reportes.component';
import { ReprotesRoutingModule } from './reportes-routing.module';
import { EstadoEjecutivosComponent } from './components/estado-ejecutivos/estado-ejecutivos.component';
import { ResumenEsperaAgrupadoComponent } from './components/resumen-espera-agrupado/resumen-espera-agrupado.component';
import { ResumenEsperaNoagrupadoComponent } from './components/resumen-espera-noagrupado/resumen-espera-noagrupado.component';
import { ResumenAtencionAgrupadoComponent } from './components/resumen-atencion-agrupado/resumen-atencion-agrupado.component';
import { ResumenAtencionesNoagrupadoComponent } from './components/resumen-atenciones-noagrupado/resumen-atenciones-noagrupado.component';
import { RankingEjecutivosComponent } from './components/ranking-ejecutivos/ranking-ejecutivos.component';

defineLocale('es', esLocale);

@NgModule({
  declarations: [
    ReportesComponent,
    EstadoEjecutivosComponent,
    ResumenEsperaAgrupadoComponent,
    ResumenEsperaNoagrupadoComponent,
    ResumenAtencionAgrupadoComponent,
    ResumenAtencionesNoagrupadoComponent,
    RankingEjecutivosComponent,
  ],

  imports: [
    CommonModule,
    ReprotesRoutingModule,
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
  exports: [],
})
export class ReportesModule { }
