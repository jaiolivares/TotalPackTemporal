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
  selector: 'app-info-historico-motivos-atencion',
  templateUrl: './info-historico-motivos-atencion.component.html',
  styleUrls: ['./info-historico-motivos-atencion.component.css'],
})
export class InfoHistorioMotivosAtencionComponent implements OnInit, OnDestroy {

  constructor(private localeService: BsLocaleService, private spinner: NgxSpinnerService, private localSecureService:LocalService, private bachtsService: BatchsService,
     private buscadorPipe: BuscadorPipe) {}

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
  filtrosBusqueda:any[] = ['letra-turno','idTurno','oficina','serie','motivo'];
  submit:boolean = false;
  p:number = 1;
  cargando:boolean = false;
  fechaFinOpen:boolean = false;
  fechaIniOpen:boolean = false;
  nombreGroupBy:string = "Ninguno";
  nombreOrderBy:string = "Ninguno";
  async ngOnInit(): Promise<void> {
    this.localeService.use('es')
    this.setFechaMaxima();
    this.customer = this.localSecureService.getValue('customer');
    await this.getBatchMotivosAtencion();
  }
  setFechaMaxima(){
    this.fechaMaxima = new Date();
  }
  ngOnDestroy(): void {
    this.modalEventSubscription.unsubscribe();
  }
  async getBatchMotivosAtencion(){
   if(!isEmpty(this.fechaRango)){
    this.spinner.show("servicio-loading");
    this.cargando = true;
    const resp:any = await this.bachtsService.getBatchMotivosAtencion(this.customer.slug,this.fechaRango[0],this.fechaRango[1]);
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
      await this.getBatchMotivosAtencion()
    }

  }

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
    XLSX.utils.book_append_sheet(wb, binaryWS, `Hist motivos de atención`)

    // export your excel
    XLSX.writeFile(wb, `Hist motivos de atención.xlsx`);
  }

}
