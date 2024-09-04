import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { EscritoriosService } from 'src/app/core/services/http/oficina/escritorios.service';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-escritorios',
  templateUrl: './escritorios.component.html',
  styleUrls: ['./escritorios.component.css'],
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
    ])
  ]
})
export class EscritoriosComponent implements OnInit, OnDestroy {
  editar = false;
  crear = false;
  // cargaInicial = false;
  estadoSubscription = new Subscription()
  estado: any;
  customer: any;
  permisosAdministracion: any;
  escritorios: any;
  selectedEscritorio: any;
  constructor(private localService: LocalService, private estadoService: EstadoOficinasService, private spinner: NgxSpinnerService, private escritoriosService: EscritoriosService, private sweetAlertService: SweetAlertService) { }

  async ngOnInit() {
    this.customer = this.localService.getValue('customer');
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      const prevEstado = this.estado;
      this.estado = estado;
      // if (estado.selectedIdOficina && !this.cargaInicial) {
      //   this.cargaInicial = true;
      //   await this.obtenerEscritorios()

      // }
      if (prevEstado && prevEstado.selectedIdOficina != estado.selectedIdOficina) {
        this.volverADatos();
        await this.obtenerEscritorios()
      }
    })
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
  async volverADatos(reloadData: any = false) {
    this.editar = false;
    this.crear = false;
    this.selectedEscritorio = "";
    if (reloadData) {
      await this.obtenerEscritorios();
    }
  }
  irACrear() {
    this.crear = true;
  }
  irAEditar(escritorio:any) {
    this.editar = true;
    this.selectedEscritorio = escritorio;
  }
  async obtenerEscritorios() {
    this.spinner.show('obtener-data-general-spinner')
    try {
      const resp: any = await this.escritoriosService.obtenerEscritorios(this.customer.slug, this.estado.selectedIdOficina);
      if (resp.status) {
        this.escritorios = resp.data;
      } else {
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener los escritorios');
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener los escritorios');
    }
    this.spinner.hide('obtener-data-general-spinner')
  }

  async deleteEscritorio(escritorio: any) {
    const alert: any = await this.sweetAlertService.swalConfirm(`¿Desea eliminar el escritorio N° ${escritorio.id}?`)
    if (alert) {
      this.spinner.show('obtener-data-general-spinner')
      try{
        const resp = await this.escritoriosService.eliminarEscritorio(this.customer.slug, this.estado.selectedIdOficina, this.localService.getValue('usuario').idUsuario, escritorio.id)
        if (resp['status']) {
          this.sweetAlertService.toastConfirm('success', 'El escritorio se ha eliminado correctamente');
          await this.obtenerEscritorios();
        } else {
          this.spinner.hide('obtener-data-general-spinner')
        }
      }
      catch(e:any){
        this.spinner.hide('obtener-data-general-spinner');
      }
    }

  }


}
