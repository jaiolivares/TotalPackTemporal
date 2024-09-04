import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralRoutingModule } from './general-routing.module';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule} from '@angular/material/icon';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgxPaginationModule} from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask'
import { GeneralComponent } from './general.component';
import { EjecutivosComponent } from './components/ejecutivos/ejecutivos.component';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { SubServiciosComponent } from './components/sub-servicios/sub-servicios.component';
import { MotivosPausaComponent } from './components/motivos-pausa/motivos-pausa.component';
import { MotivosAtencionComponent } from './components/motivos-atencion/motivos-atencion.component';
import { ZonasComponent } from './components/zonas/zonas.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { PermisosAdministracionComponent } from './components/usuarios/components/permisos-administracion/permisos-administracion.component';
import { PermisosOficinasComponent } from './components/usuarios/components/permisos-oficinas/permisos-oficinas.component';
import { ServiciosCreateComponent } from './components/servicios/components/servicios-create/servicios-create.component';
import { ServiciosEditComponent } from './components/servicios/components/servicios-edit/servicios-edit.component';
import { ModalCodigosComponent } from './components/servicios/components/modals/modal-codigos/modal-codigos.component';
import { ModalVistaPreviaTicketComponent } from './components/servicios/components/modals/modal-vista-previa-ticket/modal-vista-previa-ticket.component';
import { DayCardComponent } from './components/servicios/components/day-card/day-card.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ServiciosDetalleComponent } from './components/servicios/components/servicios-detalle/servicios-detalle.component';
import { MotivoCardComponent } from './components/servicios/components/motivo-card/motivo-card.component';
import { SubServiciosCreateComponent } from './components/sub-servicios/components/sub-servicios-create/sub-servicios-create.component';
import { SubServiciosEditComponent } from './components/sub-servicios/components/sub-servicios-edit/sub-servicios-edit.component';
import { ServiciosAgruparComponent } from './components/servicios/components/servicios-agrupar/servicios-agrupar.component';

@NgModule({
  declarations: [
    GeneralComponent,
    EjecutivosComponent,
    ServiciosComponent,
    SubServiciosComponent,
    MotivosPausaComponent,
    MotivosAtencionComponent,
    ZonasComponent,
    UsuariosComponent,
    PermisosAdministracionComponent,
    PermisosOficinasComponent,
    ServiciosCreateComponent,
    ServiciosEditComponent,
    ModalCodigosComponent,
    ModalVistaPreviaTicketComponent,
    DayCardComponent,
    ServiciosDetalleComponent,
    MotivoCardComponent,
    SubServiciosCreateComponent,
    SubServiciosEditComponent,
    ServiciosAgruparComponent
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    MatTabsModule,
    MatIconModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    PipesModule,
    ReactiveFormsModule,
    DragDropModule,
    NgxMaskModule.forRoot(),
    TimepickerModule
  ],
  exports: [ServiciosComponent,ServiciosEditComponent,DayCardComponent],
})
export class GeneralModule { }
