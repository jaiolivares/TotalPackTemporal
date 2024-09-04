import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { LocalService } from './../../../core/services/storage/local.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { Component, OnInit } from '@angular/core';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-oficinas',
  templateUrl: './oficinas.component.html',
  styleUrls: ['./oficinas.component.css'],
  providers:[EstadoOficinasService]
})
export class OficinasComponent implements OnInit {
  customer:any;
  usuario:any;
  oficinas:any[] = [];
  seleccionada = '';
  estadoSubscription = new Subscription()
  estado:any;
  permisosOficinas:any;
  searchText: string = '';
  inputSearh = new FormControl('');

  constructor(
    private localSecureService:LocalService,
    private oficinasService: OficinaService,
    private sweetAlertService: SweetAlertService,
    private modalService: ModalService,
    private estadoService: EstadoOficinasService,
    private oficinaService: OficinaService,
    private spinner: NgxSpinnerService,
    private localService: LocalService
  ) { }

  ngOnInit(): void {
    this.permisosOficinas = this.localService.getValue('permisosOficinas')

    this.customer = this.localSecureService.getValue('customer');
    this.usuario = this.localSecureService.getValue('usuario');
    this.obtenerOficinas();
    this.estadoSubscription = this.estadoService.estado$.subscribe(async(estado)=>{
      const prevEstado = this.estado;
      this.estado = estado;
      if(prevEstado && prevEstado.selectedIdOficina != estado.selectedIdOficina ){
        await this.obtenerOficina()
      }
      if(prevEstado && prevEstado.selectedOficina && prevEstado.selectedOficina.oficina != estado.selectedOficina.oficina){
        await this.obtenerOficinas()
      }

    })
  }

  async obtenerOficinas(){
    this.spinner.show('obtener-data-general-spinner');
    (await this.oficinasService.obtenerOficinas(this.customer.slug))
      .subscribe(resp => {
        if(resp.status){
          //console.log(resp);
          this.oficinas = resp['data'].filter((oficina:any)=>this.permisosOficinas.includes(oficina.id));
         }else{
           this.sweetAlertService.toastConfirm('error','Error al obtener oficinas!');
         }
         this.spinner.hide('obtener-data-general-spinner');

      })

   }

   getClassOfBg(oficina: string) {
    if (oficina == this.seleccionada) {
      return 'bg-seleccionada text-white seleccionada'
    } else {
      return ''
    }
  }

  handleSelectOficina(oficina:any){
    this.seleccionada = oficina.valor;
    this.estadoService.setValor('selectedIdOficina',oficina.id)
  }


  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  async obtenerOficina(){
    this.spinner.show('obtener-data-general-spinner')
    try{
      const resp:any = await this.oficinaService.obtenerOficina(this.customer.slug,this.estado.selectedIdOficina);
    if(resp.status){
      if(resp.data.length > 0){
        this.estadoService.setValor('selectedOficina',resp.data[0])
      } else {
        this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener la oficina');
      }
    } else {
      this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener la oficina');
    }
    } catch(e:any){
      this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener la oficina');
    }
    this.spinner.hide('obtener-data-general-spinner')
  }

  tecleado(event: any) {
    this.searchText = event.value;
  }

  limpiar() {
    this.searchText = '';
    this.inputSearh.setValue('');
  }

}
