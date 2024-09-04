import { Component, Input, OnInit } from '@angular/core';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { groupByStringKey, secondsToString } from 'src/app/core/services/utils/utils';
import { ModalHistoricoMotivosAtencionComponent } from '../modal-historico-motivos-atencion/modal-historico-motivos-atencion.component';
@Component({
  selector: 'app-historico-motivos-card',
  templateUrl: './historico-motivos-card.component.html',
})
export class HistoricoMotivosCardComponent implements OnInit {
  @Input() atenciones: any;
  @Input() searchText: any;
  @Input() filtrosBusqueda: any;
  @Input() orderBy: OrderBy = {};
  @Input() groupBy: GroupBy = {};
  @Input() p!:number;
  constructor(
    private validaRutService: ValidaRutService, private modalService: ModalService, private swaalService: SweetAlertService
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
    const datosFiltrados = groupByStringKey(this.atenciones,'idTurno');
    const datosAgrupados = datosFiltrados[data.idTurno]
    //console.log(datosFiltrados)
    if(datosAgrupados && datosAgrupados.length > 1){
      const options = {
        id: 1,
        class: 'modal-lg modal-dialog-centered modal-info-oficinas modal-historico-motivos-atencion ',
        centered: true,
        ignoreBackdropClick: false,
        initialState: { data: {...data, motivos:datosAgrupados} },
        animated: true,
      };
      this.modalService.openModal(
        ModalHistoricoMotivosAtencionComponent,
        options,
        'modal-historico-motivos-atencion'
      );
    } else {
      this.swaalService.swalInfo('Detalles motivos de atención','Este turno posee solo éste motivo de atención')
    }

  }
  formatearFecha(fecha:any){
    return new Date(fecha.replace('-','/')).toLocaleDateString('es-ES')
  }
}
