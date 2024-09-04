import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioRoutingModule } from './inicio-routing.module';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule} from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { InicioComponent } from './inicio.component';
import { InfoFilasComponent } from './components/info-filas/info-filas.component';
import { ModalOficinaComponent } from './components/modal-oficina/modal-oficina.component';

import { InfoSeriesOficinaComponent } from './components/modal-oficina/tabs/info-series-oficina/info-series-oficina.component';
import { InfoTurnosEsperaComponent } from './components/modal-oficina/tabs/info-turnos-espera/info-turnos-espera.component';
import { ModalEnEsperaAtendiendoComponent } from './components/modal-enEspera-atendiendo/modal-enEspera-atendiendo.component';
import { ModalFinalizadosEmitidosComponent } from './components/modal-finalizados-emitidos/modal-finalizados-emitidos.component';
import { ModalEjecutivosComponent } from './components/modal-ejecutivos/modal-ejecutivos.component';
import { ModalTiemposTurnosComponent } from './components/modal-tiempos-turnos/modal-tiempos-turnos.component';

import {NgxPaginationModule} from 'ngx-pagination';
import { InfoEscritoriosOficinaComponent } from './components/modal-oficina/tabs/info-escritorios-oficina/info-escritorios-oficina.component';
import { ModalEscritoriosSeriesComponent } from './components/modal-oficina/tabs/info-escritorios-oficina/modal-escritorios-series/modal-escritorios-series.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { InfoTurnosGeneralComponent } from './components/modal-oficina/tabs/info-turnos-general/info-turnos-general.component';
import { TurnoCardComponent } from './components/modal-oficina/tabs/info-turnos-general/components/turno-card.component';
import { DerivarModalComponent } from './components/modal-oficina/tabs/info-turnos-espera/components/derivar-modal/derivar-modal.component';
import { InfoHistorioAtencionComponent } from './components/info-historico-atencion/info-historico-atencion.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale} from 'ngx-bootstrap/locale';
import { HistoricoCardComponent } from './components/info-historico-atencion/historico-card/historico-card.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalHistoricoAtencionComponent } from './components/info-historico-atencion/modal-historico-atencion/modal-historico-atencion.component';
import { ModalHistoricoMotivosAtencionComponent } from './components/info-historico-motivos-atencion/modal-historico-motivos-atencion/modal-historico-motivos-atencion.component';
import { InfoHistorioMotivosAtencionComponent } from './components/info-historico-motivos-atencion/info-historico-motivos-atencion.component';
import { HistoricoMotivosCardComponent } from './components/info-historico-motivos-atencion/historico-motivos-card/historico-motivos-card.component';
import { InfoHistorioEstadosEjecutivosComponent } from './components/info-historico-estados-ejecutivos/info-historico-estados-ejecutivos.component';
import { ModalHistoricoEstadosEjecutivosComponent } from './components/info-historico-estados-ejecutivos/modal-historico-estados-ejecutivos/modal-historico-estados-ejecutivos.component';
import { HistoricoEstadosEjecutivosCardComponent } from './components/info-historico-estados-ejecutivos/historico-estados-ejecutivos-card/historico-estados-ejecutivos-card.component';
import { EstadoOficinaComponent } from './components/modal-oficina/tabs/estado-oficina/estado-oficina.component';

defineLocale('es', esLocale);

@NgModule({
  declarations: [
    InicioComponent,
    InfoFilasComponent,
    ModalOficinaComponent,
    InfoSeriesOficinaComponent,
    InfoTurnosEsperaComponent,
    InfoEscritoriosOficinaComponent,
    ModalEnEsperaAtendiendoComponent,
    ModalFinalizadosEmitidosComponent,
    ModalEjecutivosComponent,
    ModalTiemposTurnosComponent,
    ModalEscritoriosSeriesComponent,
    InfoTurnosGeneralComponent,
    TurnoCardComponent,
    DerivarModalComponent,
    InfoHistorioAtencionComponent,
    HistoricoCardComponent,
    ModalHistoricoAtencionComponent,
    ModalHistoricoMotivosAtencionComponent,
    InfoHistorioMotivosAtencionComponent,
    HistoricoMotivosCardComponent,
    InfoHistorioEstadosEjecutivosComponent,
    ModalHistoricoEstadosEjecutivosComponent,
    HistoricoEstadosEjecutivosCardComponent,
    EstadoOficinaComponent
  ],
  imports: [
    CommonModule,
    InicioRoutingModule,
    MatTabsModule,
    MatIconModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    PipesModule,
    CollapseModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
  ],
})
export class InicioModule { }
