import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { OrderBy } from 'src/app/core/models/filtros.model';
import { ResumenOficinasService } from 'src/app/core/services/http/inicio/resumen-oficinas.service';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { groupByKey, secondsToString } from 'src/app/core/services/utils/utils';

@Component({
  selector: 'app-modal-finalizados-emitidos',
  templateUrl: './modal-finalizados-emitidos.component.html',
  styleUrls: ['./modal-finalizados-emitidos.component.css']
})
export class ModalFinalizadosEmitidosComponent implements OnInit, OnDestroy {
  resumenOfiGral: any;
  resumenOfiDet: any;
  oficinas: any[] = [];
  series: any[] = [];
  masEmitidos: any;
  totalEmiNormal = 0;
  totalEmiUrg = 0;
  totalAtNormal = 0;
  totalAtUrg = 0;
  totalAnulados = 0;
  promedioEmitidos!: number;
  promedioAtendidos!: number;
  porcentajeAt!: number;
  masAtendidos: any;
  mayorPorcentaje: any;
  refrescarActivado:boolean = true;
  searchText: string = '';
  ordenarPor: string = '';
  timerSubscription: Subscription = new Subscription();
  ordenadoPor = '-';
  orderBy: OrderBy = {};
  activeOrderBy: string = '';
  constructor(
    private modalService: ModalService,
    private timerService: TimerService,
    private spinner: NgxSpinnerService,
    private resumenOficinasService: ResumenOficinasService,
  ) { }



  ngOnInit(): void {
    this.timerSubscription = this.timerService.refreshEmit.subscribe(async ()=>{
      await this.obtenerResumenOficinas();
    });
    this.obtenerOficinas();
    this.obtenerSeries();
    this.orderBy.key = 'emitidosNormal';
    this.orderBy.type = 'D';
    this.activeOrderBy = `emitidosNormal-D`;
    this.ordenadoPor  = 'Descendente'
  }
  async obtenerResumenOficinas(){
    this.spinner.show("servicio-loading");
    const {resumenOfiGral,resumenOfiDet} =  await this.resumenOficinasService.obtenerDataSeparada();
    this.resumenOfiGral = resumenOfiGral;
    this.resumenOfiDet = resumenOfiDet;
    this.obtenerOficinas();
    this.obtenerSeries();
    this.spinner.hide("servicio-loading");

  }
  onSelectTab(e:any){
    this.searchText = '';
    this.ordenarPor = '';
    this.ordenadoPor = '-';
    this.orderBy = {key:'',type:''};
    this.activeOrderBy = '';
    switch (e.index) {
      case 0:
        this.orderBy.key = 'emitidosNormal';
        this.orderBy.type = 'D';
        this.activeOrderBy = `emitidosNormal-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 1:
        this.orderBy.key = 'finalizadosNormal';
        this.orderBy.type = 'D';
        this.activeOrderBy = `finalizadosNormal-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 2:
        this.orderBy.key = 'emitidosUrgencia';
        this.orderBy.type = 'D';
        this.activeOrderBy = `emitidosUrgencia-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 3:
        this.orderBy.key = 'anulados';
        this.orderBy.type = 'D';
        this.activeOrderBy = `anulados-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 4:
        this.orderBy.key = 'emitidosNormal';
        this.orderBy.type = 'D';
        this.activeOrderBy = `emitidosNormal-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 5:
        this.orderBy.key = 'finalizadosNormal';
        this.orderBy.type = 'D';
        this.activeOrderBy = `finalizadosNormal-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 6:
        this.orderBy.key = 'emitidosUrgencia';
        this.orderBy.type = 'D';
        this.activeOrderBy = `emitidosUrgencia-D`;
        this.ordenadoPor  = 'Descendente'
        break;
      case 7:
        this.orderBy.key = 'anulados';
        this.orderBy.type = 'D';
        this.activeOrderBy = `anulados-D`;
        this.ordenadoPor  = 'Descendente'
        break;

      default:
        break;
    }
  }
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
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

  obtenerOficinas() {
    const oficinasAgrupadas = groupByKey(this.resumenOfiDet, 'idOficina');

    this.oficinas = oficinasAgrupadas.map((oficina: any) => {
      const emitidosNormal = oficina.reduce((acc: any, item: any) => {
        return acc + item['emitidosNormal'];
      }, 0);
      const emitidosUrgencia = oficina.reduce((acc: any, item: any) => {
        return acc + item['emitidosUrgencia'];
      }, 0);
      const finalizadosNormal = oficina.reduce((acc: any, item: any) => {
        return acc + item['finalizadosNormal'];
      }, 0);
      const finalizadosUrgencia = oficina.reduce((acc: any, item: any) => {
        return acc + item['finalizadosUrgencia'];
      }, 0);
      const conectados = oficina.reduce((acc: any, item: any) => {
        return acc + item['ejecutivosActivos'];
      }, 0);
      const anulados = oficina.reduce((acc: any, item: any) => {
        return acc + item['anulados'];
      }, 0);
      const series = oficina.map((serie: any) => {
        return {
          serie: serie.serie,
          emitidosNormal: serie.emitidosNormal,
          emitidosUrgencia: serie.emitidosUrgencia,
          finalizadosNormal: serie.finalizadosNormal,
          finalizadosUrgencia: serie.finalizadosUrgencia,
          ejecutivosActivos: serie.ejecutivosActivos,
          anulados: serie.anulados
        }
      });
      //const emitidos = enAtencionNormal + enAtencionUrgencia;
      return {
        idOficina: oficina[0].idOficina,
        nombre: oficina[0].oficina,
        emitidosNormal,
        emitidosUrgencia,
        finalizadosNormal,
        finalizadosUrgencia,
        anulados,
        activa: conectados == 0 ? 0 : 1,
        series
      };
    });
    this.masEmitidos = this.oficinas.reduce((a: any, b: any) => ((a.emitidosNormal + a.emitidosUrgencia) > (b.emitidosNormal + b.emitidosUrgencia)) ? a : b);
    //Se inicia totalEmiNormal en el nuevo ciclo
    this.totalEmiNormal = 0;
     //Se inicia totalEmiUrg en el nuevo ciclo
    this.totalEmiUrg=0;
     //Se inicia totalAtNormal en el nuevo ciclo
    this.totalAtNormal=0;
     //Se inicia totalAtUrg en el nuevo ciclo
    this.totalAtUrg=0;
     //Se inicia totalAnulados en el nuevo ciclo
    this.totalAnulados=0;

    this.oficinas.map((ofi) => {
      const promedio =
      this.totalEmiNormal += ofi.emitidosNormal;
      this.totalEmiUrg += ofi.emitidosUrgencia;
      this.totalAtNormal += ofi.finalizadosNormal;
      this.totalAtUrg += ofi.finalizadosUrgencia;
      this.totalAnulados += ofi.anulados;
    });
    const totalActivas = this.oficinas.reduce((acc: any, item: any) => {
      return acc + item['activa'];
    }, 0);
    this.promedioEmitidos = (this.totalEmiNormal + this.totalEmiUrg) / totalActivas;
    this.masAtendidos = this.oficinas.reduce((a: any, b: any) => ((a.finalizadosNormal + a.finalizadosUrgencia) > (b.finalizadosNormal + b.finalizadosUrgencia)) ? a : b);
    this.promedioAtendidos = (this.totalAtNormal + this.totalAtUrg) / totalActivas;
    console.log(this.oficinas);
    const atencion = this.oficinas.map((ofi) => {
      const promedio = (ofi.emitidosNormal+ofi.emitidosUrgencia)>0 ? (ofi.finalizadosNormal + ofi.finalizadosUrgencia) / (ofi.emitidosNormal + ofi.emitidosUrgencia) : 0;
      return {
        idOficina: ofi.idOficina,
        nombre: ofi.nombre,
        promedio
      };
    });
    console.log(atencion);
    this.mayorPorcentaje = atencion.reduce((a: any, b: any) => a.promedio > b.promedio ? a : b);
    //this.mayorPorcentaje = this.oficinas.reduce((a: any, b: any) => (((a.finalizadosNormal + a.finalizadosUrgencia) / (a.emitidosNormal + a.emitidosUrgencia)) > ((b.finalizadosNormal + b.finalizadosUrgencia) / (b.emitidosNormal + b.emitidosUrgencia))) ? a : b);
    console.log(this.mayorPorcentaje);
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


  obtenerSeries() {
    //Se inicia nuevamente series en el nuevo ciclo
    this.series = []
    this.resumenOfiDet.forEach((series: any) => {
      const { serie, emitidosNormal, emitidosUrgencia, finalizadosNormal, finalizadosUrgencia, anulados, idOficina, oficina, ejecutivosActivos } = series;
      const data = { idOficina, oficina, emitidosNormal, emitidosUrgencia, finalizadosNormal, finalizadosUrgencia, anulados, ejecutivosActivos };
      const existe = this.series.find(y => y.serie === series.serie);
      if (!existe) {
        this.series.push({ serie, emitidosNormal, emitidosUrgencia, finalizadosNormal, finalizadosUrgencia, anulados, data: [data] });
      } else {
        existe.data.push(data);
        existe.emitidosNormal += emitidosNormal;
        existe.emitidosUrgencia += emitidosUrgencia;
        existe.finalizadosNormal += finalizadosNormal;
        existe.finalizadosUrgencia += finalizadosUrgencia;
        existe.anulados += anulados;
      }
    });
  }





  closeModal() {
    this.modalService.closeModal('modal-finalizados-emitidos');
  }

  tecleado(event: any) {
    this.searchText = event.value;
  }

}
