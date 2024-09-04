import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { DetalleOficinasService } from 'src/app/core/services/http/inicio/detalle-oficinas.service';
import { ResumenOficinasService } from 'src/app/core/services/http/inicio/resumen-oficinas.service';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { EstadoModalOficinaService } from 'src/app/core/services/pages/modal-oficina.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { InfoEscritoriosOficinaComponent } from './tabs/info-escritorios-oficina/info-escritorios-oficina.component';
import {InfoSeriesOficinaComponent} from './tabs/info-series-oficina/info-series-oficina.component'
import {InfoTurnosEsperaComponent} from './tabs/info-turnos-espera/info-turnos-espera.component'
import {InfoTurnosGeneralComponent} from './tabs/info-turnos-general/info-turnos-general.component'
import { EstadoOficinaComponent } from './tabs/estado-oficina/estado-oficina.component';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
@Component({
  selector: 'app-modal-oficina',
  templateUrl: './modal-oficina.component.html',
  styleUrls: ['./modal-oficina.component.css'],
  providers: [EstadoModalOficinaService]
})
export class ModalOficinaComponent implements OnInit,OnDestroy {
  customer: any;
  usuario: any;
  permisosAdministracion: any;
  estado:any;
  estadoSubscription:Subscription = new Subscription()
  timerSubscription: Subscription = new Subscription();
  refrescarActivado:boolean = true;
  @ViewChild(InfoSeriesOficinaComponent)
  infoSeriesOficina!: InfoSeriesOficinaComponent;
  @ViewChild(InfoEscritoriosOficinaComponent)
  infoEscritoriosOficina!: InfoEscritoriosOficinaComponent;
  @ViewChild(InfoTurnosEsperaComponent)
  infoTurnosEspera!: InfoTurnosEsperaComponent;
  @ViewChild(InfoTurnosGeneralComponent)
  infoTurnosGeneral!: InfoTurnosGeneralComponent;
  @ViewChild(EstadoOficinaComponent)
  estadoOficina!: EstadoOficinaComponent;

  public event: EventEmitter<any> = new EventEmitter();
  constructor(
    private modalService: ModalService,
    private router: Router,
    private localSecureService: LocalService,
    private detalleOficinaService: DetalleOficinasService,
    private spinner: NgxSpinnerService,
    private estadoService: EstadoModalOficinaService,
    private timerService: TimerService,
    private resumenOficinasService: ResumenOficinasService,
    private swaalService: SweetAlertService
  ) {}

  data: any;

  async ngOnInit() {
    this.customer = this.localSecureService.getValue('customer');
    this.usuario = this.localSecureService.getValue('usuario');
    this.permisosAdministracion = this.localSecureService.getValue('permisosAdministracion');
    this.estadoSubscription = this.estadoService.estado$.subscribe((estado:any)=>{
      this.estado = estado;
    })
    this.timerSubscription = this.timerService.refreshEmit.subscribe(async ()=>{
      await this.cargarDatos(true);

    });
    await this.cargarDatos();
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
    this.timerSubscription.unsubscribe();
    this.timerService.stopTimer();
  }
  async cargarDatos(cargarDatosResumen = false){
    this.spinner.show("servicio-loading");
    await this.obtenerDetalleOficina();
    await this.obtenerInfoTurnosGeneral();
    await this.obtenerInfoTurnosEspera();
    this.obtenerEjecutivos();
    if(cargarDatosResumen){
      await this.cargarDatosResumen()
    }
    this.spinner.hide("servicio-loading");
  }
  async cargarDatosResumen(){
    const oficina = await this.resumenOficinasService.obtenerDataByIdOficina(this.data.idOficina)
      this.data.personasEnFila = oficina.turnosEnEspera
      this.data.ticketsEmitidos =  oficina.emitidosNormal + oficina.emitidosUrgencia
      this.data.ticketsAtendidos =  oficina.finalizadosNormal + oficina.finalizadosUrgencia
      this.data.ticketsPerdidos =  oficina.anulados
      this.data.ticketsEnAtencion =  oficina.enAtencionNormal + oficina.enAtencionUrgencia
      this.data.tiempoMaximoEspera =  oficina.tiempoMaximoEspera
      this.data.tiempoMaximoAtencion =  oficina.tiempoMaximoAtencion
      this.data.tiempoPromedioEspera =  oficina.tiempoPromedioEspera
      this.data.tiempoPromedioAtencion =  oficina.tiempoPromedioAtencion
      this.data.ejecutivosActivos =  oficina.ejecutivosActivos
      this.data.ejecutivosEnPausa =  oficina.ejecutivosEnPausa
      this.data.sla =  oficina.sla
  }

  async refreshData(){
    if(this.refrescarActivado){
      this.timerService.stopTimer();
      await this.cargarDatos(true);
      this.timerService.initTimer();
      this.refrescarActivado = false;
      setTimeout(()=>{
        this.refrescarActivado = true;
      },60000)
    }
  }
  handleSelectedTabChange(event:any){
    switch (event.index) {
      case 0:
        this.infoSeriesOficina.orderBy = {};
      this.infoSeriesOficina.activeOrderBy='';
      this.infoSeriesOficina.nombreOrderBy = '-'
        break;
      case 1:
        this.infoTurnosGeneral.orderBy = {};
      this.infoTurnosGeneral.activeOrderBy='';
      this.infoTurnosGeneral.nombreOrderBy = '-'
      this.infoTurnosGeneral.groupBy = {};
      this.infoTurnosGeneral.activeGroupBy = '';
      this.infoTurnosGeneral.nombreGroupBy = 'Todos los turnos'
        break;
      case 2:
        this.infoTurnosEspera.orderBy = {};
      this.infoTurnosEspera.activeOrderBy='';
      this.infoTurnosEspera.nombreOrderBy = '-'
      this.infoTurnosEspera.groupBy = {};
      this.infoTurnosEspera.activeGroupBy = '';
        break;
      case 3:
        this.infoEscritoriosOficina.orderBy = {};
      this.infoEscritoriosOficina.activeOrderBy='';
      this.infoEscritoriosOficina.groupBy = {};
      this.infoEscritoriosOficina.activeGroupBy = '';
      this.infoEscritoriosOficina.nombreGroupBy = 'Todos los estados'
        break;
      default:
        break;
    }
  }

  async obtenerDetalleOficina(){
    const resp:any = await this.detalleOficinaService.getDetalleOficinas(
      this.customer.slug,
      this.usuario.idUsuario,
      this.data.idOficina
    );
    if (resp['status']) {
      if(resp['data'][0].jsonOfi == null || resp['data'][0].jsonEsc == null ){
        this.spinner.hide("servicio-loading");
        const alert = await this.swaalService.swalInfoConfirm('No tiene permisos para ver el detalle de esta');
        this.estadoService.setValor('series',[]);
        this.estadoService.setValor('escritorios',[]);
        this.modalService.closeModal('modal-info-oficinas');
        this.estadoService.setValor('oficina',[]);
      } else {
        const series = resp['data'][0].jsonOfi.map((item:any)=>{
          return {
            nombre: item['serie'],
            personasEnFila: item['qEmiN'] - (item['qAteN'] + item['qFinN'] + item['qPer']),
            ejecutivosActivos: item['qEjeA'],
            ticketsEmitidos: item['qEmiN'],
            ticketsEmitidosUrgente:item['qEmiU'],
            ticketsAtendidos: item['qFinN'] ,
            ticketsAtendidosUrgente: item['qFinU'],
            ticketsEnAtencion: item['qAteN'],
            ticketsEnAtencionUrgente: item['qAteU'],
            ticketsPerdidos: item['qPer'],
            tiempoPromedioEspera: item['pEsp'],
            tiempoPromedioAtencion: item['pAte'],
            ejecutivosEnPausa: item['qEjeP'],
            tiempoMaximoEsperaActual: item['mEsp'],
            tiempoMaximoAtencion: item['mAte'],

          };
        });;
        this.estadoService.setValor('series',series);
        this.estadoService.setValor('escritorios',resp['data'][0].jsonEsc);
        this.estadoService.setValor('oficina',series);
      }

    }
  }
   obtenerEjecutivos(){
   const  ejecutivos = this.estado.escritorios.filter(((ejecutivo:any)=>ejecutivo.ejecutivo != '' && ejecutivo.ejeEstado == "Activo"));
    this.estadoService.setValor('ejecutivos',ejecutivos);
  }
  async obtenerInfoTurnosGeneral(){
    const resp:any = await this.detalleOficinaService.getInfoTurnosGeneral(
      this.customer.slug,
      this.usuario.idUsuario,
      this.data.idOficina
    );
    if (resp['status']) {
      this.estadoService.setValor('turnosGeneral',resp['data']);
    }
  }
  async obtenerInfoTurnosEspera(showSpinner = false){
    if(showSpinner){
      this.spinner.show("servicio-loading");
    }
    const resp:any = await this.detalleOficinaService.getInfoTurnosEspera(
      this.customer.slug,
      this.usuario.idUsuario,
      this.data.idOficina
    );
    if (resp['status']) {
      this.estadoService.setValor('turnosEspera',resp['data']);
    }
    if(showSpinner){
      this.spinner.hide("servicio-loading");
    }
  }

  closeModal() {
    this.event.emit();
    this.modalService.closeModal('modal-info-oficinas');
  }

}
