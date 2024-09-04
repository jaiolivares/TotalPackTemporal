import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule} from '@angular/material/icon';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgxPaginationModule} from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask'
import { AgendaComponent } from './agenda.component';
import { AgendaRoutingModule } from './agenda-routing.module';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ServiciosAgendaComponent } from './components/servicios-agenda/servicios-agenda.component';
import { FeriadosComponent } from './components/feriados/feriados.component';
import { CreateEditAgendaComponent } from './components/servicios-agenda/components/create-edit-agenda/create-edit-agenda.component';
import { DayCardComponent } from '../general/components/servicios/components/day-card/day-card.component';
import { GeneralModule } from '../general/general.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DetalleAgendaComponent } from './components/servicios-agenda/components/detalle-agenda/detalle-agenda.component';

@NgModule({
  declarations: [
    AgendaComponent,
    ServiciosAgendaComponent,
    FeriadosComponent,
    CreateEditAgendaComponent,
    DetalleAgendaComponent
    
  ],
  imports: [
    CommonModule,
    AgendaRoutingModule,
    MatTabsModule,
    MatIconModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    PipesModule,
    ReactiveFormsModule,
    DragDropModule,
    GeneralModule,
    NgxMaskModule.forRoot(),
    TimepickerModule
  ],
  exports: [],
})
export class AgendaModule { }
