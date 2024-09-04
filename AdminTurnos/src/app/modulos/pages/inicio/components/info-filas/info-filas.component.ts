import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ModalOficinaComponent } from '../modal-oficina/modal-oficina.component';
import { groupByFirstIndex, groupByKey } from 'src/app/core/services/utils/utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { Subscription } from 'rxjs';
import { LocalService } from 'src/app/core/services/storage/local.service';
@Component({
  selector: 'app-info-filas',
  templateUrl: './info-filas.component.html',
  styleUrls: ['./info-filas.component.css'],
})
export class InfoFilasComponent implements OnInit, OnDestroy, OnChanges {
  @Input() resumenOfi: any;

  constructor(
    private modalService: ModalService,
    private swaalService: SweetAlertService,
    private timerService: TimerService,
    private localService:LocalService) {}

  inputSearh = new FormControl('');
  searchText: string = '';
  orderBy: OrderBy = {};
  groupBy: GroupBy = {};
  oficinas: any[] = [];
  ordenarPor: string = '';
  activeOrderBy: string = '';
  activeGroupBy: string = '';
  modalEventSubscription: Subscription = new Subscription();
  mostrar = 'Todas las Oficinas';
  ordenadoPor = '-';
  customer: any;

  async ngOnInit(): Promise<void> {
    this.customer = this.localService.getValue('customer');
    //console.log(this.customer)
    this.obtenerOficinas();
    //Agrupar al inicio por las oficinas activas.
    this.groupBy.key = 'estado';
    this.groupBy.value = 1;
    this.activeGroupBy = `estado-1`;
    this.mostrar = 'Oficinas Activas'
  }
  ngOnDestroy(): void {
    this.modalEventSubscription.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['resumenOfi'].currentValue != changes['resumenOfi'].previousValue){
      this.obtenerOficinas();
    }
  }

  obtenerOficinas() {
    const oficinasAgrupadas = groupByKey(this.resumenOfi, 'idOficina');
    const oficinasResumidas = groupByFirstIndex(oficinasAgrupadas);
    this.oficinas = oficinasResumidas.map((item:any)=>{
      const oficina = item[0]
      return {
        idOficina: oficina.idOficina,
        nombre: oficina.oficina,
        personasEnFila:oficina.turnosEnEspera,
        ticketsEmitidos: oficina.emitidosNormal + oficina.emitidosUrgencia,
        ticketsAtendidos: oficina.finalizadosNormal + oficina.finalizadosUrgencia,
        ticketsPerdidos: oficina.anulados,
        ticketsEnAtencion: oficina.enAtencionNormal + oficina.enAtencionUrgencia,
        tiempoMaximoEspera: oficina.tiempoMaximoEspera,
        tiempoMaximoAtencion: oficina.tiempoMaximoAtencion,
        tiempoPromedioEspera: oficina.tiempoPromedioEspera,
        tiempoPromedioAtencion: oficina.tiempoPromedioAtencion,
        ejecutivosActivos: oficina.ejecutivosActivos,
        ejecutivosEnPausa: oficina.ejecutivosEnPausa,
        sla: oficina.sla,
        estado: oficina['ejecutivosActivos'] == 0 ? 0 : 1,}
    });
    //console.log(this.oficinas);
  }

  ordenar(key: string, type: string, nombre: string) {
    if (key === '' || type === '') {
      this.orderBy = {};
      this.activeOrderBy='';
    } else {
      this.orderBy.key = key;
      this.orderBy.type = type;
      this.activeOrderBy = `${key}-${type}`;
      const tipo = type == 'A' ? 'Ascendente' : 'Descendente';
      /* const clave = key.match(/([A-Z]?[^A-Z]*)/g)!.slice(0,-1);
      //console.log(clave);
      this.ordenadoPor = clave[0].charAt(0).toUpperCase()+clave[0].slice(1)+' '
                        +clave[1].charAt(0).toLowerCase()+clave[1].slice(1)+' '
                        +clave[2].charAt(0).toLowerCase()+clave[2].slice(1)+' '
                        +'-'+' '+tipo; */
      this.ordenadoPor = nombre;
    }
  }
  agrupar(key: string, value: any) {
    if (key === '' || value === '') {
      this.groupBy = {};
      this.activeGroupBy = '';
      this.mostrar = 'Todas las Oficinas';
    } else {
      this.groupBy.key = key;
      this.groupBy.value = value;
      this.activeGroupBy = `${key}-${value}`;
      this.mostrar = value == 1? 'Oficinas Activas' : 'Oficinas Inactivas'
    }
  }

  tecleado(event: any) {
    this.searchText = event.value;
  }

  limpiar() {
    this.searchText = '';
    this.inputSearh.setValue('');
  }

  modalOficina(data: any) {
    const permisosOficinas = this.localService.getValue('permisosOficinas')
    if(data.estado === 0){
      this.swaalService.swalInfo('Detalle oficina','Esta oficina se encuentra inactiva');
      return;
    }
    if(!permisosOficinas.includes(data.idOficina)){
      this.swaalService.swalInfo('Detalle oficina','No tienes el permiso para ver el detalle de esta oficina');
      return;
    }

    const options = {
      id: 1,
      class: 'modal-lg modal-dialog-centered modal-info-oficinas',
      centered: true,
      ignoreBackdropClick: true,
      initialState: { data: data },
      animated: true,
    };
    this.modalService.openModal(
      ModalOficinaComponent,
      options,
      'modal-info-oficinas'
    );

   this.modalEventSubscription = this.modalService.getModalRef('modal-info-oficinas')?.content.event.subscribe(()=>{
    //Este timeout permite realizar el emit de refrescar aún si el modal de modal-info-oficinas esta cerrado, ya que en el inicio está para que no
    // Actulice cuando exista un modal abierto. con este tipo da para que el modal se cierre y se ejecute el emite para que se actualice el inicio.
      setTimeout(()=>{
        this.timerService.emitRefresh();
      },100)
    })

  }
}
