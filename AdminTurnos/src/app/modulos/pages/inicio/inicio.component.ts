import { SweetAlertService } from './../../../core/services/utils/sweet-alert.service';
import { ResumenOficinasService } from './../../../core/services/http/inicio/resumen-oficinas.service';
import { LocalService } from './../../../core/services/storage/local.service';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ModalEnEsperaAtendiendoComponent } from './components/modal-enEspera-atendiendo/modal-enEspera-atendiendo.component';
import { ModalFinalizadosEmitidosComponent } from './components/modal-finalizados-emitidos/modal-finalizados-emitidos.component';
import { ModalEjecutivosComponent } from './components/modal-ejecutivos/modal-ejecutivos.component';
import { ModalTiemposTurnosComponent } from './components/modal-tiempos-turnos/modal-tiempos-turnos.component';
import { stringToSeconds, secondsToString } from 'src/app/core/services/utils/utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class InicioComponent implements OnInit, OnDestroy {
  customer: any;
  usuario: any;
  resumenOfi: any;
  resumenOfiGral:any[] = [];
  resumenOfiDet:any[] = [];
  personasEnFila = 0;
  atendiendo = 0;
  emitidos = 0;
  finalizados = 0;
  anulados = 0;
  escritorios = 0;
  maxTpo = '00:00:00';
  ofiMaxTpo = '';
  timerSubscription: Subscription = new Subscription();
  modalEventSubscription: Subscription = new Subscription();
  refrescarActivado:boolean = true;
  permisosAdministracion:any;
  errorAlTraerResumen:boolean = false;
  constructor(
    private modalService: ModalService,
    private localSecureService: LocalService,
    private resumenOficinas: ResumenOficinasService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private timerService: TimerService
  ) { }

  tarjetas:any[] = [];

  async ngOnInit():Promise<void>  {
    this.timerService.initTimer();
    this.customer = this.localSecureService.getValue('customer');
    this.permisosAdministracion = this.localSecureService.getValue('permisosAdministracion');
    this.usuario = this.localSecureService.getValue('usuario');
    await this.obtenerData();
    this.timerSubscription= this.timerService.refreshEmit.subscribe(async (event:any)=>{
      const isOpenAnyModal = this.modalService.modalRefs.length > 0
      if(!isOpenAnyModal){
        await this.obtenerData();
      }
    })


  }

  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
    this.modalEventSubscription.unsubscribe();
    this.timerService.stopTimer();
  }

  async obtenerData(){
    this.spinner.show("servicio-loading");
    const {resumenOfi,resumenOfiGral,resumenOfiDet,personasEnFila,finalizados,emitidos,anulados,atendiendo,escritorios,maxTpo,ofiMaxTpo,error} = await this.resumenOficinas.obtenerData();
    if(!error){
      this.resumenOfi = resumenOfi;
      this.resumenOfiGral = resumenOfiGral;
      this.resumenOfiDet = resumenOfiDet;
      this.personasEnFila = personasEnFila;
      this.finalizados = finalizados;
      this.emitidos = emitidos;
      this.anulados = anulados;
      this.atendiendo = atendiendo;
      this.escritorios = escritorios;
      this.maxTpo = maxTpo;
      this.ofiMaxTpo = ofiMaxTpo;
    } else {
      this.errorAlTraerResumen = true;
    }
    this.spinner.hide("servicio-loading");
  }
  async refreshData(){
    if(this.refrescarActivado){
      this.timerService.stopTimer();
      await this.obtenerData();
      this.timerService.initTimer();
      this.refrescarActivado = false;
      setTimeout(()=>{
        this.refrescarActivado = true;
      },60000)
    }
  }

  modalEnEsperaAtendiendo(){
    const options = {
      class: 'modal-lg modal-dialog-centered modal-info-oficinas',
      centered: true,
      ignoreBackdropClick: true,
      initialState: {resumenOfiGral:this.resumenOfiGral, resumenOfiDet: this.resumenOfiDet},
    };
    this.modalService.openModal(ModalEnEsperaAtendiendoComponent, options,'modal-enEspera-atendiendo');
    this.modalEventSubscription = this.modalService.getModalRef('modal-enEspera-atendiendo')?.onHidden?.subscribe(()=>{
      //Este timeout permite realizar el emit de refrescar aún si el modal de modal-personas esta cerrado, ya que en el inicio está para que no
      // Actulice cuando exista un modal abierto. con este tipo da para que el modal se cierre y se ejecute el emite para que se actualice el inicio.
        setTimeout(()=>{
          this.timerService.emitRefresh();
        },100)
      }) || new Subscription();
  }

  modalFinalizadosEmitidos(){
    const options = {
      class: 'modal-lg modal-dialog-centered modal-info-oficinas',
      centered: true,
      ignoreBackdropClick: true,
      initialState: {resumenOfiGral:this.resumenOfiGral, resumenOfiDet: this.resumenOfiDet},
    };
    this.modalService.openModal(ModalFinalizadosEmitidosComponent, options,'modal-finalizados-emitidos');
    this.modalEventSubscription = this.modalService.getModalRef('modal-finalizados-emitidos')?.onHidden?.subscribe(()=>{
        setTimeout(()=>{
          this.timerService.emitRefresh();
        },100)
      }) || new Subscription();
  }

  modalEjecutivos(){
    const options = {
      class: 'modal-lg modal-dialog-centered modal-info-oficinas',
      centered: true,
      ignoreBackdropClick: true,
      initialState: {resumenOfiGral:this.resumenOfiGral, resumenOfiDet: this.resumenOfiDet},
    };
    this.modalService.openModal(ModalEjecutivosComponent, options,'modal-ejecutivos');
    this.modalEventSubscription = this.modalService.getModalRef('modal-ejecutivos')?.onHidden?.subscribe(()=>{
      setTimeout(()=>{
        this.timerService.emitRefresh();
      },100)
    }) || new Subscription();
  }

  modalTiemposTurnos(){
    const options = {
      class: 'modal-lg modal-dialog-centered modal-info-oficinas',
      centered: true,
      ignoreBackdropClick: true,
      initialState: {resumenOfiGral:this.resumenOfiGral, resumenOfiDet: this.resumenOfiDet},
    };
    if (this.maxTpo != '00:00:00') {
      this.modalService.openModal(ModalTiemposTurnosComponent, options,'modal-tiempos-turnos');
    this.modalEventSubscription = this.modalService.getModalRef('modal-tiempos-turnos')?.onHidden?.subscribe(()=>{
      setTimeout(()=>{
        this.timerService.emitRefresh();
      },100)
    }) || new Subscription();
    }
  }

  proximamente(){
    this.sweetAlertService.swalInfo('En construcción','Proximamente...');
  }

}
