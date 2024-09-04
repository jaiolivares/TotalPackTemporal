import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ServiciosAgendaService } from 'src/app/core/services/http/agenda/servicios-agenda.service';
import { EstadoAgendaService } from 'src/app/core/services/pages/agenda.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { AesService } from 'src/app/core/services/utils/aes.service';

@Component({
  selector: 'app-servicios-agenda',
  templateUrl: './servicios-agenda.component.html',
  encapsulation: ViewEncapsulation.None,
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
export class ServiciosAgendaComponent implements OnInit,OnDestroy {
  agregarEditar = false;
  error = false;
  isLoading = false;
  errorMsg = "";
  form!:FormGroup;
  servicios:any;
  permisosAdministracion:any;
  estado:any;
  estadoSubscription = new Subscription()
  constructor(
    public formBuilder: FormBuilder,
    private localService: LocalService,
    private spinner: NgxSpinnerService,
    private estadoService: EstadoAgendaService,
    private servicosAgendaService: ServiciosAgendaService,
    private aesService: AesService
  ) { }


  async ngOnInit() {
    this.estadoSubscription =  this.estadoService.estado$.subscribe(async(estado)=>{
      //Estado previo
      const prevEstado = this.estado;
      //Estado actual
      this.estado = estado;
      //Para que se llame solo cuando la serie cambia, de modo que si se está en editar, regrese a datos.
      if(prevEstado && prevEstado.selectedIdSerie != estado.selectedIdSerie){
        //Al volver a datos, deselecciona el detalle que se tenga almacenado
        this.volverADatos();
        this.estadoService.setValor('selectedSerieDetalle',false);
        //Se actualiza solamente si la serie es agenda
        if(estado.selectedSerie?.Agenda){
          await this.obtenerSerieDetalle();
        }
      }
    })
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  async obtenerSerieDetalle(){
    this.error = false;
    this.isLoading = true;
    this.spinner.show("servicio-get-series-loading");
    try{
      let resp = await this.servicosAgendaService.obtenerSerieDetalle({IdSerieAge:this.estado.selectedIdSerie});
    if(resp['status'] == true){
      //Una vez se obtiene el detalle, se carga al estado.
      this.estadoService.setValor('selectedSerieDetalle',this.aesService.aesDecrypt(resp.data)[0])
     }else{
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener la serie'
     }
    }catch(e:any){
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener la serie'
    }
     this.spinner.hide("servicio-get-series-loading");
     this.isLoading = false;
  }

 async recargarServicio(luegoDeEliminar=false){
  this.isLoading = true;
  this.estadoService.setValor('refrescarSeries',true);
  //Si no se elimina, es necesario recargar el detalle para obtener la data fresca
  if(!luegoDeEliminar){
    await this.obtenerSerieDetalle();
  } else{
    //Si se elimina se debe eliminar el detalle anterior, pero no se refresca la data ya que la data ya no existe
    this.isLoading = false;
    
  }}
  volverADatos(){
    //Oculta el formulario de crear/editar
    this.agregarEditar = false;
  }
  irACrear(){
    //Muestra el formulario de crear/editar, como no se tiene una serieDetalle, será un formulario de crear
    this.agregarEditar = true;
    this.estadoService.setValor('selectedSerieDetalle',false);
  }
  irAEditar(){
    //Muestra el formulario de crear/editar, como si tiene una serieDetalle, será un formulario de editar
    this.agregarEditar = true;
  }
}
