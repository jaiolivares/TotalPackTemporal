import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { PantallasService } from 'src/app/core/services/http/oficina/pantallas.service';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
@Component({
  selector: 'app-pantallas',
  templateUrl: './pantallas.component.html',
  styleUrls: ['./pantallas.component.css'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '*',
          opacity: '1',
          visibility: 'visible',
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: '0',
          'margin-bottom': '-100px',
          visibility: 'hidden',
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
})
export class PantallasComponent implements OnInit, OnDestroy {
  editar = false;
  crear = false;
  cargaInicial = false;
  customer: any;
  estado: any;
  selectedPantalla: any;
  idOficinaCustomer: any;
  pantallas: any;
  series: any;
  permisosAdministracion: any;
  estadoSubscription: Subscription = new Subscription();
  constructor(
    private localService: LocalService,
    private estadoService: EstadoOficinasService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private pantallasService: PantallasService,
    private oficinasService: OficinaService,
    private seriesService: SeriesService,

  ) {}

  async ngOnInit() {
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.customer = this.localService.getValue('customer');

    this.estadoSubscription = this.estadoService.estado$.subscribe(
      async (estado) => {
        const prevEstado = this.estado;
        this.estado = estado;
        // if (estado.selectedIdOficina && !this.cargaInicial) {
        //   this.cargaInicial = true;
        //   await this.obtenerDatos();
        // }
        if (
          prevEstado &&
          prevEstado.selectedIdOficina != estado.selectedIdOficina
        ) {
          this.volverADatos();
          await this.obtenerDatos();
        }
      }
    );
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  async obtenerDatos(){
    this.spinner.show('obtener-data-pantallas-spinner');
    await this.obtenerOficinaCustomer();
    await this.obtenerSeries();
    await this.obtenerPantallas();
    this.spinner.hide('obtener-data-pantallas-spinner');
  }

  async obtenerPantallas() {
    try {
      const resp: any = await this.pantallasService.obtenerPantallas(
        this.idOficinaCustomer
      );
      if (resp.status) {
        this.pantallas = resp.data;
        for (let index = 0; index < this.pantallas.length; index++) {
          const pantalla = this.pantallas[index];
          await this.obtenerSeriesPorPantalla(pantalla,pantalla.idPantallaTurno)
        }
      } else {
        this.sweetAlertService.toastConfirm(
          'error',
          'Ha ocurrido un error al obtener las pantallas'
        );
        this.spinner.hide('obtener-data-pantallas-spinner');
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm(
        'error',
        'Ha ocurrido un error al obtener las pantallas'
      );
      this.spinner.hide('obtener-data-pantallas-spinner');
    }
  }

  async obtenerSeries() {
    try {
      const resp = await this.seriesService.obtenerSeriesPorOficina(
        this.customer.slug,
        this.estado.selectedIdOficina
      );
      if (resp.status) {
        this.series = resp.data;
      } else {
        this.sweetAlertService.toastConfirm(
          'error',
          'Ha ocurrido un error al obtener el listado de series'
        );
        this.spinner.hide('obtener-data-pantallas-spinner');
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm(
        'error',
        'Ha ocurrido un error al obtener el listado de series'
      );
      this.spinner.hide('obtener-data-pantallas-spinner');
    }
  }
  async obtenerSeriesPorPantalla(pantalla:any,idPantallaTurno:any) {
    try {
      const resp = await this.pantallasService.obtenerSeriesPorPantalla(
        idPantallaTurno
      );
      if (resp.status) {
        let seriesEnPantalla:any = [];
        resp.data.forEach((pantallaView: any) => {
          const selectedSerie = this.series.find(
            (serie: any) => serie.id == pantallaView.idSerie
          );
          if (selectedSerie) {
            seriesEnPantalla.push({
              idSerie: pantallaView.idSerie,
              serie: selectedSerie.valor,
            });
          }
        });
        pantalla.series = seriesEnPantalla;
      } else {
        this.sweetAlertService.toastConfirm(
          'error',
          'Ha ocurrido un error al obtener las series del customer'
        );
        this.spinner.hide('obtener-data-pantallas-spinner');
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm(
        'error',
        'Ha ocurrido un error al obtener las series del customer'
      );
      this.spinner.hide('obtener-data-pantallas-spinner');
    }
  }

  async obtenerOficinaCustomer() {
    try {
      const resp: any = await this.oficinasService.obtenerCustomerOficinas(
        this.customer.idCustomer
      );
      if (resp.status) {
        const oficinaActual = resp.data.find(
          (oficina: any) => oficina.idOficina == this.estado.selectedIdOficina
        );
        if (oficinaActual) {
          this.idOficinaCustomer = oficinaActual.idOficinaCustomer;
        } else {
          throw new Error(
            'No se encontró la oficina en el servicio de customers.'
          );
        }
      } else {
        this.sweetAlertService.toastConfirm(
          'error',
          'Ha ocurrido un error al obtener las pantallas'
        );
        this.spinner.hide('obtener-data-pantallas-spinner');
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm(
        'error',
        e.message ? e.message : 'Ha ocurrido un error al obtener las pantallas'
      );
      this.spinner.hide('obtener-data-pantallas-spinner');
    }
  }

  irAEditar(pantalla: any) {
    this.editar = true;
    this.selectedPantalla = pantalla;
  }

  irACrear() {
    this.crear = true;
  }
  async volverADatos(data:any={reloadData:false}) {
    this.editar = false;
    this.crear = false;
    this.selectedPantalla = '';
    if (data.reloadData) {
      this.spinner.show('obtener-data-pantallas-spinner');
      await this.obtenerSeriesPorPantalla(data.pantalla,data.pantalla.idPantallaTurno)
      this.spinner.hide('obtener-data-pantallas-spinner');
    }
  }
}
