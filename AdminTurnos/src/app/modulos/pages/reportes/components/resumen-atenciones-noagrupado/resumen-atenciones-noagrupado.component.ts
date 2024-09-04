import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { ReportesService } from 'src/app/core/services/http/Reportes/reportes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AtencionNoAgrupadoService } from 'src/app/core/services/utils/excelService/atencion-no-agrupado.service';

@Component({
  selector: 'app-atenciones-por-categoria',
  templateUrl: './resumen-atenciones-noagrupado.component.html',
  styleUrls: ['./resumen-atenciones-noagrupado.component.css'],
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
export class ResumenAtencionesNoagrupadoComponent implements OnInit {
  public form!: FormGroup;
  public officeIds: any = [];
  public seriesIds: any = [];
  public respSerie: any = []
  public user: any;
  public respReporte: any[] = [];
  public datosAgrupadosParaMostrar: any[] | undefined;
  public totalQAtendidas: number = 0;
  public anyError = 0;
  public tituloEncabezado: string = '';
  public horas: any;
  public filtroOficina: string = ''; //captura el valor del input de filtro de oficinas
  public oficinasFiltradas: any[] = [];
  public filtroSerie: string = ''; //captura el valor del input de filtro de series
  public seriesFiltradas: any[] = [];
  public error:any
  public submitted = false;
  isCollapsed = false; // Estado inicial de la sección
  listadoOficinas: any[] = [];
  @Input() listaOficce: any[] = [];
  @Input() listadoSeries: any[] = [];
  bsConfig: Partial<BsDatepickerConfig>;
  horasFin: any;
  public selectNombreOficina: any;
  public selectNombreSerie: any;

  constructor(
    private fb: FormBuilder, // Se corrigió el uso de 'formBuilder'& private
    private excelService: AtencionNoAgrupadoService,
    private spinner: NgxSpinnerService,
    private reporteService: ReportesService,
    private localService: LocalService,
    private sweetAlert: SweetAlertService,
  ) {
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

  ngOnInit(): void {
    this.form = this.fb.group({
      sidO: new FormArray([], [Validators.required]),
      sidS: new FormArray([], [Validators.required]),
      sDI: new FormControl('', [Validators.required]),
      sDF: new FormControl('', [Validators.required]),
      hhI: new FormControl('', [Validators.required]),
      hhF: new FormControl('', [Validators.required]),
      int: new FormControl('5', [Validators.required, Validators.min(1), Validators.max(60)]),
      lim: new FormControl('60', [Validators.required, Validators.min(1), Validators.max(240)]),
      tipo: new FormControl('', []),
    });


    this.obtenerSeries();
    this.getHoras();
    // this.actualizarHoraFin();
    // Inicializar los valores de oficinas y series seleccionadas
    this.seriesFiltradas = this.listadoSeries;
    // Suscribirse a los cambios de los controles de hora
    this.form.get('hhI')?.valueChanges.subscribe(() => this.onTimeChange());
    this.form.get('hhF')?.valueChanges.subscribe(() => this.onTimeChange());
    // Agregar los controles de oficinas y series al FormArray
    this.officeIds.forEach(() => this.oficinas.push(new FormControl(false)));
    this.seriesIds.forEach(() => this.series.push(new FormControl(false)));
  }

  async obtenerOficinas(): Promise<any> {
    try {
      this.spinner.show("servicio-loading");
      const resp = await this.reporteService.reporteListaOficina(this.localService.getValue('customer').slug);
      if (resp.status) {
        this.spinner.hide("servicio-loading");
        this.listadoOficinas = resp.data; // Suponiendo que 'resp.data' contiene las oficinas
        this.oficinasFiltradas = this.listadoOficinas;
        this.officeIds = this.listadoOficinas.map((i: any) => i.oficina);
        // Crear un control para cada oficina. Inicialmente, ninguno está seleccionado
        const controls = this.officeIds.map(() => new FormControl(false));
        this.form.setControl('sidO', new FormArray(controls));

        return this.listadoOficinas; // Devuelve las oficinas obtenidas
      }
      return null;

    } catch (err) {
      console.error(err);
      return null;
    }
  }
  esAlMenosUnoSeleccionado(nomFromulario: string): boolean {
    const alMenosUnoEsTrue = this.form.get(nomFromulario)?.value.some((valor: boolean) => valor === true);
    return alMenosUnoEsTrue && this.submitted;
  }


  async obtenerSeries(): Promise<any> {
    try {
      this.seriesIds = this.listadoSeries.map((serie: any) => serie.valor);
      this.respSerie = this.listadoSeries.map((serie: any) => serie);

    } catch (e: any) {
      this.anyError++;
    }
  }


  // Validar si es un string o un número
  esString(data: any): boolean {
    return typeof data === 'string';
  }
  esNumero(valor: any): boolean {
    return typeof valor === 'number';
  }


  // filtro para buscar oficinas y series
  filtrarOficinas(evento: any) {
    this.filtroOficina = evento.target.value;
    if (!this.filtroOficina) {
      this.oficinasFiltradas = this.listadoOficinas;

    } else {
      this.oficinasFiltradas = this.listadoOficinas.filter(oficina =>
        oficina.oficina.toLowerCase().includes(this.filtroOficina.toLowerCase())
      );
    }
  }

  filtrarSeries(evento: any) {
    this.filtroSerie = evento.target.value;
    if (!this.filtroSerie) {
      this.seriesFiltradas = this.listadoSeries;

    } else {
      this.seriesFiltradas = this.listadoSeries.filter(serie =>
        serie.valor.toLowerCase().includes(this.filtroSerie.toLowerCase())
      );
    }
  }

  //retorno de objeto FormArray
  get oficinas(): FormArray {
    return this.form.get('sidO') as FormArray;
  }
  get series(): FormArray {
    return this.form.get('sidS') as FormArray;
  }

  // Obtener la lista de oficinas y series seleccionadas
  // Si todas las oficinas y/o series están seleccionadas, usa el asterisco
  getSelectedOffices() {
    let selectOficinaIds = this.form.value.sidO
      .map((checked: any, i: any) => checked ? this.officeIds[i] : null)
      .filter((v: any) => v !== null);
    this.selectNombreOficina = selectOficinaIds.join(' / ');
    if (selectOficinaIds.length === this.officeIds.length) {
      return '*';
    }
    return selectOficinaIds.join(',');
  }

  getSelectedSeries() {
    let selectSerieIds = this.form.value.sidS
      .map((checked: any, i: any) => checked ? this.seriesIds[i] : null)
      .filter((v: any) => v !== null);
      this.selectNombreSerie = selectSerieIds.join(' / ');
    if (selectSerieIds.length === this.seriesIds.length) {
      return '*';
    }
    return selectSerieIds.join(',');
  }

  // Esta función se llama cuando la casilla de verificación "Seleccionar Todas" cambia
  SeleccionarTodas(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    this.oficinas.controls.forEach((control: AbstractControl) => {
      (control as FormControl).setValue(isChecked);
    });
  }
  SeleccionarTodasSeries(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    this.series.controls.forEach((control: AbstractControl) => {
      (control as FormControl).setValue(isChecked);
    });
  }


  // Esta función se llama cuando cualquier casilla de verificación  cambia
  // Verifica que el control existe antes de intentar usar `setValue` y
  // Comprueba si todos los campos están seleccionadas para actualizar la casilla de "Seleccionar Todas"
  OficinaChange(index: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    if (this.oficinas.at(index)) {
      this.oficinas.at(index).setValue(isChecked);


      const allSelected = this.oficinas.value.every((value: boolean) => value);
      this.form.get('allSelected')?.setValue(allSelected, { emitEvent: false });
    } else {
      console.error('Control indice' + index + ' no existe.');
    }
  }
  serieChange(index: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    if (this.series.at(index)) {
      this.series.at(index).setValue(isChecked);

      // Comprueba si todas las oficinas están seleccionadas para actualizar la casilla de "Seleccionar Todas"
      const allSelected = this.series.value.every((value: boolean) => value);
      this.form.get('allSelected')?.setValue(allSelected, { emitEvent: false });
    } else {
      console.error('Control indice' + index + ' no existe.');
    }
  }

  //manejo de horas y tiempo
  selectFecha(e: any) {
    this.form.patchValue({
      sDI: this.formatDate(e[0]),
      sDF: this.formatDate(e[1])
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


  formatHoras(hora: any) {
    const horas: any = [];
    for (let i = 0; i <= 24; i++) {
      horas.push({ valor: i + ":00", time: i });
    }
    return horas;
  }

  actualizarHoraFin() {

    const horaInicio = this.formatHoras(this.form.get('hhI')?.value/60 );

    const indexHoraInicio = this.horas.findIndex((hora: { time: any; }) => hora.time === horaInicio);
    if(indexHoraInicio >= 0) {
      this.horasFin = this.horas.slice(indexHoraInicio + 1);
    }

  }

  onTimeChange() {
    const horaInicio = this.form.get('hhI')?.value/60;
    const horaFin = this.form.get('hhF')?.value/60;

    if (horaInicio && horaFin && horaInicio >= horaFin) {
      this.form.get('hhF')?.setErrors({ 'invalidRange': true });
      this.error =  this.sweetAlert.swalInfo('Error', 'La hora de inicio debe ser menor a la hora de fin')
    } else {
      this.form.get('hhF')?.setErrors(null);
    }
  }

  // Esta función se llama cuando cualquier casilla de verificación de serie cambia
  private getIdsSeleccionados(valoresSeleccionados: string, lista: any[]): any {
    return valoresSeleccionados.split(',').map((valorSeleccionado: string) => {
      const seleccionado = lista.find((item: { valor: string; }) => item.valor === valorSeleccionado);
      return seleccionado ? seleccionado.id : null;
    }).filter((id: number | null) => id !== null);
  }

  getIdsOficinaSeleccionados(valoresSeleccionados: string, lista: any[]): any {
    return valoresSeleccionados.split(',').map((valorSeleccionado: string) => {
      const seleccionado = lista.find((item: { oficina: string; }) => item.oficina === valorSeleccionado);
      return seleccionado ? seleccionado.idOficina : null;
    }).filter((id: number | null) => id !== null);
  }

  // Encuentra el primer objeto con 'SERIE' y actualiza el títuloEncabezado
  actualizarTituloEncabezado() {
    const serie = this.respReporte.find(item => item.rngtxt === 'SERIE');
    if (serie) {
      this.tituloEncabezado = `${serie.qAteNOfi} - ${serie.qAteTOL}`;
    }
  }

  async obtenerReporte():Promise<any> {
    this.submitted = true;
    if (this.form.valid) {
      this.spinner.show("servicio-loading");
      const customerSlug = this.localService.getValue('customer').slug;
      this.user = this.localService.getValue('usuario').idUsuario;

      const selectedOffices = this.getSelectedOffices();
      const selectedSeries = this.getSelectedSeries();

      const idsSeleccionadosOficinas = selectedOffices === '*' ? '*'
        : this.getIdsOficinaSeleccionados(selectedOffices, this.listadoOficinas).join(',');
        if (idsSeleccionadosOficinas === '') {
          this.spinner.hide("servicio-loading");
          return this.esAlMenosUnoSeleccionado
        }
      const idsSeleccionadosSeries = selectedSeries === '*' ? '*'
        : this.getIdsSeleccionados(selectedSeries, this.respSerie).join(',');
        if (idsSeleccionadosSeries === '') {
          this.spinner.hide("servicio-loading");
          return this.esAlMenosUnoSeleccionado
        }
      const formValues = this.form.value;
      const data = {
        "slug": customerSlug,
        "idUsuario": this.user,
        "listIdOficina": idsSeleccionadosOficinas,
        "listIdSerie": idsSeleccionadosSeries,
        "fechaInicio": formValues.sDI,
        "fechaFin": formValues.sDF,
        "horaInicio": formValues.hhI/60,
        "horaFin": formValues.hhF/60,
        "intervalo": formValues.int,
        "limite": formValues.lim,
        "tipo": "R"
      };
      let report = await this.reporteService.reporteAtencionNoAgrupado(data);
      this.spinner.hide("servicio-loading");
      if (report.status) {
        this.respReporte = report.data;
        if (this.respReporte.length > 0) {
          this.isCollapsed = true;
        }
        // this.agruparDatosPorRango();
        this.actualizarTituloEncabezado();
        // this.calcularTotalAtenciones();
      } else {
        this.sweetAlert.swalError('Error', 'No se pudo obtener el reporte', '');
      }
    }
    else {
      this.handleErrors();
    }
  }

  // agruparDatosPorRango() {
  //   let datosAgrupados: { [key: string]: any } = {};

  //   for (let data of this.respReporte) {
  //     if (!datosAgrupados[data.rngtxt]) {
  //       datosAgrupados[data.rngtxt] = { ...data, qAteNOfi: data.qAteNOfi || 0 };
  //     } else {
  //       datosAgrupados[data.rngtxt].qAteNOfi += data.qAteNOfi || 0;

  //     }
  //   }

  //   this.datosAgrupadosParaMostrar = Object.values(datosAgrupados);
  // }


  exportExcel() {
    const data = {
      "listIdOficina": this.selectNombreOficina,
      "listIdSerie": this.selectNombreSerie,
      "fechaInicio": this.form.value.sDI,
      "fechaFin": this.form.value.sDF,
      "horaInicio": this.form.value.hhI / 60,
      "horaFin": this.form.value.hhF / 60,
      "intervalo": this.form.value.int,
      "limite": this.form.value.lim
    };
    this.excelService.setCamposFiltrados(data);
    this.excelService.download(this.respReporte);
  }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (key == 'sidO' && keyError == 'required') {
            error = `El campo oficinas es requerido`;
          }
          if (key == 'sidS' && keyError == 'required') {
            error = `El campo series es requerido`;
          }
          if (key == 'sDI' && keyError == 'required') {
            error = `El campo fecha de inicio es requerido`;
          }
          if (key == 'sDF' && keyError == 'required') {
            error = `El campo fecha final es requerido`;
          }
          if (key == 'hhI' && keyError == 'required') {
            error = `El campo hora de inicio es requerido`;
          }
          if (key == 'hhF' && keyError == 'required') {
            error = `El campo hora final es requerido`;
          }
          if (key == 'int' && keyError == 'required') {
            error = `El campo intervalo es requerido`;
          }
          if (key == 'int' && (keyError == 'min' || keyError == 'max')) {
            error = `El campo intervalo debe ser entre 1 y 60`;
          }
          if (key == 'lim' && keyError == 'required') {
            error = `El campo limite es requerido`;
          }
          if (key == 'lim' && (keyError == 'min' || keyError == 'max')) {
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
    this.sweetAlert.toastConfirm(
      'error',
      `Error al consultar datos, debido a los siguientes errores:\n${mensajeErrores}`
    );
  }
  // Manejar el envío del formulario
  submit() {
    this.submitted = true;
    this.obtenerReporte();
  }

  // Este método podría ser para manejar la selección de fecha en el formulario
  dateFecha(e: Event) {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
  }
}
