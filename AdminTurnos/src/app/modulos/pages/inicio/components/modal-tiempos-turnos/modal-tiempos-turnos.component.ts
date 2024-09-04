import { map } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ResumenOficinasService } from 'src/app/core/services/http/inicio/resumen-oficinas.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { groupByKey, stringToSeconds, secondsToString } from 'src/app/core/services/utils/utils';
import { Subscription } from 'rxjs';
import { OrderBy } from 'src/app/core/models/filtros.model';





@Component({
  selector: 'app-modal-tiempos-turnos',
  templateUrl: './modal-tiempos-turnos.component.html',
  styleUrls: ['./modal-tiempos-turnos.component.css']
})
export class ModalTiemposTurnosComponent implements OnInit, OnDestroy {
  resumenOfiGral: any;
  resumenOfiDet: any;
  data: any;
  oficinas: any[] = [];
  series: any[] = [];
  maxTpoAte: any;
  minPromEsp: any;
  promEsp!: string;
  promAte!: string;
  refrescarActivado:boolean = true;
  searchText: string = '';
  ordenarPor: string = '';
  ordenadoPor: string = '-'
  orderBy: OrderBy = {};
  activeOrderBy: string = '';
  timerSubscription: Subscription = new Subscription();
  constructor(
    private modalService: ModalService,
    private spinner: NgxSpinnerService,
    private timerService: TimerService,
    private resumenOficinasService: ResumenOficinasService,
  ) { }

  ngOnInit(): void {
    /* console.log(this.resumenOfiGral);
    //console.log(this.resumenOfiDet); */
    this.timerSubscription = this.timerService.refreshEmit.subscribe(async ()=>{
      await this.obtenerResumenOficinas();
    });

    this.obtenerTiempos();
    this.obtenerOficinas();
    this.orderBy.key = 'tiempoMaximoAtencion';
    this.orderBy.type = 'D';
    this.activeOrderBy = `tiempoMaximoAtencion-D`;
    this.ordenadoPor  = 'Descendente'
  }
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }

  async obtenerResumenOficinas(){
    this.spinner.show("servicio-loading");
    const {resumenOfiGral,resumenOfiDet} =  await this.resumenOficinasService.obtenerDataSeparada();
    this.resumenOfiGral = resumenOfiGral;
    this.resumenOfiDet = resumenOfiDet;
    this.obtenerTiempos();
    this.obtenerOficinas();
    this.spinner.hide("servicio-loading");
  }
  onSelectTab(e:any){
    this.searchText = '';
    this.ordenarPor = '';
    this.ordenadoPor = '';
    this.orderBy = {key:'',type:''};
    this.activeOrderBy = '';
    switch (e.index) {
      case 0:
        this.orderBy.key = 'tiempoMaximoAtencion';
        this.orderBy.type = 'D';
        this.activeOrderBy = `tiempoMaximoAtencion-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 1:
        this.orderBy.key = 'tiempoMaximoEspera';
        this.orderBy.type = 'D';
        this.activeOrderBy = `tiempoMaximoEspera-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 2:
        this.orderBy.key = 'tiempoPromedioAtencion';
        this.orderBy.type = 'D';
        this.activeOrderBy = `tiempoPromedioAtencion-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 3:
        this.orderBy.key = 'tiempoPromedioEspera';
        this.orderBy.type = 'D';
        this.activeOrderBy = `tiempoPromedioEspera-D`;
        this.ordenadoPor  = 'Descendente'
        break;
    
      default:
        break;
    }
  }
  obtenerTiempos() {
    this.maxTpoAte = this.resumenOfiGral.reduce((a: any, b: any) => (stringToSeconds(a.tiempoMaximoAtencion) > stringToSeconds(b.tiempoMaximoAtencion) ? a : b));
    const act: any = this.resumenOfiGral.filter((of: any) => {
      return of.tiempoPromedioEspera != "00:00:00"
    });
    //console.log(act);
    if (act.length > 0) {
      this.minPromEsp = act.reduce((a: any, b: any) => (a.tiempoPromedioEspera < b.tiempoPromedioEspera ? a : b));
      let sumaPromESp = 0;
      let sumaPromAt = 0;
      act.map((oficina: any) => {
        sumaPromESp += stringToSeconds(oficina.tiempoPromedioEspera);
        sumaPromAt += stringToSeconds(oficina.tiempoPromedioAtencion);
      });
      this.promEsp = secondsToString(sumaPromESp / act.length);
      this.promAte = secondsToString(sumaPromAt / act.length);
    }
  }


  async refreshData(){
    if(this.refrescarActivado){
      this.timerService.stopTimer();
      await this.obtenerResumenOficinas();
      this.timerService.initTimer();
      this.refrescarActivado = false;
      setTimeout(()=>{
        this.refrescarActivado = true;
      },60000)
    }
  }

  ordenar(key: string, type: string) {
    if (key === '' || type === '') {
      this.orderBy = {};
      this.activeOrderBy='';
      this.ordenadoPor = '';
    } else {
      this.orderBy.key = key;
      this.orderBy.type = type;
      this.activeOrderBy = `${key}-${type}`;
      if (type == 'A') {
        this.ordenadoPor = 'Ascendente';
      } else {
        this.ordenadoPor = 'Descendente';
      }
    }
  }

  obtenerOficinas() {
    const oficinasAgrupadas = groupByKey(this.resumenOfiDet, 'idOficina');
    //console.log(oficinasAgrupadas);

    this.oficinas = oficinasAgrupadas.map((oficina: any) => {
      const conectados = oficina.reduce((acc: any, item: any) => {
        return acc + item['ejecutivosActivos'];
      }, 0);
      const series = oficina.map((serie: any) => {
        return {
          serie: serie.serie,
          tiempoMaximoAtencion: serie.tiempoMaximoAtencion,
          tiempoMaximoEspera: serie.tiempoMaximoEspera,
          tiempoPromedioAtencion: serie.tiempoPromedioAtencion,
          tiempoPromedioEspera: serie.tiempoPromedioEspera,
          ejecutivosActivos: serie.ejecutivosActivos
        }
      });
      return {
        idOficina: oficina[0].idOficina,
        nombre: oficina[0].oficina,
        activa: conectados == 0 ? 0 : 1,
        series
      };
    });
    this.oficinas.filter((d) => {
      this.resumenOfiGral.filter((s: any) => {
        if (d.idOficina == s.idOficina) {
          d.tiempoMaximoAtencion = s.tiempoMaximoAtencion;
          d.tiempoMaximoEspera = s.tiempoMaximoEspera;
          d.tiempoPromedioAtencion = s.tiempoPromedioAtencion;
          d.tiempoPromedioEspera = s.tiempoPromedioEspera;
        }
      });
    });
    //console.log(this.oficinas);
  }

  ordenarOfi(order: string) {
    this.oficinas = this.oficinas.sort((a: any, b: any) => {
      switch (order) {
        case 'tiempoMaximoAtencion-D':
          return a.tiempoMaximoAtencion > b.tiempoMaximoAtencion ? -1 : 1;
          break;
        case 'tiempoMaximoAtencion-A':
          return a.tiempoMaximoAtencion < b.tiempoMaximoAtencion ? -1 : 1;
          break;
        case 'tiempoMaximoEspera-D':
          return a.tiempoMaximoEspera > b.tiempoMaximoEspera ? -1 : 1;
          break;
        case 'tiempoMaximoEspera-A':
          return a.tiempoMaximoEspera < b.tiempoMaximoEspera ? -1 : 1;
          break;
        case 'tiempoPromedioAtencion-D':
          return a.tiempoPromedioAtencion > b.tiempoPromedioAtencion ? -1 : 1;
          break;
        case 'tiempoPromedioAtencion-A':
          return a.tiempoPromedioAtencion < b.tiempoPromedioAtencion ? -1 : 1;
          break;
        case 'tiempoPromedioEspera-D':
          return a.tiempoPromedioEspera > b.tiempoPromedioEspera ? -1 : 1;
          break;
        case 'tiempoPromedioEspera-A':
          return a.tiempoPromedioEspera < b.tiempoPromedioEspera ? -1 : 1;
          break;
        default:
          return 0;
          break;
      }
    });
    const clave = order.split('-');
    this.valorOrden(clave[1]);
  }

  valorOrden(clave:string){
    if (clave=='D') {
      this.ordenadoPor = 'Descendente'
    } else {
      this.ordenadoPor = 'Ascendente'
    }
  }


  tecleado(event: any) {
    this.searchText = event.value;
  }

  ordenarSeries(order: string) {
    this.series = this.series.sort((a: any, b: any) => {
      if (order == 'promedio') {
        return a.promedio > b.promedio ? -1 : 1;
      }
      return 0
    });
    const clave = order.split('-');
    this.valorOrden(clave[1]);
  }

  closeModal() {
    this.modalService.closeModal('modal-tiempos-turnos');
  }


}
