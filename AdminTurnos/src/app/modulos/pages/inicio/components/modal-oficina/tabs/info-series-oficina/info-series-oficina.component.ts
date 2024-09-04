import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderBy } from 'src/app/core/models/filtros.model';
import { EstadoModalOficinaService } from 'src/app/core/services/pages/modal-oficina.service';

@Component({
  selector: 'app-info-series-oficina',
  templateUrl: './info-series-oficina.component.html',
})
export class InfoSeriesOficinaComponent implements OnInit, OnDestroy {
  estado:any;
  estadoSubscription:Subscription = new Subscription()
  orderBy: OrderBy = {};
  activeOrderBy:any;
  nombreOrderBy:any = "-";
  constructor(
    private estadoService:EstadoModalOficinaService
  ) { }
  searchText:string = '';
  ngOnInit(): void {
    this.estadoSubscription = this.estadoService.estado$.subscribe((estado:any)=>{
      this.estado = estado;
    })
  }
  tecleado(event:any){
    this.searchText = event.value;
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
  ordenar(key: string, type: string,nombre:string) {
    if (key === '' || type === '') {
      this.orderBy = {};
      this.activeOrderBy='';
      this.nombreOrderBy = '-'
    } else {
      this.orderBy.key = key;
      this.orderBy.type = type;
      this.activeOrderBy = `${key}-${type}`;
      this.nombreOrderBy = nombre
    }
  }
  // this.series = this.series.sort((a:any,b:any) => {
    //   switch (order) {
    //     case 'personas-D':
    //       return a.personas > b.personas ? -1 : 1 ;
    //     case 'personas-A':
    //       return a.personas < b.personas ? -1 : 1 ;
    //     case 'promedio-D':
    //       return a.tiempoPromedioEspera > b.tiempoPromedioEspera ? -1 : 1 ;
    //     case 'promedio-A':
    //       return a.tiempoPromedioEspera < b.tiempoPromedioEspera ? -1 : 1 ;
    //     case 'tickets-D':
    //       return a.ticketsEmitidos > b.ticketsEmitidos ? -1 : 1 ;
    //     case 'tickets-A':
    //       return a.ticketsEmitidos < b.ticketsEmitidos ? -1 : 1 ;
    //     default:
    //       return 0;
    //   }
    // });


  


}
