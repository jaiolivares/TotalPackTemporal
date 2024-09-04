import {  Component,  OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { MedicosService } from 'src/app/core/services/http/pacientes/medicos.service';
import { PantallasService } from 'src/app/core/services/http/pacientes/pantallas.service';
import { EstadoMedicosService } from 'src/app/core/services/pages/medicos.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers:[EstadoMedicosService]
})
export class PacientesComponent implements OnInit, OnDestroy {

  constructor(
    private estadoService:EstadoMedicosService, private medicosService: MedicosService, private spinner: NgxSpinnerService,
    private localService: LocalService, private pantallasService:PantallasService,
    private sweetAlertService: SweetAlertService,) { }

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
    //await this.obtenerMedicos();
    await this.obtenerPantallas();
    this.spinner.hide("obtener-datos-loading");
    if(this.anyError > 0){
      this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener los datos');
    }
  }

  async obtenerMedicos(){
    (await this.medicosService.obtenerMedicos())
      .subscribe(resp => {
        if(resp.status){
          this.estadoService.setValor('totalMedicos',resp['data'].length);
         }else{
          this.anyError++;
         }
      },error => {
        this.anyError++;
      })
   }

   async obtenerPantallas(){
    (await this.pantallasService.obtenerPantallas())
      .subscribe(resp => {
        if(resp.status){
          this.estadoService.setValor('totalPantallas',resp.data.length);
         }else{
          this.anyError++;
         }
      },error => {
        this.anyError++;
      });
  }


}
