import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DetalleOficinasService } from 'src/app/core/services/http/inicio/detalle-oficinas.service';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { secondsToString } from 'src/app/core/services/utils/utils';

@Component({
  selector: 'app-modal-escritorios-series',
  templateUrl: './modal-escritorios-series.component.html',
})
export class ModalEscritoriosSeriesComponent implements OnInit {
  customer: any;
  usuario: any;
  detalleOficina: any;
  series: any;
  escritorios: any;
  constructor(
    private modalService: ModalService,
    private validaRutService: ValidaRutService
  ) {}

  data: any;

  async ngOnInit() {
  }

  closeModal() {
    this.modalService.closeModal('modal-escritorios-series');
  }
  formatRut(rut:any){
    return this.validaRutService.formatearRut(rut);
  }

  getClassOf(series: any) {
      switch (series.estado) {
        case "Atendiendo":
          if (series.tpoAteA == 0) {
            return 'bg-success';
          } else {
            return 'bg-maroon';
          }
          break;
        case "Llamando":
          return 'bg-cyan'
          break;
        case "En Espera":
          return 'text-blue'
          break;
        default:
          return '';
          break;
      }
  }

}
