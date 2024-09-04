import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { InformesService } from 'src/app/core/services/http/Informes/informes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import * as moment from "moment";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexLegend,
  ApexTitleSubtitle,
} from "ng-apexcharts";
import { data } from 'jquery';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { EsperaAgrupadoService } from 'src/app/core/services/utils/excelService/espera-agrupado.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

@Component({
  selector: 'app-analisis-demanda',
  templateUrl: './analisis-demanda.component.html',
  styleUrls: ['./analisis-demanda.component.css'],
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

export class AnalisisDemandaComponent implements OnInit {

  bsConfig: Partial<BsDatepickerConfig>;
  public error: any
  public isCollapsed = false; // Estado inicial de la sección
  public submitted = false;
  nombreOficinas: any // Lista de oficinas seleccionadas
  nombresSeries: any // Lista de serie seleccionadas
  nombreSerie: any // Lista de serie seleccionadas
  constructor(
    public formBuilder: FormBuilder,
    private informeService: InformesService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private localSecureService: LocalService,
    private localeService: BsLocaleService,
    private excelService: EsperaAgrupadoService
  ) {
    this.localeService.use('es')
    this.bsConfig = Object.assign({},
      {
        container: 'body',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        displayOneMonthRange: true,
        displayMonths: 1,
        locale: 'es',
      });
  }

  @Input() oficinas: any[] = [];
  @Input() series: any[] = [];
  searchOficina!: string
  searchSerie!: string
  rangoFechas: any
  horas: any = [];
  informe: any = [];
  form!: FormGroup
  usuario = this.localSecureService.getValue('usuario');

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      // listIdOficina: new FormControl('', [Validators.required]),
      // listIdSerie: new FormControl('', [Validators.required]),
      // fechaInicio: new FormControl('', [Validators.required]),
      // fechaFin: new FormControl('', [Validators.required]),
      // horaInicio: new FormControl('', [Validators.required]),
      // horaFin: new FormControl('', [Validators.required]),
      // intervalo: new FormControl('5', [Validators.required, Validators.min(1), Validators.max(60)]),
      // limite: new FormControl('60', [Validators.required, Validators.min(1), Validators.max(240)]),
    });
    this.onsubmit();
  }

  /**
   *
   */


  demanda = {
    "idUsuario": this.usuario.idUsuario,
    "sidO": "1",
    "sidS": "1",
    "tipo": "",
    "data": ""
    };


  async onsubmit() {
    this.submitted = true;
    if (this.form.valid) {
      this.spinner.show("servicio-loading");
      this.form.value.idu = this.localSecureService.getValue('usuario').idUsuario;
      this.form.value.slug = this.localSecureService.getValue('customer').slug;
      const resp = await this.informeService.informeDwhReporteDemanda(this.demanda);
      this.spinner.hide("servicio-loading");
      if (resp.status) {
        this.informe = resp.data
        if (this.informe.length > 0) {
          this.isCollapsed = true;
        }
        // this.sweetAlertService.toastConfirm('warning', '¡No hay datos para mostrar!');
      } else {
        this.sweetAlertService.toastConfirm('error', '¡Error al obtener resumen!');
      }

    } else {
      this.handleErrors();
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
    "idUsuario": "1",
    "sidO": "",
    "sidS": "",
    "tipo": "",
    "data": ""

    };
    this.excelService.setCamposFiltrados(data);
    this.excelService.download(this.informe);

  }

}
