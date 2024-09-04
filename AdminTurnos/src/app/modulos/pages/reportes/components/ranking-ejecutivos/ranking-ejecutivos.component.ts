import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { ReportesService } from 'src/app/core/services/http/Reportes/reportes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { saveAs } from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { RankingEjecutivoService } from 'src/app/core/services/utils/excelService/ranking-ejecutivo.service';

@Component({
  selector: 'app-ranking-ejecutivos',
  templateUrl: './ranking-ejecutivos.component.html',
  styleUrls: ['./ranking-ejecutivos.component.css'],
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
export class RankingEjecutivosComponent implements OnInit {
  public ofis: any[] = [];
  public series: any[] = [];
  public respReporte: any[] = [];
  public totalQAtendidas: number = 0;
  isCollapsed = false; // Estado inicial de la sección
  public submitted = false;
  public nombreOficina!: string;
  form!: FormGroup;
  @Input() oficinas: any[] = [];

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    public formBuilder: FormBuilder,
    private reporteService: ReportesService,
    private localService: LocalService,
    private sweetAlert: SweetAlertService,
    private spinner: NgxSpinnerService,
    private excelService: RankingEjecutivoService
  ) {
    this.bsConfig = Object.assign({},
      {
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        displayOneMonthRange: true,
        displayMonths: 1,
        locale: 'es',
      });
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      id: new FormControl('', [Validators.required]), // id oficina
      idS: new FormControl('',),// IdSerie
      fechaIni: new FormControl('', [Validators.required]), // fecha inicio
      fechaFin: new FormControl('', [Validators.required]), // fecha fin
      tmin: new FormControl('60', [Validators.required, Validators.min(1), Validators.max(60)]), // tiempo mínimo, esto es lo mínimo que debe durar la atención en segundos
      jornada: new FormControl('24', [Validators.required, Validators.min(1), Validators.max(24)]), // tiempo de jornada en horas
    });

  }

  async obtenerReporte(): Promise<any> {
    this.submitted = true;
    if (this.form.valid) {
      this.spinner.show("servicio-loading");
      const customerSlug = this.localService.getValue('customer').slug;
      const formValues = this.form.value;
      const valorSeleccionado = this.form.get('id')?.value;
      const oficinaSeleccionada = this.oficinas.find(oficina => oficina.valor === valorSeleccionado);
      this.nombreOficina = oficinaSeleccionada.valor;
      const idSeleccionado = oficinaSeleccionada ? oficinaSeleccionada.id : null;

      const data = {
        "slug": customerSlug,
        "idOficina": idSeleccionado,
        // "idSerie": formValues.idS,
        "idSerie": null, // idSerie, se agrega en duro porque no se requiere completar 
        "fechaInicio": formValues.fechaIni,
        "fechaFin": formValues.fechaFin,
        "tiempoMinimo": formValues.tmin,
        "tiempoJornada": formValues.jornada
      };
      let report = await this.reporteService.reporteRankingEjecutivo(data);
      this.spinner.hide("servicio-loading");
      if (report.status) {
        this.respReporte = report.data;
        if (this.respReporte.length > 0) {
          this.isCollapsed = true;
        }
        this.calcularTotalAtenciones();
        return;
      } else {
        this.sweetAlert.swalError('Error', 'No se pudo obtener el reporte', 'warning');
        return;
      }

    } else {
      this.handleErrors();
    }
  }
  selectFecha(e: any) {
    this.form.patchValue({
      fechaIni: this.formatDate(e[0]),
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

  calcularTotalAtenciones() {
    this.totalQAtendidas = this.respReporte.reduce((acumulado, actual) => acumulado + actual.qAte, 0);
  }

   segundosAMinutos(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.round(segundos % 60);

    const minutosStr = minutos < 10 ? `0${minutos}` : `${minutos}`;
    const segundosStr = segundosRestantes < 10 ? `0${segundosRestantes}` : `${segundosRestantes}`;

    return `${minutosStr}:${segundosStr}`;
  }

  // limpiarTexto(texto: any): any {
  //   if (typeof texto === 'string') {
  //     // Remueve tildes y caracteres especiales usando una expresión regular
  //     return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  //   }
  //   return texto;
  // }

  exportExcel() {
    const data = {
      "idOficina": this.nombreOficina,
      "fechaInicio": this.form.value.fechaIni,
      "fechaFin": this.form.value.fechaFin,
      "tiempoMinimo": this.form.value.tmin,
      "tiempoJornada": this.form.value.jornada
    };
    this.excelService.setCamposFiltrados(data);
    this.excelService.download(this.respReporte);
  }

  // forceUtf8(value: string): string {
  //   return unescape(encodeURIComponent(value));
  // }

  // exportDataToExcel(data: string, filename: string): void {
  //   const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
  //   saveAs(blob, filename);
  // }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (key == 'id' && keyError == 'required') {
            error = `El campo oficinas es requerido`;
          }
          if (key == 'idS' && keyError == 'required') {
            error = `El campo series es requerido`;
          }
          if (key == 'fechaIni' && keyError == 'required') {
            error = `El campo rango de fecha es requerido`;
          }
          if (key == 'fechaFin' && keyError == 'required') {
            error = `El campo rango de fecha es requerido`;
          }
          if (key == 'tmin' && keyError == 'required') {
            error = `El campo tiempo mínimo es requerido`;
          }
          if (key == 'tmin' && (keyError == 'min' || keyError == 'max')) {
            error = `El campo tiempo mínimo debe ser entre 1 y 60`;
          }
          if (key == 'jornada' && keyError == 'required' ) {
            error = `El campo jornada es requerido`;
          }
          if (key == 'jornada' && (keyError == 'min' || keyError == 'max')) {
            error = `El campo jornada debe ser entre 1 y 24`;
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

  submit() {
    this.obtenerReporte();
    
  }


  dateFecha(e: any) {
    console.log(e.target.value);

  }

}// fin de la clase
