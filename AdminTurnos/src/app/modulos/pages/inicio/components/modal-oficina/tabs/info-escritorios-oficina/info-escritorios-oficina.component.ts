import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { EstadoModalOficinaService } from 'src/app/core/services/pages/modal-oficina.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ModalEscritoriosSeriesComponent } from './modal-escritorios-series/modal-escritorios-series.component';
import { LocalService } from 'src/app/core/services/storage/local.service';

@Component({
  selector: 'app-info-escritorios-oficina',
  templateUrl: './info-escritorios-oficina.component.html',
  styleUrls: ['./info-escritorios-oficina.component.css']
})
export class InfoEscritoriosOficinaComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    private estadoService: EstadoModalOficinaService,
    private localSecureService: LocalService
    ) { }

  customer: any;
  searchText: string = '';
  activeSeriesCollapse: any[] = [];
  orderBy: OrderBy = {};
  groupBy: GroupBy = {};
  activeOrderBy: string = '';
  activeGroupBy: string = '';
  nombreGroupBy: string = 'Todos los estados';
  estado:any;
  escritorios:any;
  estadoSubscription:Subscription = new Subscription()
  tecleado(event: any) {
    this.searchText = event.value;
  }
  modalEscritorios(data: any) {
    const options = {
      id: 1,
      class: 'modal-lg modal-dialog-centered modal-info-oficinas modal-escritorios-series ',
      centered: true,
      ignoreBackdropClick: false,
      initialState: { data: data },
      animated: true,
    };
    this.modalService.openModal(
      ModalEscritoriosSeriesComponent,
      options,
      'modal-escritorios-series'
    );
  }

  ngOnInit(): void {
    this.estadoSubscription = this.estadoService.estado$.subscribe((estado: any) => {
      this.estado = estado;
      this.escritorios  = estado.escritorio
      this.ordernarEscritorios();
      this.mostrarSeriesActivas();
    })
    this.customer = this.localSecureService.getValue('customer');
  }
  handleCollapse(e: any, nombre: any): void {
    e.stopPropagation();
    if (this.activeSeriesCollapse.includes(nombre)) {
      const arrayIndex = this.activeSeriesCollapse.indexOf(nombre);
      if (arrayIndex > -1) {
        this.activeSeriesCollapse.splice(arrayIndex, 1);
      }
    } else {
      this.activeSeriesCollapse.push(nombre);
    }
  }
  mostrarSeriesActivas(): void {
    this.estado.escritorios.forEach((escritorio: any) => {
      escritorio.series.forEach((serie: any) => {
        if (serie.estado === 'Atendiendo' || serie.estado === 'Llamando') {
          this.activeSeriesCollapse.push(serie.serie + escritorio.idEsc)
        }
      })
    });
  }
  ordernarEscritorios(): void {
   this.escritorios = this.estado.escritorios.map((escritorio:any) => {
     return {...escritorio,orden:escritorio.ejeEstado == 'Activo' ? 1 : escritorio.ejeEstado == 'Desconectado' ? 99 : 2}
    });
  }

  ordenar(key: string, type: string) {
    if (key === '' || type === '') {
      this.orderBy = {};
      this.activeOrderBy = '';
    } else {
      this.orderBy.key = key;
      this.orderBy.type = type;
      this.activeOrderBy = `${key}-${type}`;
    }
  }
 agrupar(key: string, value: any,nombre:string) {
    if (key === '' || value === '') {
      this.groupBy = {};
      this.activeGroupBy = '';
      this.nombreGroupBy = 'Todos los estados'
    } else {
      this.groupBy.key = key;
      this.groupBy.value = value;
      this.activeGroupBy = `${key}-${value}`;
      this.nombreGroupBy = nombre
    }
  }

  getClassOfCard(val: any) {
    switch (val) {
      case 'Activo':
        return 'bg-green';
        break;
      case 'Desconectado':
        return 'bg-orange';
        break;
      default:
        return 'grey-disabled';
        break;
    }
  }

  getClassOf(val: any, series: any) {
    switch (val) {
      case 'Activo':
        const existe = series.find((y: any) => y.estado != 'En Espera');
        if (existe) {
          switch (existe.estado) {
            case "Atendiendo":
              if (existe.tpoAteA == 0) {
                return 'text-success';
              } else {
                return 'text-maroon';
              }
              break;
            case "Llamando":
              return 'text-cyan'
              break;
          }
        } else {
          return 'text-blue'
        }
        return 'text-success'
        break;
      case 'Desconectado':
        return 'text-orange';
        break;
      default:
        return 'text-gray';
        break;
    }
  }

  estadoSerie(series: any) {
    return series.reduce((acc: any, item: any) => {
      return acc + item['qAte'];
    }, 0);
  }

  motivoPausa(estado:any){
    if (estado == 'Pausa') {
      return "Inicio de Atención"
    } else {
      const motivo = estado.split(' ');
      let motivoHora = '';
      for (let i = 1; i < motivo.length; i++) {
        motivoHora+= motivo[i]+' ';
      }
      return motivoHora;
    }

  }

  tpoprom(tiempo:any){
    if (tiempo) {
      return tiempo
    } else {
      return "S/D"
    }
  }

}
