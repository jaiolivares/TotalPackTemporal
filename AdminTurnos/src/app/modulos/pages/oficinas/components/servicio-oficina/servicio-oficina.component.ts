import { Component, OnInit } from '@angular/core';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { Subscription } from 'rxjs';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { ServicioOficinaService } from 'src/app/core/services/http/oficina/servicio-oficina.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-servicio-oficina',
  templateUrl: './servicio-oficina.component.html',
  styleUrls: ['./servicio-oficina.component.css']
})
export class ServicioOficinaComponent implements OnInit {

  customer:any;
  permisosAdministracion:any;
  estadoSubscription = new Subscription()
  estado:any;
  listaSeries:any[] = [];
  listaSerieOriginal:any[] = []
  series:any[] = [];
  selectedSerie:any;
  editar:any;
  constructor(
    private localService: LocalService,
    private estadoService: EstadoOficinasService, 
    private SeriesService:SeriesService,
    private seriesOfiService:ServicioOficinaService,
    private spinner: NgxSpinnerService, 
    private sweetAlertService: SweetAlertService) { }

  async ngOnInit() {
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.customer = this.localService.getValue('customer');
    this.estadoSubscription = this.estadoService.estado$.subscribe(async(estado)=>{
      const prevEstado = this.estado;
      this.estado = estado;
      if (prevEstado && prevEstado.selectedIdOficina != estado.selectedIdOficina) {
        this.seiresXoficina(this.estado.selectedIdOficina)
      }
    })
    
  }

  async seiresXoficina(idOficina:number){
    this.spinner.show();
    const resp = await this.seriesOfiService.obtenerSeriesXoficina(this.customer.slug, idOficina)
    if(resp.status){
      this.series = resp.data;
      let ids = this.series.map(data => data.id);
      this.obtenerSeires(ids);
      this.spinner.hide("servicio-loading");
     }else{
       this.spinner.hide("servicio-loading");
       this.sweetAlertService.toastConfirm('error','¡Error al obtener listado de series!');
     }   
  }

  async obtenerSeires(ids:any){
    this.spinner.show();
    const resp = await this.SeriesService.obtenerSeries(this.customer.slug)
    if(resp.status){
      this.listaSeries = await resp.data.filter((item:any) =>! ids.find((id: any) => item.id == id));
     this.listaSerieOriginal = this.listaSeries;
      this.spinner.hide("servicio-loading");
     }else{
       this.spinner.hide("servicio-loading");
       this.sweetAlertService.toastConfirm('error','¡Error al obtener listado de series!');
     }     
  }

  async editarSeries(id:number,select:any,edit:boolean,limpiar:boolean){

    if(limpiar){
      this.series = this.series.filter(item => item.active != true || item.desactive != true && item.active != true);
      this.series.forEach(item => delete item.active && delete item.desactive)
      this.listaSeries = this.listaSerieOriginal;
    }

    if(select){      
      let selected = this.listaSeries.filter(item => item.id == select.value);
      this.series.push({id: selected[0].id, valor: selected[0].valor, active:true})
      this.listaSeries = this.listaSeries.filter(item => item.id != select.value);    
    }    
  
    if(id){
      let index = this.series.findIndex(index => index.id == id);      
      if(this.series[index].desactive == true){        
        this.series[index].desactive = false; 
      }else{
        if(this.series[index].active == true){
          this.series.splice(index,1);           
          let data = this.listaSerieOriginal.filter((item:any) =>! this.series.find((itme2: any) => item.id == itme2.id));
          this.listaSeries = data;
        }else{
          this.series[index].desactive = true;
        }
      }
    }
  
      let seriesId = this.series.filter(item => item.desactive != true);
      let ids = seriesId.map(item => item.id);

      if (!edit) {
        return;
      }

    this.spinner.show("servicio-loading");

    let resp = await this.seriesOfiService.agregarSerieAOficina(this.customer.slug, this.estado.selectedOficina.idOficina, ids.toString());
    if(resp.status && resp['data'][0].codError == 0){
      this.sweetAlertService.toastConfirm('success','¡Series Editadas!');
      this.estadoService.setValor('seriesXOficinaActualizadas',true)
      this.listaSeries = [];
      await this.seiresXoficina(this.estado.selectedOficina.idOficina);
     }else{
       this.spinner.hide("servicio-loading");
       this.sweetAlertService.toastConfirm('error', `¡Error al editar series!  ${resp.data?.[0]?.['msg'] ? '- '+resp.data?.[0]?.['msg'] : '' }`);
     } 

    }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  editarSerieXOficina(serie:any){
    this.selectedSerie = {
      id:serie.id,
      valor:serie.valor,
      idOficina:this.estado.selectedIdOficina
    };
    this.editar = true;
  }

  volverADatos(){
    this.selectedSerie = "";
    this.editar = false;
  }
  async recargarSeries(){
    this.estadoService.setValor('seriesXOficinaActualizadas',true)
    await this.seiresXoficina(this.estado.selectedIdOficina)
    
  }

}
