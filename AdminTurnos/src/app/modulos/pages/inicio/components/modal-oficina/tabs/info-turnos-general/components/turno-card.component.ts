import { Component, Input, OnInit } from '@angular/core';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';

@Component({
  selector: 'app-turno-card',
  templateUrl: './turno-card.component.html',
  styleUrls: ['./turno-card.component.css']
})
export class TurnoCardComponent implements OnInit {
  @Input() turnos: any;
  @Input() searchText: any;
  @Input() orderBy: OrderBy = {};
  @Input() groupBy: GroupBy = {};
  constructor(
    private validaRutService: ValidaRutService
  ) { }


  ngOnInit(): void {
  }

  formatRut(rut: any) {
    return this.validaRutService.formatearRut(rut);
  }

  getClassOf(val: any) {
    switch (val) {
      case "EN ESPERA":
        return 'text-gray-dark';
        break;
      case "ATENDIENDO":
        return 'text-blue';
        break;
      case "ANULADO":
        return 'text-orange';
        break;
      case "FINALIZADO":
        return 'text-indigo';
        break;
      case "LLAMANDO":
        return 'text-gray';
        break;
      default:
        return '';
        break;
    }
  }
}
