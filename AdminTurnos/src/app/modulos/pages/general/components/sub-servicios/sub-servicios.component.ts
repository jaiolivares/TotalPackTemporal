import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { SubSeriesService } from 'src/app/core/services/http/general/sub-series.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { groupByKey, handleTexts } from 'src/app/core/services/utils/utils';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { cloneDeep, isUndefined } from 'lodash';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';

@Component({
  selector: 'app-sub-servicios',
  templateUrl: './sub-servicios.component.html',
  styleUrls: ['./sub-servicios.component.css'],
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
export class SubServiciosComponent implements OnInit {
  agregar = false;
  error = false;
  editar = false;
  selectedMenu = "";
  listDrop: any = [];
  series: any = [];
  subSeries: any = [];
  menus: any = [];
  customer: any;
  permisosAdministracion: any;
  errorMsg: any;
  subSeriesNoAsig: any = [];
  menusData: any = [];
  constructor(
    private subSeriesService: SubSeriesService,
    private localService: LocalService,
    private seriesService: SeriesService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private estadoService: EstadoGeneralService

  ) { }
  async ngOnInit() {
    this.customer = this.localService.getValue('customer');
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.obtenerDatos();
  }

  async obtenerSubSeries() {
    this.spinner.show("servicio-get-menu-loading");
    try {
      let resp = await this.subSeriesService.obtenerSubSeries(this.customer.slug);
      if (resp['status'] == true) {
        if (resp.data.length > 0) {
          this.menusData = groupByKey(resp.data, 'idMenu').map((menu: any) => {
            const series = menu.filter((menu: any) => menu.idSerie != null).map((menu: any) => ({ idSerie: menu.idSerie, idMenu: menu.idMenu, serieBoton: menu.serieBoton }))
            return {
              idMenu: menu[0].idMenu,
              nombre: menu[0].menu,
              series: series
            }
          });
          this.estadoService.setValor('totalMenus',this.menusData.length)
          this.menusData.forEach((element: any, i: any) => {
            this.listDrop.push('list' + i)
          });
        } else {
          this.menusData = [];
          this.error = true;
          this.errorMsg = 'No se han encontrado menús'
        }

      } else {
        this.error = true;
        this.errorMsg = 'Ha ocurrido un error al obtener los menús'
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener los menús'
    }
  }
  async obtenerSeries() {
    this.error = false;
    this.spinner.show("servicio-get-menu-loading");
    try {
      let resp = await this.seriesService.obtenerSeries(this.localService.getValue('customer').slug);
      if (resp['status'] == true) {
        if (resp.data.length > 0) {
          this.series = resp['data'].map((serie: any) => ({ idSerie: serie.id, serieBoton: serie.valor }));
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
  async obtenerDatos(){
    await this.obtenerSubSeries();
    await this.obtenerSeries();
  }

  async volverADatos(reFetch: any) {
    this.agregar = false;
    this.editar = false;
    this.selectedMenu = ""
    if (reFetch) {
      this.obtenerDatos();
    }
  }



  irACrear() {
    this.agregar = true;
  }
  irAEditar(menu: any) {
    this.editar = true;
    this.selectedMenu = menu;
  }

  drop(event: CdkDragDrop<any>, index = 0, data: any = "") {
    //Para mover dentro del mismo contenedor
    if (event.previousContainer === event.container) {
      //Si el contenedor no es el contenedor de la series, permite el movimiento de las series dentro del mismo
      if (event.container.id != 'series') {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
    } else {
      //Para la asignación de elementos desde las series, es decir, a cada lista, por tanto se evalua si no es de series, para no asignarle elementos a la lista
      // de series desde las otras listas
      if (event.container.id != 'series') {
        //Si el elemento vienen de la lista de series, agregalos a la lista nueva
        if (event.previousContainer.id == 'series') {
          const idMenu = data.idMenu
          const prevContainerData = cloneDeep(event.previousContainer.data);
          let dataToAdd: any = prevContainerData[event.previousIndex];
          dataToAdd.idMenu = idMenu;
          dataToAdd.nuevo = true;
          let newSeriesArray = event.container.data;
          newSeriesArray.push(dataToAdd);
          this.menusData[index].series = this.menusData[index].series.filter((item: any, pos: any) => {
            return this.menusData[index].series.findIndex((o: any) => item.idSerie === o.idSerie) == pos;
          });
        } else {
          // Si el elemento viene de otra lista que no sea series, comprueba si está en la lista, si está no lo agrega, pero si no está lo agrega
          let containsElement = event.container.data.find((element: any) => element.idSerie == event.previousContainer.data[event.previousIndex].idSerie);
          if (isUndefined(containsElement)) {
            const elementToTransfer = event.previousContainer.data[event.previousIndex]
            elementToTransfer.idMenu = data.idMenu
            elementToTransfer.nuevo = true
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex,
            );
          }
        }
      } else {
        //Si se arrastra un elemento a la lista de series, se elimina de la lista original
        const listToChangeIndex = event.previousContainer.id.replace('list', '');
        let newMenusData = cloneDeep(this.menusData);
        newMenusData[listToChangeIndex].series.splice(event.previousIndex, 1)
        this.menusData = newMenusData;
      }
    }
  }

  async handleActualizarMenus() {
    let seriesEnMenu: any;
    this.menusData.forEach((menu: any, menuIndex: any) => {
      const menuSeriesFiltradas = menu.series.filter((serie: any) => (serie.idSerie != null));
      menuSeriesFiltradas.forEach((serie: any, index: any) => {
        seriesEnMenu = handleTexts(seriesEnMenu, `${serie.idMenu},${serie.idSerie};`)
      })
    })
    if(seriesEnMenu){
      this.spinner.show('servicio-get-menu-loading')
      const data = {
        idUser: this.localService.getValue('usuario').idUsuario,
        idOfi: 0,
        lista: seriesEnMenu.slice(0, -1),
      }
      try {
        const resp: any = await this.subSeriesService.actualizarMenus(
          this.localService.getValue('customer').slug,
          data
        );
        if (resp['status'] && resp.data[0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'Los menús se han actualizado con éxito');
          this.menusData.forEach((menu:any)=>{
            const menuSeriesFiltradas = menu.series.filter((serie: any) => (serie.idSerie != null));
            menuSeriesFiltradas.forEach((serie: any, index: any) => {
              serie.nuevo = false;
            })
          })
        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al actualizar los menús  ${resp.data?.[0]?.['msg'] ? '- '+resp.data?.[0]?.['msg'] : '' }`);
        }
        this.spinner.hide("servicio-get-menu-loading");
      }
      catch (error: any) {
        //console.log(error);
        this.spinner.hide("servicio-get-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al actualizar los menús');
      }
    } else {
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al actualizar los menús, los menús no tienen series.');
    }
  }

  async deleteSubSerie(menu: any) {
    const alert: any = await this.sweetAlertService.swalConfirm(`¿Desea eliminar el menú ${menu.nombre}?`)
    if (alert) {
      this.spinner.show('servicio-get-menu-loading')
      try {
        const resp: any = await this.subSeriesService.eliminarSubSerie(
          this.localService.getValue('customer').slug,
          this.localService.getValue('usuario').idUsuario,
          menu.idMenu
        );
        if (resp['status'] && resp.data[0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'El menú se ha eliminado con éxito');
          await this.obtenerDatos()
        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al eliminar el menú  ${resp.data?.[0]?.['msg'] ? '- '+resp.data?.[0]?.['msg'] : '' }`);
        }
        this.spinner.hide("servicio-get-menu-loading");
      }
      catch (error: any) {
        this.spinner.hide("servicio-get-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al eliminar el menú');
      }
    }

  }





}
