import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { secondsToString } from 'src/app/core/services/utils/utils';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { DerivarModalComponent } from './components/derivar-modal/derivar-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { EstadoModalOficinaService } from 'src/app/core/services/pages/modal-oficina.service';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
@Component({
  selector: 'app-info-turnos-espera',
  templateUrl: './info-turnos-espera.component.html',
})
export class InfoTurnosEsperaComponent implements OnInit, OnDestroy {
  @Output() refrescarTurnos = new EventEmitter();
  constructor(
    private modalService: BsModalService,
    private estadoService: EstadoModalOficinaService,
    private validaRutService: ValidaRutService
  ) { }

  searchText:string = '';
  secondsToString = secondsToString;
  orderBy: OrderBy = {};
  groupBy: GroupBy   = {};
  ordenarPor: string = '';
  activeOrderBy: string = '';
  nombreOrderBy: string = '-';
  activeGroupBy: string = '';
  bsModalRef:any;
  estado:any;
  turnosEspera:any;
  estadoSubscription: Subscription = new Subscription();
  cerrarModalEmitterSubscription: Subscription = new Subscription();
  refrescarModalEmitterSubscription: Subscription = new Subscription();
  ngOnInit(): void {
    this.estadoSubscription = this.estadoService.estado$.subscribe((estado:any)=>{
      this.estado = estado;
      this.mappearEjecutivos();
    })
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
    this.refrescarModalEmitterSubscription.unsubscribe();
    this.cerrarModalEmitterSubscription.unsubscribe();
  }
  tecleado(event:any){
    this.searchText = event.value;
  }
  mappearEjecutivos(){
     this.turnosEspera = this.estado.turnosEspera.map((turno:any)=>{
      let ejecutivo = this.estado.ejecutivos.find((ejecutivo:any)=>ejecutivo.idEsc == turno.idEsc);
      if(ejecutivo){
        return {
          ...turno,
          ejecutivo:ejecutivo.ejecutivo,
        }
      } else {
        return {
          ...turno,
          ejecutivo:"Sin ejecutivo / Sin nombre ejecutivo",
        }
      }
    });
  }
  formatRut(rut:any){
    return this.validaRutService.formatearRut(rut);
  }
  ordenar(key: string, type: string,nombre:string) {
    if (key === '' || type === '') {
      this.orderBy = {};
      this.activeOrderBy='';
      this.nombreOrderBy = "-";
    } else {
      this.orderBy.key = key;
      this.orderBy.type = type;
      this.activeOrderBy = `${key}-${type}`;
      this.nombreOrderBy = nombre;
    }
  }
  agrupar(key: string, value: any) {
    if (key === '' || value === '') {
      this.groupBy = {};
      this.activeGroupBy = '';
    } else {
      this.groupBy.key = key;
      this.groupBy.value = value;
      this.activeGroupBy = `${key}-${value}`;
    }
  }

  



  derivarTurno(item:any){
    const ejecutivosConDetalle = this.estado.ejecutivos.map((ejecutivo:any)=>{
       const detalleSeries = ejecutivo.series.map((serie:any)=> serie.estado);
      return {
        ...ejecutivo,
        detalleSerie: detalleSeries.includes('Atendiendo') ? 'Atendiendo' : detalleSeries.includes('Llamando') ? 'Llamando' : 'En espera'
      }
    }).filter((ejecutivo:any)=>ejecutivo.idEsc != item.idEsc)
    const ejecutivosFiltradosPorSerie = ejecutivosConDetalle.filter((ejecutivo:any)=>{
      let contieneSerie = ejecutivo.series.find((serie:any)=>serie.serie == item.serie);
      if(contieneSerie){
        return true
      } else {
        return false
      }
    })
    this.bsModalRef = this.modalService.show(DerivarModalComponent, {
      id: 2,
      class: 'modal-lg modal-dialog-centered modal-info-oficinas modal-info-turnos-espera ',
      backdrop: true,
      ignoreBackdropClick:true,
      initialState: {item:item,ejecutivos:ejecutivosFiltradosPorSerie},
    });
  this.bsModalRef.content.closeBtnName = 'Close';

  this.refrescarModalEmitterSubscription = this.bsModalRef.content.event.subscribe((res:any) => {
      this.bsModalRef.hide();
      this.refrescarTurnos.emit();
  });
  this.cerrarModalEmitterSubscription = this.bsModalRef.content.ocultarModal.subscribe((res:any) => {
      this.bsModalRef.hide();
  });


    }
}
