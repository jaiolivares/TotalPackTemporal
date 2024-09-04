import { Component, OnInit,  OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { Subscription } from 'rxjs';
import { BatchsService } from 'src/app/core/services/http/inicio/batchs.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import * as XLSX from "xlsx";
import { FiltroPipe } from 'src/app/core/pipes/filtro.pipe';
import { BuscadorPipe } from 'src/app/core/pipes/buscador.pipe';
import { isEmpty } from 'lodash';
@Component({
  selector: 'app-info-historico-atencion',
  templateUrl: './info-historico-atencion.component.html',
  styleUrls: ['./info-historico-atencion.component.css'],
})
export class InfoHistorioAtencionComponent implements OnInit, OnDestroy {

  constructor(private localeService: BsLocaleService, private spinner: NgxSpinnerService, private localSecureService:LocalService, private bachtsService: BatchsService,
    private filtroPipe: FiltroPipe, private buscadorPipe: BuscadorPipe) {}

  inputSearh = new FormControl('');
  searchText: string = '';
  orderBy: OrderBy = {};
  groupBy: GroupBy = {};
  atenciones: any[] = [];
  activeOrderBy: string = '';
  activeGroupBy: string = '';
  customer:any;
  modalEventSubscription: Subscription = new Subscription();
  fechaIni:any = [];
  fechaFin:any  = "";
  fechaRango:any  = "";
  fechaMaxima:any;
  filtrosBusqueda:any[] = ['letra-turno','oficina','serie','subSerie','ejecutivo','cliente','rut','escritorio'];
  submit:boolean = false;
  p:number = 1;
  cargando:boolean = false;
  fechaFinOpen:boolean = false;
  fechaIniOpen:boolean = false;
  nombreGroupBy:string = "Ninguno";
  nombreOrderBy:string = "Ninguno";
  async ngOnInit(): Promise<void> {
    // this.obtenerOficinas();
    this.localeService.use('es')
    this.setFechaMaxima();
    this.customer = this.localSecureService.getValue('customer');
    await this.obtenerBatchAtencion();
  }
  setFechaMaxima(){
    this.fechaMaxima = new Date();
  }
  ngOnDestroy(): void {
    this.modalEventSubscription.unsubscribe();
  }
  async obtenerBatchAtencion(){
   if(!isEmpty(this.fechaRango)){
    this.spinner.show("servicio-loading");
    this.cargando = true;
    const resp:any = await this.bachtsService.getBatchAtencion(this.customer.slug,this.fechaRango[0],this.fechaRango[1]);
    if(resp['status']){
      this.atenciones = resp['data'];

    }
    this.cargando = false;
    this.spinner.hide("servicio-loading");
   }
  }
  async onSubmitFiltrosBusqueda(){
    if(!isEmpty(this.fechaRango)){
      this.submit=true;
      await this.obtenerBatchAtencion()
    }

  }



  // ordenar(key: string, type: string,nombre:string) {
  //   if (key === '' || type === '') {
  //     this.orderBy = {};
  //     this.activeOrderBy='';
  //     this.nombreOrderBy = 'Ninguno';
  //   } else {
  //     this.orderBy.key = key;
  //     this.orderBy.type = type;
  //     this.activeOrderBy = `${key}-${type}`;
  //     this.nombreOrderBy = nombre;
  //   }
  // }
  // agrupar(key: string, value: any,nombre:string) {
  //   if (key === '' || value === '') {
  //     this.groupBy = {};
  //     this.activeGroupBy = '';
  //     this.nombreGroupBy = 'Ninguno'
  //   } else {
  //     this.groupBy.key = key;
  //     this.groupBy.value = value;
  //     this.activeGroupBy = `${key}-${value}`;
  //     this.nombreGroupBy = nombre
  //   }
  // }

  tecleado(event: any) {
    this.searchText = event.value;
  }

  limpiar() {
    this.searchText = '';
    this.inputSearh.setValue('');
  }



  exportarDataExcel(){
    const dataFiltradaPorBusqueda = this.buscadorPipe.transform(this.atenciones,this.searchText,this.filtrosBusqueda)
    const binaryWS = XLSX.utils.json_to_sheet(dataFiltradaPorBusqueda);
    // Create a new Workbook
    var wb = XLSX.utils.book_new()
    // Name your sheet
    XLSX.utils.book_append_sheet(wb, binaryWS, `Histórico de atenciones`)

    // export your excel
    XLSX.writeFile(wb, `Histórico de atenciones.xlsx`);
  }

}
