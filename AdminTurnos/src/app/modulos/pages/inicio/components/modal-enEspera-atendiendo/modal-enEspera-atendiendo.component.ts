import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { OrderBy } from 'src/app/core/models/filtros.model';
import { ResumenOficinasService } from 'src/app/core/services/http/inicio/resumen-oficinas.service';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { groupByKey } from 'src/app/core/services/utils/utils';

@Component({
  selector: 'app-modal-enEspera-atendiendo',
  templateUrl: './modal-enEspera-atendiendo.component.html',
  styleUrls: ['./modal-enEspera-atendiendo.component.css']
})
export class ModalEnEsperaAtendiendoComponent implements OnInit, OnDestroy {
  resumenOfiGral: any;
  resumenOfiDet: any;
  oficinas: any[] = [];
  series: any[] = [];
  masEnFila: any;
  promedioEsp!: number;
  promedioAt!: number;
  masAtendiendo: any;
  totalEsp = 0;
  totalAtNorm = 0;
  totalAtUrg = 0;
  refrescarActivado: boolean = true;
  searchText: string = '';
  ordenarPor: string = '';
  timerSubscription: Subscription = new Subscription();
  orderBy: OrderBy = {};
  activeOrderBy: string = '';
  ordenadoPor = '-';

  constructor(
    private modalService: ModalService,
    private timerService: TimerService,
    private resumenOficinasService: ResumenOficinasService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.timerSubscription = this.timerService.refreshEmit.subscribe(async () => {
      await this.obtenerResumenOficinas();
    });
    this.obtenerOficinas();
    //this.listarPersonas();
    this.obtenerSeries();
    //Ordenar por defecto de forma descendente, personas en fila
    this.orderBy.key = 'turnosEnEspera';
    this.orderBy.type = 'D';
    this.activeOrderBy = `turnosEnEspera-D`;
    this.ordenadoPor = 'Descendente'
  }
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }
  onSelectTab(e: any) {
    this.searchText = '';
    this.ordenarPor = '';
    this.orderBy = { key: '', type: '' };
    this.activeOrderBy = '';
    this.ordenadoPor = '';
    switch (e.index) {
      case 0:
        this.orderBy.key = 'turnosEnEspera';
        this.orderBy.type = 'D';
        this.activeOrderBy = `turnosEnEspera-D`;
        this.ordenadoPor = 'Descendente'
        break;
      case 1:
        this.orderBy.key = 'enAtencionNormal';
        this.orderBy.type = 'D';
        this.activeOrderBy = `enAtencionNormal-D`;
        this.ordenadoPor = 'Descendente'
        break;
      case 2:
        this.orderBy.key = 'enAtencionUrgencia';
        this.orderBy.type = 'D';
        this.activeOrderBy = `enAtencionUrgencia-D`;
        this.ordenadoPor = 'Descendente'
        break;
      case 3:
        this.orderBy.key = 'turnosEnEspera';
        this.orderBy.type = 'D';
        this.activeOrderBy = `turnosEnEspera-D`;
        this.ordenadoPor = 'Descendente'
        break;
      case 4:
        this.orderBy.key = 'enAtencionNormal';
        this.orderBy.type = 'D';
        this.activeOrderBy = `enAtencionNormal-D`;
        this.ordenadoPor = 'Descendente'
        break;
      case 5:
        this.orderBy.key = 'enAtencionUrgencia';
        this.orderBy.type = 'D';
        this.activeOrderBy = `enAtencionUrgencia-D`;
        this.ordenadoPor = 'Descendente'
        break;

      default:
        break;
    }
  }
  async obtenerResumenOficinas() {
    this.spinner.show("servicio-loading");
    const { resumenOfiGral, resumenOfiDet } = await this.resumenOficinasService.obtenerDataSeparada();
    this.resumenOfiGral = resumenOfiGral;
    this.resumenOfiDet = resumenOfiDet;
    this.obtenerOficinas();
    this.obtenerSeries();
    this.spinner.hide("servicio-loading");
  }
  async refreshData() {
    if (this.refrescarActivado) {
      this.timerService.stopTimer();
      await this.obtenerResumenOficinas();
      this.timerService.initTimer();
      this.refrescarActivado = false;
      setTimeout(() => {
        this.refrescarActivado = true;
      }, 60000)
    }
  }


  obtenerOficinas() {
    const oficinasAgrupadas = groupByKey(this.resumenOfiDet, 'idOficina');

    this.oficinas = oficinasAgrupadas.map((oficina: any) => {
      const turnosEnEspera = oficina.reduce((acc: any, item: any) => {
        return acc + item['turnosEnEspera'];
      }, 0);
      const enAtencionNormal = oficina.reduce((acc: any, item: any) => {
        return acc + item['enAtencionNormal'];
      }, 0);
      const enAtencionUrgencia = oficina.reduce((acc: any, item: any) => {
        return acc + item['enAtencionUrgencia'];
      }, 0);
      const conectados = oficina.reduce((acc: any, item: any) => {
        return acc + item['ejecutivosActivos'];
      }, 0);
      const series = oficina.map((serie: any) => {
        return {
          serie: serie.serie,
          turnosEnEspera: serie.turnosEnEspera,
          enAtencionNormal: serie.enAtencionNormal,
          enAtencionUrgencia: serie.enAtencionUrgencia,
          ejecutivosActivos: serie.ejecutivosActivos
        }
      });
      const atendiendo = enAtencionNormal + enAtencionUrgencia;
      return {
        idOficina: oficina[0].idOficina,
        nombre: oficina[0].oficina,
        turnosEnEspera,
        enAtencionNormal,
        enAtencionUrgencia,
        atendiendo,
        activa: conectados == 0 ? 0 : 1,
        series
      };

    });
    this.masEnFila = this.oficinas.reduce((a: any, b: any) => (a.turnosEnEspera > b.turnosEnEspera) ? a : b);
    //Se inicia totalEsp en el nuevo ciclo
    this.totalEsp = 0;
    //Se inicia totalAtNorm en el nuevo ciclo
    this.totalAtNorm = 0;
    //Se inicia totalAtUrg en el nuevo ciclo
    this.totalAtUrg = 0;
    this.oficinas.map((ofi) => {
      this.totalEsp += ofi.turnosEnEspera;
      this.totalAtNorm += ofi.enAtencionNormal;
      this.totalAtUrg += ofi.enAtencionUrgencia;
    });
    const totalActivas = this.oficinas.reduce((acc: any, item: any) => {
      return acc + item['activa'];
    }, 0);
    const totalEmitieron = this.oficinas.reduce((acc: any, item: any) => {
      if (item['turnosEnEspera'] > 0 && item['activa'] == 0) {
        return acc + 1;
      } else {
        return acc + 0;
      }
    }, 0);
    //console.log(totalEmitieron);

    if (this.totalEsp === 0 || (totalActivas + totalEmitieron) === 0)
      this.promedioEsp = 0
    else
      this.promedioEsp = Math.trunc(this.totalEsp / (totalActivas + totalEmitieron));

    this.masAtendiendo = this.oficinas.reduce((a: any, b: any) => (a.atendiendo > b.atendiendo) ? a : b);
    const tot = this.totalAtNorm + this.totalAtUrg;

    if (tot === 0 || totalActivas === 0)
      this.promedioAt = 0;
    else
      this.promedioAt = Math.trunc(tot / totalActivas);
  }

  ordenar(key: string, type: string) {
    if (key === '' || type === '') {
      this.orderBy = {};
      this.activeOrderBy = '';
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


  ordenarOfi(order: string) {
    this.oficinas = this.oficinas.sort((a: any, b: any) => {
      switch (order) {
        case 'personas-D':
          return a.turnosEnEspera > b.turnosEnEspera ? -1 : 1;
          break;
        case 'personas-A':
          return a.turnosEnEspera < b.turnosEnEspera ? -1 : 1;
          break;
        case 'AtNormal-D':
          return a.enAtencionNormal > b.enAtencionNormal ? -1 : 1;
          break;
        case 'AtNormal-A':
          return a.enAtencionNormal < b.enAtencionNormal ? -1 : 1;
          break;
        case 'AtUrgencia-D':
          return a.enAtencionUrgencia > b.enAtencionUrgencia ? -1 : 1;
          break;
        case 'AtUrgencia-A':
          return a.enAtencionUrgencia < b.enAtencionUrgencia ? -1 : 1;
          break;
        default:
          return 0;
          break;
      }
    });
  }

  obtenerSeries() {
    //Se inicia nuevamente series en el nuevo ciclo
    this.series = []
    this.resumenOfiDet.forEach((series: any) => {
      const { serie, turnosEnEspera, enAtencionNormal, enAtencionUrgencia, idOficina, oficina, ejecutivosActivos } = series;
      const data = { idOficina, oficina, turnosEnEspera, enAtencionNormal, enAtencionUrgencia, ejecutivosActivos };
      const existe = this.series.find(y => y.serie === series.serie);
      if (!existe) {
        this.series.push({ serie, turnosEnEspera, enAtencionNormal, enAtencionUrgencia, data: [data] });
      } else {
        existe.data.push(data);
        existe.turnosEnEspera += turnosEnEspera;
        existe.enAtencionNormal += enAtencionNormal;
        existe.enAtencionUrgencia += enAtencionUrgencia;
      }
    });
    //console.log(this.series);
  }

  closeModal() {
    this.modalService.closeModal('modal-enEspera-atendiendo');
  }

  tecleado(event: any) {
    this.searchText = event.value;
  }

  ordenarSeries(order: string) {
    this.series = this.series.sort((a: any, b: any) => {
      switch (order) {
        case 'personas-D':
          return a.turnosEnEspera > b.turnosEnEspera ? -1 : 1;
          break;
        case 'personas-A':
          return a.turnosEnEspera < b.turnosEnEspera ? -1 : 1;
          break;
        case 'AtNormal-D':
          return a.enAtencionNormal > b.enAtencionNormal ? -1 : 1;
          break;
        case 'AtNormal-A':
          return a.enAtencionNormal < b.enAtencionNormal ? -1 : 1;
          break;
        case 'AtUrgencia-D':
          return a.enAtencionUrgencia > b.enAtencionUrgencia ? -1 : 1;
          break;
        case 'AtUrgencia-A':
          return a.enAtencionUrgencia < b.enAtencionUrgencia ? -1 : 1;
          break;
        default:
          return 0;
          break;
      }
    });
  }

}
