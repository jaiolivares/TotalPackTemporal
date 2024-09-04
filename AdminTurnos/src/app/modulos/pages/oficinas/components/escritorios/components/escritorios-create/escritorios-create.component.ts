import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
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
import { isEmpty } from 'lodash';
import { EscritoriosService } from 'src/app/core/services/http/oficina/escritorios.service';

@Component({
  selector: 'app-escritorios-create',
  templateUrl: './escritorios-create.component.html',
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
export class EscritoriosCreateComponent implements OnInit, OnDestroy {
  @Output() onVolver: EventEmitter<any> = new EventEmitter()
  estadoSubscription = new Subscription()
  estado: any;
  customer: any;
  form: any;
  seriesSelect: any = [];
  series: any = [];
  seriesAsignadas: any = [];
  isSubmitted: boolean = false;
  constructor(private estadoService: EstadoOficinasService, private localService: LocalService, private spinner: NgxSpinnerService, public formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService, private seriesService: SeriesService, private escritoriosService: EscritoriosService) { }

  async ngOnInit() {
    this.customer = this.localService.getValue('customer');
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      this.estado = estado;
    })
    this.form = this.formBuilder.group({
      idEscritorio: new FormControl('', [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
      modo: new FormControl(0,),
    });
    await this.obtenerSeries()
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
  handleSelectSerie(e: any) {
    const selectedSerie = this.seriesSelect.find((serie: any) => serie.id == e.target.value);
    if (selectedSerie) {
      this.seriesAsignadas.push({ idSerie: e.target.value, activo: true, serie: selectedSerie.valor, alternado: 1 });
      selectedSerie.activo = false
    }
  }
  deleteSelectedSerie(id: any) {
    const selectedSerie = this.seriesAsignadas.find((serie: any) => serie.idSerie == id);
    if (selectedSerie) {
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
      this.seriesAsignadas = [];
      this.seriesSelect = this.seriesSelect.map((serie: any) => ({ ...serie, activo: true }))
    }
  }
  renderSeriesSelect() {
    return this.seriesSelect.filter((serie: any) => (serie.activo));
  }
  validAlternado() {
    let isValid = false
    const regex = new RegExp('^(0|[1-9][0-9]*)$')
    isValid = this.seriesAsignadas.every((serie: any) => serie.alternado && regex.exec(serie.alternado) != null)
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
    this.onVolver.emit(reloadData)
  }
  async onSubmit() {
    this.isSubmitted = true;
    if (this.form.invalid || this.form.get('modo')?.value == '1' && !this.validAlternado() || isEmpty(this.seriesAsignadas)) {
      if (this.form.invalid) {
        this.handleErrors()
      }
      if (isEmpty(this.seriesAsignadas)) {
        this.sweetAlertService.toastConfirm('error', `Debes ingresar las series que estarán asignadas a este escritorio`);
      }
    } else {
      this.spinner.show('escritorios-create-loading')

      const data = {
        idUser: this.localService.getValue('usuario').idUsuario,
        idOficina: this.estado.selectedIdOficina,
        idEscritorio: this.form.get('idEscritorio')?.value,
        modo: this.form.get('modo')?.value,
        jsonSeries: JSON.stringify(this.mapJsonSeries()),
        data: ""
      }
      //console.log(data);
      try {
        const resp: any = await this.escritoriosService.agregarEscritorio(
          this.localService.getValue('customer').slug,
          data
        );
        if (resp['status'] && resp['data'][0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'El escritorio se ha agregado con éxito');
          this.volver(true);
        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al agregar el escritorio ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.spinner.hide("escritorios-create-loading");

      }
      catch (error: any) {
        this.spinner.hide("escritorios-create-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al agregar el escritorio');
      }
    }
  }
  mapSeries() {
    let stringSeries: any;
    this.seriesAsignadas.forEach((serie: any, index: any) => {
      if (this.seriesAsignadas.length != index + 1) {
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
    this.sweetAlertService.toastConfirm('error', `No se ha podido crear el escritorio, debido a los siguientes errores:\n${mensajeErrores}`);
  }
}
