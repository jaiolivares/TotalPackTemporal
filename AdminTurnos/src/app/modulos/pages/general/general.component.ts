import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { EjecutivosService } from 'src/app/core/services/http/general/ejecutivos.service';
import { MotivosAtencionService } from 'src/app/core/services/http/general/motivos-atencion.service';
import { MotivosPausaService } from 'src/app/core/services/http/general/motivos-pausa.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { SubSeriesService } from 'src/app/core/services/http/general/sub-series.service';
import { UsuariosService } from 'src/app/core/services/http/general/usuarios.service';
import { ZonasService } from 'src/app/core/services/http/general/zonas.service';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { groupByKey } from 'src/app/core/services/utils/utils';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers:[EstadoGeneralService]

})
export class GeneralComponent implements OnInit, OnDestroy {

  constructor(private estadoService:EstadoGeneralService, private ejecutivosService: EjecutivosService, private spinner: NgxSpinnerService,
    private localService: LocalService, private zonaService:ZonasService, private motivosPausaService: MotivosPausaService,
    private motivosService: MotivosAtencionService, private seriesService: SeriesService, private sweetAlertService: SweetAlertService, private subSeriesService: SubSeriesService,
    private usuariosService: UsuariosService) { }
  currentIndex = 0;
  estado:any;
  customer:any;
  anyError= 0
  estadoSubscription:Subscription = new Subscription();
  async ngOnInit() {
    this.customer = this.localService.getValue('customer');
    this.estadoSubscription = this.estadoService.estado$.subscribe((estado)=>{
      this.estado = estado;
    });
    await this.obtenerDatos();
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
  handleSelectedTabChange(event:any){
    this.currentIndex = event.index;
  }
  async obtenerDatos(){
    this.spinner.show("obtener-datos-loading");
    await this.obtenerEjecutivos();
    await this.obtenerMotivos();
    // await this.obtenerZonas();
    await this.obtenerSeries();
    await this.obtenerMotivosPausa();
    await this.obtenerUsuarios();
    await this.obtenerMenus();
    this.spinner.hide("obtener-datos-loading");
    if(this.anyError > 0){
      this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener los datos');
    }
  }
  async obtenerEjecutivos(){

    (await this.ejecutivosService.obtenerEjecutivos(this.customer.slug))
      .subscribe(resp => {
        if(resp.status){
          this.estadoService.setValor('totalEjecutivos',resp['data'].length);
         }else{
          this.anyError++;
         }
      },error => {
        this.anyError++;
      })
   }
   async obtenerZonas(){
    (await this.zonaService.obtenerZonas(this.customer.slug))
      .subscribe(resp => {
        if(resp.status){
          this.estadoService.setValor('totalZonas',resp.data.length);
         }else{
          this.anyError++;
         }
      },error => {
        this.anyError++;
      });
  }
  async obtenerMotivos(){
    (await this.motivosService.obtenerMotivos(this.customer.slug))
      .subscribe({
        next: async (resp: any) => {
          if(resp.status){
            this.estadoService.setValor('totalMotivos',resp.data.length);
           }else{
            this.anyError++;
           }
        }
      }),(error:any) => {
        this.anyError++;
      };
  }
  async obtenerSeries(){
    this.spinner.show("servicio-get-series-loading");
    try{
      let resp = await this.seriesService.obtenerSeries(this.localService.getValue('customer').slug);
    if(resp['status'] == true){
      this.estadoService.setValor('totalSeries',resp.data.length);

     }else{
      this.anyError++;
     }
    }catch(e:any){
      this.anyError++;
    }
  }

  async obtenerMenus() {
    this.spinner.show("servicio-get-menu-loading");
    try {
      let resp = await this.subSeriesService.obtenerSubSeries(this.customer.slug);
      if (resp['status'] == true) {
        if (resp.data.length > 0) {
          const menusData = groupByKey(resp.data, 'idMenu');
          this.estadoService.setValor('totalMenus',menusData.length)
        }
      } else {
        this.anyError++;
      }
    } catch (e: any) {
      this.anyError++;
    }
  }

  async obtenerMotivosPausa(){
    (await this.motivosPausaService.obtenerMotivos(this.customer.slug))
      .subscribe({
        next: async (resp: any) => {
          if(resp.status){
            this.estadoService.setValor('totalMotivosPausa',resp.data.length);
           }else{
            this.anyError++;
           }
        }
      }),(error:any) => {
        this.anyError++;
      };
  }

  async obtenerUsuarios(p = 1) {
    this.spinner.show();
    const resp = await this.usuariosService.obtenerUsuarios(p);
    this.spinner.hide();

    if (!resp['status']) {
      this.anyError++;
      return;
    }
    this.estadoService.setValor('totalUsuarios',resp.data.length);
  }
}
