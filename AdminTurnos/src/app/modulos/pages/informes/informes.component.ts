import { Component, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { EstadoInformesService } from 'src/app/core/services/pages/informes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { AesService } from 'src/app/core/services/utils/aes.service';
@Component({
  selector: 'app-informes',
  templateUrl: './informes.component.html',
  encapsulation: ViewEncapsulation.None,
  providers:[EstadoInformesService]
})
export class InformesComponent implements OnInit, OnDestroy {

  @Input()oficinas:any[] = [];
  @Input()series:any[] = [];

  permisosOficinas:any;
  customer:any;
  estado:any;
  estadoSubscription = new Subscription();
  searchText: string = "";
  inputSearh = new FormControl('');
  selectedInforme:any;

  informes = [
    {
      id: 1,
      nombre: 'Reporte DWH',
    },
    {
      id: 2,
      nombre: 'DWH pausas',
    },
    {
      id: 3,
      nombre: 'DWH atenciones (Proveedores)',
    },
    {
      id: 4,
      nombre: 'Reporte Agenda Listado',
    },
    {
      id: 5,
      nombre: 'Atenciones por categoría',
    },
    {
      id: 6,
      nombre: 'Pausas por sucursal',
    },
    {
      id: 7,
      nombre: 'Nivel de servicio',
    },
    {
      id: 8,
      nombre: 'Nivel de servicio por región',
    },
    // {
    //   id: 9,
    //   nombre: 'Agenda listado',
    // },
    {
      id: 9,
      nombre: 'Oficinas zonas',
    },
    {
      id: 10,
      nombre: 'Análisis demanda',
    }
];

  constructor(
    private estadoService: EstadoInformesService,
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

      if(prevEstado && prevEstado.selectedIdInformes != estado.selectedIdInformes ){
       this.obtenerOficinas();
      }

      if(prevEstado && prevEstado.selectedInforme && prevEstado.selectedInforme.oficina != estado.selectedInforme.oficina){
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

  handleSelectInforme(informe:any){
    this.selectedInforme = informe.id;
    this.estadoService.setValor('selectedIdOficina',informe.id)
  }


}
