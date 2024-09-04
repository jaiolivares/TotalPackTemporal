import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FiltroPipe } from 'src/app/core/pipes/filtro.pipe';
import { DetalleOficinasService } from 'src/app/core/services/http/inicio/detalle-oficinas.service';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import {  groupByStringKey, pad, secondsToString } from 'src/app/core/services/utils/utils';
import * as XLSX from "xlsx";
@Component({
  selector: 'app-modal-historico-estados-ejecutivos',
  templateUrl: './modal-historico-estados-ejecutivos.component.html',
})
export class ModalHistoricoEstadosEjecutivosComponent implements OnInit {
  customer: any;
  usuario: any;
  detalleOficina: any;
  series: any;
  escritorios: any;
  atencionesFiltradas:any[] = []
  estadosEjecutivoActual:any[] = [];
  constructor(
    private modalService: ModalService, private validaRutService: ValidaRutService, private filtroPipe: FiltroPipe
  ) {}

  data: any;

  async ngOnInit() {
    const atencionesAgrupadas = groupByStringKey(this.data.atenciones,'ejecutivo');
    this.estadosEjecutivoActual = atencionesAgrupadas[this.data.ejecutivo];
  }

  closeModal() {
    this.modalService.closeModal('modal-historico-estados-ejecutivos');
  }
  formatRut(rut:any){
    return this.validaRutService.formatearRut(rut);
  }
  convertSecondsToString(v:any){
    return secondsToString(v);
  }
  obtenerHora(fecha:any){
    const date = new Date(fecha);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }
  exportarDataExcel(){
    const dataFiltradaPorBusqueda = this.filtroPipe.transform(this.estadosEjecutivoActual,{},{key:'fH_Evento',type:'D'})
    const binaryWS = XLSX.utils.json_to_sheet(dataFiltradaPorBusqueda);
    // Create a new Workbook
    var wb = XLSX.utils.book_new()
    // Name your sheet
    XLSX.utils.book_append_sheet(wb, binaryWS, `Histórico estados ejecutivos`)

    // export your excel
    XLSX.writeFile(wb, `Histórico estados ejecutivos.xlsx`);
  }
  formatearFecha(fecha:any){
    return new Date(fecha.replace('-','/')).toLocaleDateString('es-ES')
  }
}
