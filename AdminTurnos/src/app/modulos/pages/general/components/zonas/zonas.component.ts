import { Component, OnInit } from '@angular/core';
import { ZonasService } from 'src/app/core/services/http/general/zonas.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';

@Component({
  selector: 'app-zonas',
  templateUrl: './zonas.component.html',
  styleUrls: ['./zonas.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
          height: '*',
          opacity: '1',
          'visibility': 'visible'
      })),
      state('closed', style({
          height: '0px',
          opacity: '0',
          'margin-bottom': '-100px',
          'visibility': 'hidden'
      })),
      transition('open => closed', [
          animate('0.5s')
      ]),
      transition('closed => open', [
          animate('0.5s')
      ]),
  ]),
]
})

export class ZonasComponent implements OnInit {

  constructor(
    private zonaService:ZonasService,
    private spinner: NgxSpinnerService,
    public formBuilder: FormBuilder,
    private localSecureService:LocalService,
    private sweetAlertService: SweetAlertService,
    private estadoService: EstadoGeneralService
  ) { }

  agregar = false;
  actualizar = false;
  form!:FormGroup;
  customer:any;
  usuario:any
  zonas:any[] = [];
  idZona:number = 0;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      id: new FormControl("f", [Validators.required, Validators.min(1), Validators.max(100000000)]),
      nombre: new FormControl("", [Validators.required])
    });

    this.usuario = this.localSecureService.getValue('usuario');
    this.customer = this.localSecureService.getValue('customer');
    this.obtenerZonas();
  }

  async obtenerZonas(){
    this.spinner.show("servicio-loading");
    (await this.zonaService.obtenerZonas(this.customer.slug))
      .subscribe(resp => {
        if(resp.status){
          this.zonas = resp.data;
          this.estadoService.setValor('totalZonas',resp.data.length)
          this.spinner.hide("servicio-loading");
         }else{
           this.spinner.hide("servicio-loading");
           this.sweetAlertService.toastConfirm('error','Error al obtener zonas!');
         } 
      },error => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error','Error al obtener zonas!');
      });
  }

 async selectZona(idZona:number){
  this.spinner.show("servicio-loading");
    this.agregar = true;
    this.actualizar = true
    const resp = await this.zonaService.obtenerUnaZona(this.customer.slug, idZona);
  
    if(resp.status){
      let zona = resp.data[0];
      this.idZona = zona.idZona;

      this.form.patchValue({
        id:zona.idZona,
        nombre:zona.zona,
      });     
      this.spinner.hide("servicio-loading");
    }else{
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('error','¡Error al obtener zona!');
    }
  
}

  async enviarForm(){
    if(this.form.invalid){
      this.sweetAlertService.toastConfirm('warning','¡Por favor ingrese el campo!');
      return;
    }

    this.spinner.show("servicio-loading");
    if(this.actualizar){
      const resp = await this.zonaService.actualizarZona(this.customer.slug, this.form.value, this.usuario.idUsuario);

      if(resp.status && resp.data[0].codError == 0){
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('success','¡Zona editada!');
        this.cerrarForm();
        this.obtenerZonas();
       }else{
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', `¡Error al actualizar!  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
       }
    }else{
      const resp = await this.zonaService.agregarZona(this.customer.slug, this.form.value, this.usuario.idUsuario);
      
      if(resp.status && resp.data[0].codError == 0){
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('success','¡Zona agregada!');
       
        this.cerrarForm();
        this.obtenerZonas();
      }else{
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', `¡Error al agregar!  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
      }
    }
  }

  async borrarZona(idZona:number, nombreZona:string){

    this.sweetAlertService.swalConfirm(`¿ Estás seguro que deseas eliminar la zona "${nombreZona}" ?`).then(async resp => {     
      if (resp) {
        this.spinner.show("servicio-loading");
        const resp = await this.zonaService.eliminarZona(this.customer.slug, this.usuario.idUsuario, idZona)

        if(resp.status){
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('success','¡Zona eliminada!');
          this.obtenerZonas();
        }else{
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error','¡Error al eliminar!');
        }
      }      
    });

  }

  cerrarForm(){
    this.agregar = false;
    this.actualizar = false;
    this.idZona = 0;
    this.form.reset({
      id:'f',
      nombre:''
    });
  }



// async obtenerSeries(){
//   let resp = await this.seriesService.obtenerSeries();
//   if(resp.status){
//     this.seriesHabilitadas = resp.data.series.filter((serie:any) => serie.activo == 1);
//     this.seriesDeshabilitadas = resp.data.series.filter((serie:any) => serie.activo != 1);
//    }else{
//     console.log('error al obtener series')
//    }
// }

}



