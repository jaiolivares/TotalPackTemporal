import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { Subscription } from 'rxjs';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { handleTexts } from 'src/app/core/services/utils/utils';
import { cloneDeep, isEmpty, isUndefined } from 'lodash';
import { EscritoriosService } from 'src/app/core/services/http/oficina/escritorios.service';

@Component({
  selector: 'app-escritorios-edit',
  templateUrl: './escritorios-edit.component.html',
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
export class EscritoriosEditComponent implements OnInit, OnDestroy {
  @Output() onVolver: EventEmitter<any> = new EventEmitter()
  @Input() data: any
  estadoSubscription = new Subscription()
  estado: any;
  customer: any;
  permisosAdministracion: any;
  escritorios: any;
  duplicar = false;
  seCopiaronEscritorios = false;
  form: any;
  seriesSelect: any = [];
  series: any = [];
  seriesAsignadas: any = [];
  seriesAsignadasOld: any = [];
  isSubmitted: boolean = false;
  constructor(private estadoService: EstadoOficinasService, private localService: LocalService, private spinner: NgxSpinnerService, public formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService, private seriesService: SeriesService, private escritoriosService: EscritoriosService) { }

  async ngOnInit() {
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.customer = this.localService.getValue('customer');
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      this.estado = estado;
    })
    this.form = this.formBuilder.group({
      idEscritorio: new FormControl('', [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
      idEscritorioDuplicar: new FormControl(''),
      modo: new FormControl(0,),
    });
    await this.obtenerSeries()
    await this.obtenerEscritorio()
  }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
  async obtenerSeries() {
    this.spinner.show('escritorios-create-loading')
    try {
      const resp = await this.seriesService.obtenerSeriesPorOficina(this.customer.slug, this.estado.selectedIdOficina)

      if (resp.status) {
        this.series = resp.data;
        this.seriesSelect = resp.data.map((serie: any) => {
          return {
            ...serie,
            activo: true
          }
        });
      } else {
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener el listado de series');
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener el listado de series');
    }
    this.spinner.hide('escritorios-create-loading')
  }
  async obtenerEscritorio(fromDetalle = false, idEscritorio = "") {
    // fromDetalle, flag para definir si es para la carga inicial o para obtener el detalle de un escritorio en el listado de escritorios a copiar
    //idEscritorio, opcional, se refiere al id que se usará para obtener el detalle
    this.spinner.show('escritorios-create-loading')
    try {
      const resp = await this.escritoriosService.obtenerEscritorio(this.customer.slug, this.estado.selectedIdOficina, fromDetalle ? idEscritorio : this.data.id)
      if (resp['status']) {
        if (!fromDetalle) {
          //Se ejecuta en el proceso normal, es decir cuando carga inicialmente el componente, asigna las series que trae del backend
          if (resp.data.length > 0) {
            this.form.patchValue({
              modo: resp.data[0].modo,
              idEscritorio: resp.data[0].idEscritorio
            });
            const jsonSerie = JSON.parse(resp.data[0].jsonSerie)
            jsonSerie.forEach((serie: any) => {
              const selectedSerie = this.seriesSelect.find((serieGeneral: any) => serieGeneral.id == serie.IdSerie)
              if (selectedSerie) {
                if (resp.data[0].modo == '1') {
                  this.seriesAsignadas.push({ idSerie: serie.IdSerie, activo: true, serie: selectedSerie.valor, prioridad: serie.Prioridad, alternado: serie.Alterna, edit: true });
                  this.seriesAsignadasOld.push({ idSerie: serie.IdSerie, activo: true, serie: selectedSerie.valor, prioridad: serie.Prioridad, alternado: serie.Alterna, edit: true });
                } else {
                  this.seriesAsignadas.push({ idSerie: serie.IdSerie, activo: true, serie: selectedSerie.valor, prioridad: serie.Prioridad, alternado: 1, edit: true });
                  this.seriesAsignadasOld.push({ idSerie: serie.IdSerie, activo: true, serie: selectedSerie.valor, prioridad: serie.Prioridad, alternado: 1, edit: true });
                }
                selectedSerie.activo = false
              }
            })
            this.seriesAsignadas.sort((a: any, b: any) => {
              return a['prioridad'] < b['prioridad'] ? -1 : 1;
            })
          } else {
            this.form.patchValue({
              modo: this.data.valor == 'Rebalse' ? 0 : this.data.valor == 'Alternado' ? 1 : 2,
              idEscritorio: this.data.id
            });
          }
        } else {
          //Se ejecuta cuando se necesita obtener el detalle de un escritorio en el listado para duplicar
          const escritorioAEditar = this.escritorios.find((escritorio: any) => (escritorio.id == idEscritorio));
          if (escritorioAEditar) {
            let series: any = [];
            JSON.parse(resp.data[0].jsonSerie).forEach((serieEsc: any) => {
              const selectedSerie = this.series.find((serie: any) => serie.id == serieEsc.IdSerie)
              if (selectedSerie) {
                if (resp.data[0].modo == '1') {
                  series.push({ idSerie: serieEsc.IdSerie, activo: true, serie: selectedSerie.valor, prioridad: serieEsc.Prioridad, alternado: serieEsc.Alterna });
                } else {
                  series.push({ idSerie: serieEsc.IdSerie, activo: true, serie: selectedSerie.valor, prioridad: serieEsc.Prioridad, alternado: 1 });
                }
              }
            })
            series.sort((a: any, b: any) => {
              return a['prioridad'] < b['prioridad'] ? -1 : 1;
            })
            escritorioAEditar.series = series;
          }
        }
      } else {
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener el escritorio');
        this.volver();
      }
    } catch (e: any) {
      console.log(e);
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener el escritorio');
      this.volver();
    }
    this.spinner.hide('escritorios-create-loading')
  }
  handleSelectSerie(e: any) {
    const selectedSerie = this.seriesSelect.find((serie: any) => serie.id == e.target.value);
    if (selectedSerie) {
      this.seriesAsignadas.push({ idSerie: e.target.value, activo: true, serie: selectedSerie.valor, alternado: 1 });
      selectedSerie.activo = false
    }
  }
  changeSelectedSerie(id: any, activar = false) {
    const selectedSerie = this.seriesAsignadas.find((serie: any) => serie.idSerie == id);
    const isNewSerie = this.seriesAsignadasOld.find((serie: any) => serie.idSerie == id);
    if (selectedSerie && !isUndefined(isNewSerie)) {
      selectedSerie.activo = activar;
    }
    if (selectedSerie && isUndefined(isNewSerie)) {
      const indexSerie = this.seriesAsignadas.indexOf(selectedSerie);
      this.seriesAsignadas.splice(indexSerie, 1);
      const selectedSerieToAdd = this.seriesSelect.find((serie: any) => serie.id == id);
      selectedSerieToAdd.activo = true;
    }
  }
  handleDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.seriesAsignadas, event.previousIndex, event.currentIndex);
  }
  async limpiarSeriesAsignadas() {
    const resp = await this.sweetAlertService.swalConfirm('¿Desea limpiar las series asignadas?')
    if (resp) {
      const seriesAsignadasIds: any[] = this.seriesAsignadas.map((serie: any) => (serie.idSerie))
      this.seriesSelect = this.seriesSelect.map((serie: any) => {
        if (!seriesAsignadasIds.includes(serie.id)) {
          return {
            ...serie,
            activo: true
          }
        }
        return serie
      })
      this.seriesAsignadas = cloneDeep(this.seriesAsignadasOld);
      this.seriesAsignadas.sort((a: any, b: any) => {
        return a['prioridad'] < b['prioridad'] ? -1 : 1;
      })
    }
  }
  renderSeriesSelect() {
    return this.seriesSelect.filter((serie: any) => (serie.activo));
  }
  validAlternado() {
    let isValid = false
    const regex = new RegExp('^(0|[1-9][0-9]*)$')
    isValid = this.seriesAsignadas.every((serie: any) => serie.alternado && regex.exec(serie.alternado) != null)
    //console.log(isValid);
    if (!isValid) {
      this.sweetAlertService.toastConfirm('error', `Existen series donde el alternado posee un valor incorrecto, debe ser un número natural`);
    }
    return isValid;
  }
  handleAlternado(event: any, serie: any) {
    const regex = new RegExp('^(0|[1-9][0-9]*)$')
    if (regex.exec(event.target.value) != null) {
      this.sweetAlertService.swalClose()
      const selectedSerie = this.seriesAsignadas.find((element: any) => element.idSerie == serie.idSerie);
      if (selectedSerie) {
        selectedSerie.alternado = event.target.value
      }
    } else {
      this.sweetAlertService.toastConfirm('error', `Debes ingresar un número válido en el alternado para la serie ${serie.serie}`);
    }

  }
  volver(reloadData = false) {
    this.isSubmitted = false;
    if (this.seCopiaronEscritorios) {
      this.onVolver.emit(true)
    } else {
      this.onVolver.emit(reloadData)
    }

  }
  async onSubmit(duplicate = false, copy = false, idEscritorio = "") {
    //duplicate, define si se va a duplicar o no
    //copy, define si se va a copiar o no
    //idEscritorio, el id que se va a copiar
    this.isSubmitted = true;

    if (this.form.invalid || this.form.get('modo')?.value == '1' && !this.validAlternado() || isEmpty(this.seriesAsignadas) || duplicate == true && this.form.get('idEscritorioDuplicar')?.value == "") {
      if (this.form.invalid) {
        this.handleErrors()
      }
      if (isEmpty(this.seriesAsignadas)) {
        this.sweetAlertService.toastConfirm('error', `Debes ingresar las series que estarán asignadas a este escritorio`);
      }
      //Si se va a duplicar, se valida que el campo idEscritorioDuplicar no esté vacio
      if (duplicate == true && this.form.get('idEscritorioDuplicar')?.value == "") {
        this.sweetAlertService.toastConfirm('error', `Debes ingresar el nuevo número del escritorio a crear`);
      }
    } else {
      this.spinner.show('escritorios-create-loading')
      const data: any = {
        idUser: this.localService.getValue('usuario').idUsuario,
        idOficina: this.estado.selectedIdOficina,
        idEscritorio: parseInt(this.form.get('idEscritorio')?.value),
        modo: this.form.get('modo')?.value,
        jsonSeries: JSON.stringify(this.mapJsonSeries()),
        data: ""
      }
      try {
        let resp: any
        if (duplicate) {
          //Proceso de duplicar, se cambia el valor de idEscritorio y se llama al api de agregar
          const idEscritorioDuplicar = this.form.get('idEscritorioDuplicar').value
          const yaExiste = this.escritorios.find((escritorio: any) => escritorio.id == idEscritorioDuplicar)
          if (yaExiste || this.data.id == idEscritorioDuplicar) {
            resp = { status: false, msgErrorValidacion: `El Nro de escritorio a crear debe ser uno nuevo, este ya existe.` }
          } else {
            data.idEscritorio = this.form.get('idEscritorioDuplicar').value;
            resp = await this.escritoriosService.agregarEscritorio(
              this.localService.getValue('customer').slug,
              data
            );
          }
        } else {
          if (copy) {
            //Proceso de copiar, se cambia el valor de idEscritorio, para que se copien los valores de arriba en el idEscritorio seleccionado
            data.idEscritorio = idEscritorio
          }
          resp = await this.escritoriosService.editarEscritorio(
            this.localService.getValue('customer').slug,
            data
          );
        }
        if (resp['status'] && resp['data'][0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', `El escritorio se ha ${duplicate ? 'duplicado' : 'editado'} con éxito`);
          if (!copy) {
            this.volver(true);
          } else {
            await this.obtenerEscritorios()
            this.seCopiaronEscritorios = true;
          }
        } else {
          if (resp['msgErrorValidacion']) {
            this.sweetAlertService.toastConfirm('error', resp['msgErrorValidacion']);
          } else {
            this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al ${duplicate ? 'duplicar' : 'editar'} el escritorio  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
          }

        }
        this.spinner.hide("escritorios-create-loading");

      }
      catch (error: any) {
        //console.log(error);
        this.spinner.hide("escritorios-create-loading");
        this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al ${duplicate ? 'duplicar' : 'editar'} el escritorio`);
      }
    }
  }
  mapSeries() {
    let stringSeries: any;
    const seriesAsignadasFiltradas = this.seriesAsignadas.filter((serie: any) => serie.activo);
    seriesAsignadasFiltradas.forEach((serie: any, index: any) => {
      if (seriesAsignadasFiltradas.length != index + 1) {
        stringSeries = handleTexts(stringSeries, `${serie.idSerie},${index + 1},${this.form.get('modo')?.value == "1" ? serie.alternado : 1};`)
      } else {
        stringSeries = handleTexts(stringSeries, `${serie.idSerie},${index + 1},${this.form.get('modo')?.value == "1" ? serie.alternado : 1}`)
      }
    })
    return stringSeries
  }
  mapJsonSeries() {
    const seriesAsignadasFiltradas = this.seriesAsignadas.filter((serie: any) => serie.activo);
    return seriesAsignadasFiltradas.map((serie: any, index: any) => {
      return { IdSerie: serie.idSerie, Prioridad: index + 1, Alterna: this.form.get('modo')?.value == "1" ? serie.alternado : 1 }
    })
  }

  handleErrors() {
    let mensajeErrores: any
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          let error;
          if (keyError == 'required') {
            error = `El campo ${key} es requerido`
          }
          if (keyError == 'pattern' && key == 'idEscritorio') {
            error = `El campo Nro de escritorio debe ser un número natural`
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`
          } else {
            mensajeErrores = `\n${error}\n`
          }
        });
      }
    });
    this.sweetAlertService.toastConfirm('error', `No se ha podido actualizar el escritorio, debido a los siguientes errores:\n${mensajeErrores}`);
  }

  async irADuplicar() {
    this.duplicar = !this.duplicar;
    // this.form.patchValue({
    //   idEscritorio:''
    // });
    if (this.duplicar == true) {
      await this.obtenerEscritorios()
    }
  }
  async obtenerEscritorios() {
    this.spinner.show('escritorios-create-loading')
    try {
      const resp: any = await this.escritoriosService.obtenerEscritorios(this.customer.slug, this.estado.selectedIdOficina);
      if (resp.status) {
        this.escritorios = resp.data.filter((escritorio: any) => (escritorio.id != this.data.id));
        this.escritorios = this.escritorios.map((escritorio: any) => ({ ...escritorio, ocultar: false }))
      } else {
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener los escritorios');
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener los escritorios');
    }
    this.spinner.hide('escritorios-create-loading')
  }

  async handleCopiarEscritorio(escritorio: any) {
    const alert = await this.sweetAlertService.swalConfirm(`¿Desea copiar la información al escritorio N° ${escritorio.id}`);
    if (alert) {
      this.onSubmit(false, true, escritorio.id);
    }
  }

  async mostrarDetallesEscritorio(escritorio: any) {
    if (escritorio.ocultar == false) {
      if (isUndefined(escritorio.series)) {
        await this.obtenerEscritorio(true, escritorio.id)
      } else {
        escritorio.ocultar = true;
      }
    } else {
      escritorio.ocultar = false
      await this.obtenerEscritorio(true, escritorio.id)
    }
  }


}
