import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ResumenOficinasService } from 'src/app/core/services/http/inicio/resumen-oficinas.service';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { groupByKey, secondsToString } from 'src/app/core/services/utils/utils';
import { Subscription } from 'rxjs';
import { OrderBy } from 'src/app/core/models/filtros.model';


@Component({
  selector: 'app-modal-ejecutivos',
  templateUrl: './modal-ejecutivos.component.html',
  styleUrls: ['./modal-ejecutivos.component.css']
})
export class ModalEjecutivosComponent implements OnInit, OnDestroy {
  resumenOfiGral: any;
  resumenOfiDet: any;
  totalActivos = 0;
  totalEnPausa = 0;
  totalConectadas = 0;
  masConectados: any;
  promedioConectados!: number;
  data: any;
  oficinas: any[] = [];
  series: any[] = [];
  refrescarActivado:boolean = true;
  searchText: string = '';
  ordenarPor: string = '';
  ordenadoPor: string = '-';
  timerSubscription: Subscription = new Subscription();
  orderBy: OrderBy = {};
  activeOrderBy: string = '';
  constructor(
    private modalService: ModalService,
    private spinner: NgxSpinnerService,
    private timerService: TimerService,
    private resumenOficinasService: ResumenOficinasService,
  ) { }

  ngOnInit(): void {
    /* console.log(this.resumenOfiGral);
    console.log(this.resumenOfiDet); */
    this.timerSubscription = this.timerService.refreshEmit.subscribe(async ()=>{
      await this.obtenerResumenOficinas();
    });
    this.obtenerEjecutivos();
    this.obtenerOficinas();
    this.obtenerSeries();
    this.orderBy.key = 'ejecutivosActivos';
    this.orderBy.type = 'D';
    this.activeOrderBy = `ejecutivosActivos-D`;
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
    this.obtenerEjecutivos();
    this.obtenerOficinas();
    this.obtenerSeries();
    this.spinner.hide("servicio-loading");
  }
  onSelectTab(e:any){
    this.searchText = '';
    this.ordenarPor = '';
    this.ordenadoPor = '-';
    switch (e.index) {
      case 0:
        this.orderBy.key = 'ejecutivosActivos';
        this.orderBy.type = 'D';
        this.activeOrderBy = `ejecutivosActivos-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 1:
        this.orderBy.key = 'ejecutivosEnPausa';
        this.orderBy.type = 'D';
        this.activeOrderBy = `ejecutivosEnPausa-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 2:
        this.orderBy.key = 'ejecutivosActivos';
        this.orderBy.type = 'D';
        this.activeOrderBy = `ejecutivosActivos-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 3:
        this.orderBy.key = 'ejecutivosEnPausa';
        this.orderBy.type = 'D';
        this.activeOrderBy = `ejecutivosEnPausa-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      default:
        break;
    }
  }
  obtenerEjecutivos() {
    this.totalActivos = 0;
    this.totalEnPausa = 0;
    this.totalConectadas = 0;
    this.resumenOfiGral.map((oficina: any) => {
      this.totalActivos += oficina.ejecutivosActivos;
      this.totalEnPausa += oficina.ejecutivosEnPausa;
      if ((oficina.ejecutivosActivos + oficina.ejecutivosEnPausa) > 0) {
        this.totalConectadas++;
      }
    });
    this.masConectados = this.resumenOfiGral.reduce((a: any, b: any) => ((a.ejecutivosActivos + a.ejecutivosEnPausa) > (b.ejecutivosActivos + b.ejecutivosEnPausa)) ? a : b);
    this.promedioConectados = (this.totalActivos + this.totalEnPausa) / this.totalConectadas;
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

    this.oficinas = oficinasAgrupadas.map((oficina: any) => {
      const conectados = oficina.reduce((acc: any, item: any) => {
        return acc + item['ejecutivosActivos'];
      }, 0);
      const series = oficina.map((serie: any) => {
        return {
          serie: serie.serie,
          ejecutivosActivos: serie.ejecutivosActivos,
          ejecutivosEnPausa: serie.ejecutivosEnPausa,
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
          d.ejecutivosActivos = s.ejecutivosActivos;
          d.ejecutivosEnPausa = s.ejecutivosEnPausa;
        }
      });
    });
    //console.log(this.oficinas);
  }

  ordenarOfi(order: string) {
    this.oficinas = this.oficinas.sort((a: any, b: any) => {
      switch (order) {
        case 'ejecutivosActivos-D':
          return a.ejecutivosActivos > b.ejecutivosActivos ? -1 : 1;
          break;
        case 'ejecutivosActivos-A':
          return a.ejecutivosActivos < b.ejecutivosActivos ? -1 : 1;
          break;
        case 'ejecutivosEnPausa-D':
          return a.ejecutivosEnPausa > b.ejecutivosEnPausa ? -1 : 1;
          break;
        case 'ejecutivosEnPausa-A':
          return a.ejecutivosEnPausa < b.ejecutivosEnPausa ? -1 : 1;
          break;
        default:
          return 0;
          break;
      }
    });
    const clave = order.split('-');
    this.valorOrden(clave[1]);
  }

  obtenerSeries() {
    this.series = [];
    this.resumenOfiDet.forEach((series: any) => {
      const { serie, ejecutivosActivos, ejecutivosEnPausa, idOficina, oficina } = series;
      const data = { idOficina, oficina, ejecutivosActivos, ejecutivosEnPausa };
      const existe = this.series.find(y => y.serie === series.serie);
      if (!existe) {
        this.series.push({ serie, ejecutivosActivos, ejecutivosEnPausa, data: [data] });
      } else {
        existe.data.push(data);
        existe.ejecutivosActivos += ejecutivosActivos;
        existe.ejecutivosEnPausa += ejecutivosEnPausa;
      }
    });
    //console.log(this.series);
  }

  tecleado(event: any) {
    this.searchText = event.value;
  }

  ordenarSeries(order: string) {
    this.series = this.series.sort((a: any, b: any) => {
      switch (order) {
        case 'ejecutivosActivos-D':
          return a.ejecutivosActivos > b.ejecutivosActivos ? -1 : 1;
          break;
        case 'ejecutivosActivos-A':
          return a.ejecutivosActivos < b.ejecutivosActivos ? -1 : 1;
          break;
        case 'ejecutivosEnPausa-D':
          return a.ejecutivosEnPausa > b.ejecutivosEnPausa ? -1 : 1;
          break;
        case 'ejecutivosEnPausa-A':
          return a.ejecutivosEnPausa < b.ejecutivosEnPausa ? -1 : 1;
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

  closeModal() {
    this.modalService.closeModal('modal-ejecutivos');
  }

}
