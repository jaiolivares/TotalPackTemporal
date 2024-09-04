import { Component, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { EstadoReportesService } from 'src/app/core/services/pages/reportes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { AesService } from 'src/app/core/services/utils/aes.service';
@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  encapsulation: ViewEncapsulation.None,
  providers:[EstadoReportesService]
})
export class ReportesComponent implements OnInit, OnDestroy {

  @Input()oficinas:any[] = [];
  @Input()series:any[] = [];

  permisosOficinas:any;
  customer:any;
  estado:any;
  estadoSubscription = new Subscription();
  searchText: string = "";
  inputSearh = new FormControl('');
  selectedReporte:any;

  reportes= [
    {
      id:1,
      nombre:'Resumen de Espera Agrupado',
    },
    {
      id:2,
      nombre:'Resumen de Espera No Agrupado',
    },
    {
      id:3,
      nombre:'Resumen de Atención Agrupado',
    },
    {
      id:4,
      nombre:'Resumen de Atención No Agrupado',
    },
    {
      id:5,
      nombre:'Estado de Ejecutivos',
    },
    {
      id:6,
      nombre:'Ranking de Ejecutivos',
    },

  ]

  constructor(
    private estadoService: EstadoReportesService,
    private oficinasService: OficinaService,
    private seriesService: SeriesService,
    private aesService: AesService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private localService: LocalService,
    ) { }

  async ngOnInit() {
    this.estadoSubscription = this.estadoService.estado$.subscribe(async(estado)=>{

      const prevEstado = this.estado;
      this.estado = estado;

      if(prevEstado && prevEstado.selectedIdReportes != estado.selectedIdReportes ){
       this.obtenerOficinas();
      }
      
      if(prevEstado && prevEstado.selectedReporte && prevEstado.selectedReporte.oficina != estado.selectedReporte.oficina){
        this.obtenerOficinas();
      }
    })

    this.customer = this.localService.getValue('customer');
    this.permisosOficinas = this.localService.getValue('permisosOficinas')
    this.obtenerOficinas();
    this.obtenerServicios()
  }


  async obtenerOficinas(){
    this.spinner.show('obtener-data-general-spinner');
    (await this.oficinasService.obtenerOficinas(this.customer.slug))
      .subscribe(resp => {
        if(resp.status){
          this.oficinas = resp['data'].filter((oficina:any)=>this.permisosOficinas.includes(oficina.id));
          this.spinner.hide('obtener-data-general-spinner');
         }else{
          this.spinner.hide('obtener-data-general-spinner');
           this.sweetAlertService.toastConfirm('error','Error al obtener oficinas!');
         }
      })
   }



   async obtenerServicios(){
    try{
      this.spinner.show('obtener-data-general-spinner');
      let resp = await this.seriesService.obtenerSeries(this.customer.slug);
    if(resp['status'] == true){
      this.spinner.hide('obtener-data-general-spinner');
      this.series = resp.data;
     }else{
      this.spinner.hide('obtener-data-general-spinner');
      this.sweetAlertService.toastConfirm('error','Error al obtener series!');
     }
    }catch(e:any){
      this.spinner.hide('obtener-data-general-spinner');
      this.sweetAlertService.toastConfirm('error','Error al obtener series!');
    }
  }
  

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
  
  tecleado(event: any) {
    this.searchText = event.value;
  }
  
  limpiar() {
    this.searchText = '';
    this.inputSearh.setValue('');
  }

  handleSelectReporte(reporte:any){
    this.selectedReporte = reporte.id;
    this.estadoService.setValor('selectedIdOficina',reporte.id)
  }


}
