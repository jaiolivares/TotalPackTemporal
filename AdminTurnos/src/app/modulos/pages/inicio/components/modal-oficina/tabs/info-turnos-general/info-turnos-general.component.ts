import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { EstadoModalOficinaService } from 'src/app/core/services/pages/modal-oficina.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';

@Component({
  selector: 'app-info-turnos-general',
  templateUrl: './info-turnos-general.component.html',
})
export class InfoTurnosGeneralComponent implements OnInit, OnDestroy {
  constructor(
    private estadoService: EstadoModalOficinaService
  ) { }
  turnos:any[] = [];
  turnosAtendiendo:any[] = [];
  turnosLlamando:any[] = [];
  turnosFinalizados:any[] = [];
  turnosAnulados:any[] = [];
  searchText:string = '';
  orderBy: OrderBy = {};
  groupBy: GroupBy = {};
  oficinas: any[] = [];
  ordenarPor: string = '';
  activeOrderBy: string = '';
  activeGroupBy: string = '';
  nombreOrderBy: string = '-';
  nombreGroupBy: string = 'Todos los turnos';
  estado:any;
  estadoSubscription:Subscription = new Subscription()
  tecleado(event:any){
    this.searchText = event.value;
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
  agrupar(key: string, value: any,nombre:string) {
    if (key === '' || value === '') {
      this.groupBy = {};
      this.activeGroupBy = '';
      this.nombreGroupBy = 'Todos los turnos'
    } else {
      this.groupBy.key = key;
      this.groupBy.value = value;
      this.activeGroupBy = `${key}-${value}`;
      this.nombreGroupBy = nombre
    }
  }
  ngOnInit(): void {
    
    this.estadoSubscription = this.estadoService.estado$.subscribe((estado:any)=>{
      this.estado = estado;
      this.turnos = this.estado.turnosGeneral;
    })
  }
  // filtrarTurnos(){
  //   this.turnos = this.estado.turnosGeneral;
  //   this.turnosAtendiendo = this.estado.turnosGeneral.filter((turno:any)=>turno.estado == 'ATENDIENDO');
  //   this.turnosLlamando = this.estado.turnosGeneral.filter((turno:any)=>turno.estado == 'LLAMANDO');
  //   this.turnosFinalizados = this.estado.turnosGeneral.filter((turno:any)=>turno.estado == 'FINALIZADO');
  //   this.turnosAnulados = this.estado.turnosGeneral.filter((turno:any)=>turno.estado == 'ANULADO');
  // } 
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
}
