import { Component, Input, OnInit } from '@angular/core';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { secondsToString } from 'src/app/core/services/utils/utils';
import { ModalHistoricoAtencionComponent } from '../modal-historico-atencion/modal-historico-atencion.component';
@Component({
  selector: 'app-historico-card',
  templateUrl: './historico-card.component.html',
})
export class HistoricoCardComponent implements OnInit {
  @Input() atenciones: any;
  @Input() searchText: any;
  @Input() filtrosBusqueda: any;
  @Input() orderBy: OrderBy = {};
  @Input() groupBy: GroupBy = {};
  @Input() p!:number;
  constructor(
    private validaRutService: ValidaRutService, private modalService: ModalService
  ) { }

  convertSecondsToString(seconds:any){
    return secondsToString(seconds);
  }
  ngOnInit(): void {
  }

  formatRut(rut:any){
    return this.validaRutService.formatearRut(rut);
  }

  modalAtencion(data: any) {
    const options = {
      id: 1,
      class: 'modal-lg modal-dialog-centered modal-info-oficinas modal-historico-atencion ',
      centered: true,
      ignoreBackdropClick: false,
      initialState: { data: data },
      animated: true,
    };
    this.modalService.openModal(
      ModalHistoricoAtencionComponent,
      options,
      'modal-historico-atencion'
    );
  }

  formatearFecha(fecha:any){
    return new Date(fecha.replace('-','/')).toLocaleDateString('es-ES')
  }

}
