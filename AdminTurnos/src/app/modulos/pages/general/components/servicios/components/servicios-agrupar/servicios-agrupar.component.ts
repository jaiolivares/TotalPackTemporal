import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { groupByKey, handleTexts } from 'src/app/core/services/utils/utils';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { cloneDeep, isUndefined } from 'lodash';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';
import { Subscription, map } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { SubSeriesService } from 'src/app/core/services/http/general/sub-series.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';

@Component({
  selector: 'app-servicios-agrupar',
  templateUrl: './servicios-agrupar.component.html',
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
export class ServiciosAgruparComponent implements OnInit {
  titulo: any = [];
  letra: any; // letra de la serie utilizado solo para el titulo
  idSerie: any; // id de la serie utilizado solo para el titulo
  isLoading = false;
  eliminar = false;
  editar = false;
  error = false;
  isSubmitted: false | undefined;
  estadoSubscription: Subscription = new Subscription();
  permisosAdministracion: any;
  estado: any;
  customer: any;
  errorMsg: any;
  serieId: any
  selectedMenu: string = "";
  eventos: any = [];
  menusData: any = [];
  filtrado: any = []; // filtrado de series que estan dentro de un grupo
  filtradoserie: any = []; // filtrado de las series que tiene un grupo por la serie
  listDropDataEntrante: any = [];
  listDrop: any = [];
  series: any = [];
  @Input() data: any
  @Output() volver = new EventEmitter();
  constructor(
    private subSeriesService: SubSeriesService, // para eliminar
    private seriesService: SeriesService,// para eliminar
    private localService: LocalService,
    private estadoService: EstadoGeneralService,
    private estadoOficinasService: EstadoOficinasService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
  ) {
    this.serieId = this.seriesService.getSerieId();

    this.idSerie = this.serieId.idSerie;
    this.titulo = this.serieId.serie;
    this.letra = this.serieId.letra
  }

  ngOnInit(): void {
    this.customer = this.localService.getValue('customer');
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')


    this.obtenerDatos();
  }
  ngOnDestroy(): void {

  }

  async obtenerDatos() {

    await this.obtenerSubSeries();
    await this.obtenerSeries();
  }
  /**Obtienes de la lista de series para [list1] los que actualmente estan en grupos */
  async obtenerSubSeries() {
    try {
      this.spinner.show("servicio-get-menu-loading");
      const resp = await this.seriesService.obtenerListaSerie(this.customer.slug);

      if (resp.status === true) {
        if (resp.data.length > 0) {
          /**filtrado = series que estan dentro de un grupo, si el id de grupo es igual a la serie que 
           * viene seleccionada no se debe mostrar disponible para ser asignada
           */
          this.filtrado = resp.data.filter((element: any) => element.idGrupoG === this.serieId.idSerie);
          this.eventos.push([...this.filtrado]);
        } else {
          this.error = true;
          this.errorMsg = 'No se han encontrado menús';
        }
      } else {
        this.error = true;
        this.errorMsg = 'Ha ocurrido un error al obtener los menús';
      }
    } catch (error: any) {
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener los menús';
    } finally {
      this.spinner.hide("servicio-get-menu-loading");
    }
  }

  async obtenerSeries() {
    this.error = false;
    this.spinner.show("servicio-get-menu-loading");
    try {
      let resp = await this.seriesService.obtenerListaSerie(this.customer.slug);
      if (resp['status'] == true) {
        if (resp.data.length > 0) {
          const filtradoserie = resp.data.filter((element: any) => 
          element.idGrupoG !== this.serieId.idSerie && 
          element.serie !== this.serieId.serie &&
          element.idGrupoG === null &&
          element.fGrupo !== true );
          this.series = filtradoserie;
          this.listDrop.push('series');
        } else {
          this.series = []
          this.error = true;
          this.errorMsg = 'No se han encontrado series'
        }
      } else {
        this.error = true;
        this.errorMsg = 'Ha ocurrido un error al obtener las series'
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener las series'
    }
    this.spinner.hide("servicio-get-menu-loading");
  }

  async irAEliminar() {
    // this.eliminar = true;p
    const alert: any = await this.sweetAlertService.swalConfirm(`¿Desea eliminar el grupo?`)
    if (alert) {
      this.spinner.show('servicio-get-menu-loading')

      const data = {
        idUsuario: this.localService.getValue('usuario').idUsuario,
        idOficina: 0,
        idSerieMaestra: this.serieId.idSerie,
      }
      try {
        const resp: any = await this.seriesService.eliminarSerieGrupo(
          this.localService.getValue('customer').slug, data
        );
        if (resp['status'] && resp.data[0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'El grupo se ha eliminado con éxito');
          await this.obtenerDatos()
        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al eliminar el grupo  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.spinner.hide("servicio-get-menu-loading");
      }
      catch (error: any) {
        this.spinner.hide("servicio-get-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al eliminar el grupo');
      }
    }
  }
  async volverADatos(reFetch: any) {
    this.eliminar = false;
    this.editar = false;
    this.selectedMenu = ""
    if (reFetch) {
      this.obtenerDatos();
    }
  }
  async handleActualizarMenus() {
    // let seriesEngrupo: any [] = [];
    const seriesEngrupo = this.listDropDataEntrante.map((item: { idSerie: any; }) => item.idSerie) // Extraemos los idSerie de cada item.
      .filter((idSerie: null) => idSerie != null) // Filtramos para asegurarnos de que no sean nulos.
      .join(', '); // Unimos los idSerie con una coma y espacio.

    if (seriesEngrupo) {
      this.spinner.show('servicio-get-menu-loading')
      const data = {
        idUsuario: this.localService.getValue('usuario').idUsuario,
        idOficina: 0,
        idSerieMaestra: this.serieId.idSerie, // es el id que es seleccionado antes de agrupar
        listaSerie: seriesEngrupo,
      }
      try {
        const resp: any =
          await this.seriesService.agregarSerieGrupo(
            this.localService.getValue('customer').slug,
            data
          );
        if (resp['status'] && resp.data[0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'Las serie se han actualizado con éxito');
          this.obtenerDatos(); // recargamos los datos
        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al actualizar los menús  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.spinner.hide("servicio-get-menu-loading");
      }
      catch (error: any) {
        this.spinner.hide("servicio-get-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al actualizar el grupo');
      }
    } else {
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al actualizar el grupo, el grupo no tienen series.');
    }
  }

  irAEditar(menu: any) {
    this.editar = true;
    this.selectedMenu = menu;
  }
  drop(event: CdkDragDrop<any>, index = 0, data: any = "") {
    if (event.previousContainer === event.container) {
      //se mueve dentro del mismo contenedor tanto list1 y list2
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.listDropDataEntrante = event.container.data;
    } else {

      if (event.container.id != 'list1') {

        if (event.previousContainer.id == 'list1') {

          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );
          this.listDropDataEntrante = event.previousContainer.data;
        } else {
          this.listDropDataEntrante = event.container.data;
        }

      } else {
        this.listDropDataEntrante = event.container.data;
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
      }
    }
  }
  onVolver() {
    this.isSubmitted = false;
    this.volver.emit()
  }
}
