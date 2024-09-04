import { Component, Input, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportesService } from 'src/app/core/services/http/Reportes/reportes.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { saveAs } from 'file-saver';
import { EsperaAgrupadoService } from 'src/app/core/services/utils/excelService/espera-agrupado.service';

@Component({
  selector: 'app-resumen-espera-agrupado',
  templateUrl: './resumen-espera-agrupado.component.html',
  styleUrls: ['./resumen-espera-agrupado.component.css'],
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

export class ResumenEsperaAgrupadoComponent implements OnInit {

  bsConfig: Partial<BsDatepickerConfig>;
  public error: any
  public isCollapsed = false; // Estado inicial de la sección
  public submitted = false;
  nombreOficinas: any // Lista de oficinas seleccionadas
  nombresSeries: any // Lista de serie seleccionadas
  nombreSerie: any // Lista de serie seleccionadas
  constructor(
    public formBuilder: FormBuilder,
    private reporteService: ReportesService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private localSecureService: LocalService,
    private localeService: BsLocaleService,
    private excelService: EsperaAgrupadoService
  ) {
    this.localeService.use('es')
    this.bsConfig = Object.assign({},
      {
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        displayOneMonthRange: true,
        displayMonths: 1,
        locale: 'es',
      });
    this.obtenerOficinas();
  }

  @Input() oficinas: any[] = [];
  @Input() series: any[] = [];
  searchOficina!: string
  searchSerie!: string
  rangoFechas: any
  horas: any = [];
  reporte: any = [];
  form!: FormGroup

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      listIdOficina: new FormControl('', [Validators.required]),
      listIdSerie: new FormControl('', [Validators.required]),
      fechaInicio: new FormControl('', [Validators.required]),
      fechaFin: new FormControl('', [Validators.required]),
      horaInicio: new FormControl('', [Validators.required]),
      horaFin: new FormControl('', [Validators.required]),
      intervalo: new FormControl('5', [Validators.required, Validators.min(1), Validators.max(60)]),
      limite: new FormControl('60', [Validators.required, Validators.min(1), Validators.max(240)]),
    });

    this.getHoras();
    this.form.get('horaInicio')?.valueChanges.subscribe(() => this.onTimeChange());
    this.form.get('horaFin')?.valueChanges.subscribe(() => this.onTimeChange());
  }

  
  async resumenEspera() {
    this.submitted = true;
    if (this.form.valid) {
      this.spinner.show("servicio-loading");
      this.form.value.idu = this.localSecureService.getValue('usuario').idUsuario;
      this.form.value.slug = this.localSecureService.getValue('customer').slug;
      console.log(this.form.value);
      const resp = await this.reporteService.reporteEsperaAgrupado(this.form.value)
      this.spinner.hide("servicio-loading");
      this.obtenerNombreOficina(this.form.value.listIdOficina);
      this.obtenerNombreSerie(this.form.value.listIdSerie);
      if (resp.status) {
        this.reporte = resp.data
        if (this.reporte.length > 0) {
          this.isCollapsed = true;
        }
      } else {
        this.sweetAlertService.toastConfirm('error', '¡Error al obtener resumen!');
      }

    } else {
      this.handleErrors();
    }
  }

  async obtenerOficinas() {
    this.spinner.show("servicio-loading");
    const resp = await this.reporteService.reporteListaOficina(this.localSecureService.getValue('customer').slug)
    this.spinner.hide("servicio-loading");
    if (resp.status) {
      this.oficinas = resp.data
    } else {
      this.sweetAlertService.toastConfirm('error', '¡Error al obtener oficinas!');
    }
  }
  selecteIdOficina(event: any, oficinaId: number) {
    const selectedOficinas = this.form.get('listIdOficina') as FormControl;
    const currentIds = selectedOficinas.value ? selectedOficinas.value.split(',').map((id: any) => +id) : [];
    if (event.target.checked) {
      currentIds.push(oficinaId);
    } else {
      const index = currentIds.indexOf(oficinaId);
      if (index !== -1) {
        currentIds.splice(index, 1);
      }
    }
    selectedOficinas.setValue(currentIds.join(','));
  }

  obtenerNombreOficina(ids: string) {
    const arrayIds = ids.split(',').map(id => parseInt(id.trim()));

    const oficinasEncontradas = this.oficinas.filter(oficina => arrayIds.includes(oficina.idOficina));
    const nombreOficinasString = oficinasEncontradas.map(oficina => oficina.oficina);
    this.nombreOficinas = nombreOficinasString.join('/ ');
    return oficinasEncontradas;
  }
  

  selectTodasOficinas(e: any) {
    const checkboxes = document.querySelectorAll('.oficeCheck');
    let checked = e.target.checked;

    const selectedOficinas = this.form.get('listIdOficina') as FormControl;
    selectedOficinas.setValue('');

    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = checked;
      this.selecteIdOficina({ target: checkbox, preventDefault: () => { } }, checkbox.value);
    });
  }

  selecteIdSerie(event: any, serieId: number) {
    const selectedSeries = this.form.get('listIdSerie') as FormControl;
    const currentIds = selectedSeries.value ? selectedSeries.value.split(',').map((id: any) => +id) : [];
    if (event.target.checked) {
      currentIds.push(serieId);
    } else {
      const index = currentIds.indexOf(serieId);
      if (index !== -1) {
        currentIds.splice(index, 1);
      }
    }
    selectedSeries.setValue(currentIds.join(','));
  }

  obtenerNombreSerie(ids: any) {
    this.nombresSeries = this.series
    const arrayIds = ids.split(',').map((id: string) => parseInt(id.trim()));

    const seriesEncontradas = this.series.filter(serie => arrayIds.includes(serie.id));
    const nombreSeriesString = seriesEncontradas.map(serie => serie.valor);
    this.nombreSerie = nombreSeriesString.join(' / ');
    return;
  }
  selectTodasSeries(e: any) {
    const checkboxes = document.querySelectorAll('.serieCheck');
    let checked = e.target.checked;

    const selectedSeries = this.form.get('listIdSerie') as FormControl;
    selectedSeries.setValue('');

    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = checked;
      this.selecteIdSerie({ target: checkbox, preventDefault: () => { } }, checkbox.value);
    });
  }


  async tecleado(event: any, input: string) {
    if (input == "oficinas") {
      this.searchOficina = event.value;
    } else {
      this.searchSerie = event.value;
    }
  }

  selectFecha(e: any) {
    this.form.patchValue({
      fechaInicio: this.formatDate(e[0]),
      fechaFin: this.formatDate(e[1])
    })
  }

  formatDate(date: any) {
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString().padStart(2, '0');
    let day = d.getDate().toString().padStart(2, '0');
    let year = d.getFullYear();
    return [year, month, day].join('-');
  }


  getHoras() {
    this.horas = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 60) {
        const time = i * 60 + j;
        const valor = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
        this.horas.push({ valor, time });
      }
    }
  }
  onTimeChange() {
    const horaIni = this.form.get('horaInicio')?.value / 60;
    const horaF = this.form.get('horaFin')?.value / 60;

    if (horaIni && horaF && horaIni >= horaF) {
      this.form.get('horaFin')?.setErrors({ 'invalidRange': true });
      this.error = this.sweetAlertService.swalInfo('Error', 'La hora de inicio debe ser menor a la hora de fin')
    } else {
      this.form.get('horaFin')?.setErrors(null);
    }
  }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (key == 'listIdOficina' && keyError == 'required') {
            error = `El campo oficinas es requerido`;
          }
          if (key == 'listIdSerie' && keyError == 'required') {
            error = `El campo series es requerido`;
          }
          if (key == 'fechaInicio' && keyError == 'required') {
            error = `El campo fecha de inicio es requerido`;
          }
          if (key == 'fechaFin' && keyError == 'required') {
            error = `El campo fecha final es requerido`;
          }
          if (key == 'horaInicio' && keyError == 'required') {
            error = `El campo hora de inicio es requerido`;
          }
          if (key == 'horaFin' && keyError == 'required') {
            error = `El campo hora final es requerido`;
          }
          if (key == 'intervalo' && keyError == 'required') {
            error = `El campo intervalo es requerido`;
          }
          if (key == 'intervalo' && (keyError == 'min' || keyError == 'max')) {
            error = `El campo intervalo debe ser entre 1 y 60`;
          }
          if (key == 'limite' && keyError == 'required') {
            error = `El campo limite es requerido`;
          }
          if (key == 'limite' && (keyError == 'min' || keyError == 'max')) {
            error = `El campo limite debe ser entre 1 y 240`;
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`;
          } else {
            mensajeErrores = `\n${error}\n`;
          }
        });
      }
    });
    this.sweetAlertService.toastConfirm(
      'error',
      `Error al consultar datos, debido a los siguientes errores:\n${mensajeErrores}`
    );
  }


  exportarDataExcel() {
    const data = {
      "listIdOficina": this.nombreOficinas,
      "listIdSerie": this.nombreSerie,
      "fechaInicio": this.form.value.fechaInicio,
      "fechaFin": this.form.value.fechaFin,
      "horaInicio": this.form.value.horaInicio,
      "horaFin": this.form.value.horaFin,
      "intervalo": this.form.value.intervalo,
      "limite": this.form.value.limite
    };
    this.excelService.setCamposFiltrados(data);
    this.excelService.download(this.reporte);
    
  }

}
