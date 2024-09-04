import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ServiciosAgendaService } from 'src/app/core/services/http/agenda/servicios-agenda.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { EstadoAgendaService } from 'src/app/core/services/pages/agenda.service';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { AesService } from 'src/app/core/services/utils/aes.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  encapsulation: ViewEncapsulation.None,
  providers:[EstadoAgendaService]
})
export class AgendaComponent implements OnInit, OnDestroy {
  currentIndex = 0;
  searchText: string = '';
  inputSearh = new FormControl('');
  isLoading:boolean = false;
  error:boolean = false;
  errorMsg: string = "";
  series:any = [];
  selectedIdSerie:any;
  estado:any;
  estadoSubscription = new Subscription();
  serviciosAgendaTab = 0;
  constructor(
    private seriesService:SeriesService,
    private localService: LocalService,
    private spinner: NgxSpinnerService,
    private estadoService: EstadoAgendaService,
    private servicosAgendaService: ServiciosAgendaService,
    private aesService: AesService
    ) { }
  async ngOnInit() {
    await this.obtenerServicios();
    this.estadoSubscription =  this.estadoService.estado$.subscribe(async(estado)=>{
      //Estado actual
      this.estado = estado;
      //Refresca el serivicio luego de crear/editar data
      if(estado.refrescarSeries){
        //Se coloca en false para que lo haga solamente una vez.
        this.estadoService.setValor('refrescarSeries',false);
        //Obtiene nuevamente los servicios
        await this.obtenerServicios();
        //Actualiza la serie seleccionada con el nuevo valor de Agenda
        this.estadoService.setValor('selectedSerie',this.series.find((serie:any)=>serie.IdSerie == estado.selectedIdSerie));
      }
    })
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
  handleSelectedTabChange(event:any){
    this.currentIndex = event.index;
  }
  tecleado(event: any) {
    this.searchText = event.value;
  }
  
  limpiar() {
    this.searchText = '';
    this.inputSearh.setValue('');
  }



  async obtenerServicios(){
    this.error = false;
    this.isLoading = true;
    this.spinner.show("servicio-get-series-loading");
    try{
      let resp = await this.servicosAgendaService.obtenerServicios();
    if(resp['status'] == true){
      this.series = this.aesService.aesDecrypt(resp.data);

     }else{
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener las series'
     }
    }catch(e:any){
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener las series'
    }
     this.spinner.hide("servicio-get-series-loading");
     this.isLoading = false;
  }
  

  handleSelectSerie(serie:any){
    this.serviciosAgendaTab = 0;
    this.selectedIdSerie = serie.IdSerie;
    this.estadoService.setValor('selectedSerie',serie)
    this.estadoService.setValor('selectedIdSerie',serie.IdSerie)
  }

}
