import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { BotonesService } from 'src/app/core/services/http/oficina/botones.service';
import { CustomerService } from 'src/app/core/services/http/customer.service';
import { ImagesService } from 'src/app/core/services/misc/images.service';
import { environment } from 'src/environments/environment.prod';
import { filter } from 'rxjs/operators';

interface EmisorConValores {
  idEmisor: number; // Cambia 'any' por el tipo apropiado para idEmisor
  valores: any[]; // Cambia 'any' por el tipo apropiado para los valores
}
@Component({
  selector: 'app-botones',
  templateUrl: './botones.component.html',
  styleUrls: ['./botones.component.css'],
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

export class BotonesComponent implements OnInit, OnDestroy {

  titulo: string = 'Titulo';
  error = false;
  emisor: any;
  emisordeSeries: any; // encargado de listar las series del o los emisores
  // cargaInicial = false;
  listDrop: any = [];
  botones: any = [];
  botonesOld: any = [];
  botonesEnEmisor: any = [];
  botonesEnEmisorOld: any = [];
  customer: any;
  permisosAdministracion: any;
  estado: any;
  errorMsg: any;
  logo: any;
  estadoSubscription: Subscription = new Subscription()
  now!: Date;
  fecha: any;
  version: string = '';
  vistaDragAndDrop = false;
  agregar = false;
  isCollapsed = false;
  idEmisor: boolean = false;
  respEmisor: any; // encargado de listar los emisores en la pantalla principal
  emisorId: any;
  constructor(
    private localService: LocalService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private estadoService: EstadoOficinasService,
    private botonesService: BotonesService,
    private customerService: CustomerService,
    private imagesService: ImagesService,

  ) {

  }

  async ngOnInit() {
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.customer = this.localService.getValue('customer');
    this.customerService.setColores();
    this.logo = await this.imagesService.getLogo(this.customer.slug);
    this.now = new Date();
    this.fecha = setInterval(() => {
      this.now = new Date();
    }, 1000);
    this.version = environment.version;
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      const prevEstado = this.estado;
      this.estado = estado;
      if (prevEstado && prevEstado.selectedIdOficina != estado.selectedIdOficina) {
        await this.obtenerDatos();
      }
      if (estado.seriesXOficinaActualizadas == true) {
        this.estadoService.setValor('seriesXOficinaActualizadas', false);
        await this.obtenerDatos();
      }
    })
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
    clearInterval(this.fecha);

  }

  eliminarEmisor(dato: any) {
    this.sweetAlertService.swalConfirm('¿Desea eliminar el emisor?').then(async (resp) => {
      if (resp) {
        this.spinner.show('servicio-get-menu-loading')
        try {
          const data = {
            idEmisor: dato,
            idOficina: this.estado.selectedIdOficina,
            lista: '',
          }
          const resp = await this.botonesService.asignarBotones(
            this.localService.getValue('customer').slug,
            data);
          if (resp['status'] && resp.data[0].codError == 0) {
            this.sweetAlertService.toastConfirm('success', 'El emisor se ha eliminado con éxito');
            await this.obtenerDatos();
          } else {
            this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al eliminar el emisor  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
          }
          this.spinner.hide("servicio-get-menu-loading");
        }
        catch (error: any) {
          this.spinner.hide("servicio-get-menu-loading");
          this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al eliminar el emisor ');
        }
      }
    })
  }
  async agregarEmisor(): Promise<any> {
    this.agregar = true;
    this.vistaDragAndDrop = true;
    this.idEmisor = false;
    this.isCollapsed = true;
    this.titulo = 'Agregar';
    this.listDrop.push('botonesEnEmisor')
    this.botonesEnEmisor = [];
    this.emisorId = '';
    await this.obtenerBotonesSeries();
    await this.limpiarDatos();
  }
  async editarEmisor(emisor: any): Promise<any> {
    // console.log(this.emisorId);
    this.emisorId = emisor; // Número
    this.agregar = false;
    this.vistaDragAndDrop = true;
    this.idEmisor = true;
    this.isCollapsed = true;
    this.titulo = 'Editando';
    // this.botones = [];
    await this.obtenerBotonesEnEmisor(this.emisorId)
    await this.obtenerBotonesSeries();
    await this.limpiarDatos();
  }
  async cancelar() {
    this.agregar = false;
    this.vistaDragAndDrop = false;
    this.isCollapsed = false;
    await this.obtenerDatos();
  }
  //filtra el emisor para solo sea mostrado 1 emisor y no se muestren repetidos
  // filtrarPorIdEmisorUnico(pruebas: any) {
  //   const idsEmisoresVistos = new Set();
  //   const pruebasFiltradas = pruebas.filter((prueba: { idEmisor: any; }) => {

  //     if (!idsEmisoresVistos.has(prueba.idEmisor)) {
  //       idsEmisoresVistos.add(prueba.idEmisor);
  //       return true;
  //     }
  //     return false;
  //   });

  //   return pruebasFiltradas;
  // }
  // Obtiene todos los emisores para que sean listado en la pantalla principal

  async ObtenerEmisores(): Promise<any> {

    try {
      let resp2 = await this.botonesService.obtenerListadoEmisores(this.customer.slug, this.estado.selectedIdOficina);
      if (resp2['status'] == true) {
        const emisores = resp2.data;
        this.vistaDragAndDrop = false;
        this.agregar = false;
        this.isCollapsed = false;
        this.idEmisor = false;
        //Función reductora que acumula un valor, el acumulador tiene un tipo definido en la interfaz.
        // ubicada en este componente.
        const agrupadosPorEmisor = emisores.reduce((acc: { [key: string]: EmisorConValores }, emisor: any) => {
          if (!acc[emisor.idEmisor]) { // Si no existe el emisor en el acumulador, lo agrega
            acc[emisor.idEmisor] = { // Crea el emisor en el acumulador
              idEmisor: emisor.idEmisor, // Asigna el id del emisor
              valores: [emisor.valor] // Crea un arreglo con el valor del emisor
            };
          } else { // Si ya existe el emisor en el acumulador, agrega el valor al arreglo
            acc[emisor.idEmisor].valores.push(emisor.valor); // Agrega el valor al arreglo
          }
          return acc; // Retorna el acumulador
        }, {}); // Inicializa el acumulador como un objeto vacío

        // Convertir el objeto agrupado en un arreglo
        const resultado = Object.values(agrupadosPorEmisor);
        this.respEmisor = resultado;
      } else {
        this.errorMsg = 'No se han encontrado emisores'
      }
    } catch (error) {
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener los botones del emisor'
    }

  }
  // Obtiene los emisores con listado de botones por cada emisor
  async obtenerBotonesEnEmisor(emisor: any) {
    this.spinner.show("servicio-get-menu-loading");
    try {
      let resp = await this.botonesService.obtenerBotonesEnEmisor(this.customer.slug, this.estado.selectedIdOficina, emisor);
      if (resp['status'] == true) {
        if (resp.data.length > 0) {
          this.spinner.hide("servicio-get-menu-loading");
          this.botonesEnEmisor = resp.data.map((boton: any) => ({ id: boton.id, idBoton: boton.idBoton, valor: boton.valor, tipo: boton.tipo, letra: boton.letra, activo: boton.activo }));
          this.botonesEnEmisorOld = cloneDeep(this.botonesEnEmisor);
          this.listDrop.push('botonesEnEmisor')
        } else {
          this.botonesEnEmisor = [];
          this.listDrop.push('botonesEnEmisor')
          this.error = true;
          this.errorMsg = 'No se han encontrado botones en el emisor'
        }
      } else {
        this.error = true;
        this.errorMsg = 'Ha ocurrido un error al obtener los botones del emisor'
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener los botones del emisor'
    }
  }

  async obtenerBotonesSeries() {
    this.error = false;
    this.spinner.show("servicio-get-menu-loading");
    try {
      let resp = await this.botonesService.obtenerBotonesSeries(this.localService.getValue('customer').slug, this.estado.selectedIdOficina);
      if (resp['status'] == true) {
        if (resp.data.length > 0) {
          this.botones = resp['data'].map((boton: any) => ({ id: boton.id, valor: boton.valor, tipo: boton.tipo, letra: boton.letra }));
          // this.botones = this.objetoEmisor.map((boton: any) => ({ id: boton.id, valor: boton.valor, tipo: boton.tipo, letra: boton.letra }));
          this.listDrop.push('botones');
        } else {
          this.botones = []
          this.listDrop.push('botones');
          this.error = true;
          this.errorMsg = 'No se han encontrado botones'
        }
      } else {
        this.error = true;
        this.errorMsg = 'Ha ocurrido un error al obtener los botones'
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener los botones'
    }
    this.spinner.hide("servicio-get-menu-loading");
  }

  async obtenerDatos() {
    // await this.obtenerBotonesEnEmisor();
    await this.ObtenerEmisores();
    await this.obtenerBotonesSeries();
    this.limpiarDatos();
  }

  async limpiarDatos() {
    let idsBotonesEnEmisor = this.botonesEnEmisor.map((boton: { id: any; tipo: any; }) => `${boton.id}_${boton.tipo}`);

    this.botones = this.botones.filter((boton: { id: any; tipo: any; }) => {
      let idTipo = `${boton.id}_${boton.tipo}`;
      return !idsBotonesEnEmisor.includes(idTipo);
    });
    this.botonesOld = cloneDeep(this.botones);
  }

  drop(event: CdkDragDrop<any>, index = 0, data: any = "") {
    //Para mover dentro del mismo contenedor
    if (event.previousContainer === event.container) {
      //Si el contenedor no es el contenedor de la series, permite el movimiento de las series dentro del mismo
      console.log("comprobación cdkdrop 0 " + event.container.id)
      if (event.container.id != 'botones') {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
      else {
        console.log("comprobación cdkdrop 1 " + event.container.id)
      }
    } else {
      if (event.container.id != 'botones') {
        //Si el elemento vienen de la lista de botones, agregalos a la lista de botones en el emisor
        if (event.previousContainer.id == 'botones') {
          const prevContainerData = cloneDeep(event.previousContainer.data);
          let dataToAdd: any = prevContainerData[event.previousIndex];
          dataToAdd.nuevo = true;
          dataToAdd.activo = true;
          let newBotonesEnEmisorArray = event.container.data;
          newBotonesEnEmisorArray.push(dataToAdd);
          let newBotonesArray = event.previousContainer.data;
          newBotonesArray.splice(event.previousIndex, 1)
        }
        else {
          console.log("comprobación cdkdrop 2" + event.container.id)
        }
      } else {
        // si el elemento viene de la lista de botones en el emisor, agregalos a la lista de botones
        const prevContainerData = cloneDeep(event.previousContainer.data);
        let dataToAdd: any = prevContainerData[event.previousIndex];
        delete dataToAdd.nuevo;
        delete dataToAdd.activo
        let newBotonesArray = event.container.data;
        newBotonesArray.push(dataToAdd);
        let newBotonesEnEmisorArray = event.previousContainer.data;
        newBotonesEnEmisorArray.splice(event.previousIndex, 1)
      }
    }
  }


  //Controla el evento a medida cambia  y válida si es num y el largo
  async controlNumeroEmisor(event: any) {
    const input = event.target.value;
    const regex = /^[0-9]*$/;
    const isNumber = regex.test(input);
    if (!isNumber) {
      this.sweetAlertService.toastConfirm('error', 'Debe ingresar solo números');
      this.emisor = '';
      return;
    }
    if (input.length > 2) {
      this.sweetAlertService.toastConfirm('error', 'Puedes ingresar solo hasta el número 32');
      this.emisor = '';
      return;
    }
    if (input > 32) {
      this.sweetAlertService.toastConfirm('error', 'Puedes ingresar solo hasta el número 32');
      this.emisor = '';
      return;
    }
    return;
  }

  async crearEmisor(dato: any): Promise<any> {
    this.spinner.show('servicio-get-menu-loading')
    try {
      let emisorExiste = false;
      if (!dato) {
        this.spinner.hide("servicio-get-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Debe ingresar un número de emisor');
        return;
      }

      let botonesEnEmisor: any;
      this.botonesEnEmisor.forEach((boton: any, index: any) => {
        botonesEnEmisor = handleTexts(botonesEnEmisor, `${index + 1},${boton.id},${boton.tipo},${boton.activo == true ? 1 : 0};`)
      })
      if (this.botonesEnEmisor.length == 0) {
        this.spinner.hide("servicio-get-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Debe seleccionar al menos un botón');
        return;

      }

      this.respEmisor.forEach((emisor: any) => {
        if (emisor.idEmisor == dato) {
          this.spinner.hide("servicio-get-menu-loading");
          this.sweetAlertService.toastConfirm('error', 'El emisor ya existe');
          emisorExiste = true;
        }
      });
      this.spinner.hide("servicio-get-menu-loading");
      console.log('acá');

      if (emisorExiste) {
        return;
      }

      const data = {
        idEmisor: dato,
        idOficina: this.estado.selectedIdOficina,
        lista: botonesEnEmisor.slice(0, -1),
      }
      const resp: any = await this.botonesService.asignarBotones(
        this.localService.getValue('customer').slug, data
      );
      if (resp.status && resp.data[0].codError == 0) {
        console.log('acá');
        this.sweetAlertService.toastConfirm('success', 'El emisor se ha creado con éxito');
        this.agregar = false;
        // this.emisorId = resp.data[0].idEmisor;
        this.emisor = '';

        await this.obtenerDatos();
        this.spinner.hide("servicio-get-menu-loading");
        console.log('acá');
        return resp;
      }

      this.spinner.hide("servicio-get-menu-loading");
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al crear el emisor ');
      return;

    } catch (error: any) {
      this.spinner.hide("servicio-get-menu-loading");
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al crear el emisor ');
    }
  }
  async handleActualizarBotonesEnEmisor() {
    let botonesEnEmisor: any;
    this.botonesEnEmisor.forEach((boton: any, index: any) => {
      botonesEnEmisor = handleTexts(botonesEnEmisor, `${index + 1},${boton.id},${boton.tipo},${boton.activo == true ? 1 : 0};`)
    })

    if (botonesEnEmisor) {
      this.spinner.show('servicio-get-menu-loading')
      const data = {
        idEmisor: this.emisorId,
        idOficina: this.estado.selectedIdOficina,
        lista: botonesEnEmisor.slice(0, -1),
      }

      try {
        const resp: any = await this.botonesService.asignarBotones(
          this.localService.getValue('customer').slug,
          data
        );
        if (resp['status'] && resp.data[0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'Los botones del emisor se han actualizado con éxito');
          this.botonesOld = cloneDeep(this.botones);
          // Por si se diferencia entre nuevo o no, para pasarlo a false una vez se cree
          this.botonesEnEmisor.forEach((boton: any) => {
            boton.nuevo = false;
          })
          this.botonesEnEmisorOld = cloneDeep(this.botonesEnEmisor);

        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al actualizar los botones del emisor  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.spinner.hide("servicio-get-menu-loading");
      }
      catch (error: any) {
        this.spinner.hide("servicio-get-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al actualizar los botones del emisor ');
      }
    } else {
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al actualizar los botones del emisor , el emisor no tiene botones.');
    }
  }

  async limpiarBotonesEnEmisorAsignados() {
    const resp = await this.sweetAlertService.swalConfirm('¿Desea limpiar los botones asignados?')
    if (resp) {
      this.botonesEnEmisor = cloneDeep(this.botonesEnEmisorOld);
      this.botones = cloneDeep(this.botonesOld);
    }
  }

  changeSelectedSerie(id: any, activar = false) {
    const selectedBoton = this.botonesEnEmisor.find((boton: any) => boton.id == id);
    // const isNewBoton = this.botonesEnEmisorOld.find((boton:any)=>boton.id == id);
    selectedBoton.activo = activar;
    // if(selectedBoton && !isUndefined(isNewBoton)){
    //   selectedBoton.activo = activar;
    // }
    // if(selectedBoton && isUndefined(isNewBoton)){
    //   const indexSerie = this.botonesEnEmisor.indexOf(selectedBoton);
    //   this.botonesEnEmisor.splice(indexSerie,1);
    //   const selectedBotonToAdd = this.botonesEnEmisor.find((boton:any)=>boton.id == id);
    //   selectedBotonToAdd.activo = true;
    // }
  }

  obtenerBotonesActivos() {
    return this.botonesEnEmisor.filter((boton: any) => boton.activo)
  }
}
