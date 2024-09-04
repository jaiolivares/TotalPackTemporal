import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DetalleOficinasService } from 'src/app/core/services/http/inicio/detalle-oficinas.service';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { secondsToString } from 'src/app/core/services/utils/utils';

@Component({
  selector: 'app-modal-historico-atencion',
  templateUrl: './modal-historico-atencion.component.html',
})
export class ModalHistoricoAtencionComponent implements OnInit {
  customer: any;
  usuario: any;
  detalleOficina: any;
  series: any;
  escritorios: any;
  constructor(
    private modalService: ModalService, private validaRutService: ValidaRutService
  ) {}

  data: any;

  async ngOnInit() {
  }

  closeModal() {
    this.modalService.closeModal('modal-historico-atencion');
  }
  formatRut(rut:any){
    return this.validaRutService.formatearRut(rut);
  }
  convertSecondsToString(v:any){
    return secondsToString(v);
  }
  formatearFecha(fecha:any){
    return new Date(fecha.replace('-','/')).toLocaleDateString('es-ES')
  }


}
