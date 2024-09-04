import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportesService } from 'src/app/core/services/http/Reportes/reportes.service';
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
  selector: 'app-estado-ejecutivos',
  templateUrl: './estado-ejecutivos.component.html',
  styleUrls: ['./estado-ejecutivos.component.css'],
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

export class EstadoEjecutivosComponent implements OnInit {

  public chartOptions: Partial<ChartOptions>;
  public error: any
  horas: any = [];
  public estadoEjecutivo: any[] = [];
  public fechaActual!: string;
  public isCollapsed = false; // Estado inicial de la sección
  public submitted = false;
  @ViewChild("chart", { static: false }) chart: ChartComponent = {} as ChartComponent;
  @Input() oficinas: any[] = [];
  constructor(
    private localSecureService: LocalService,
    private reporteService: ReportesService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    public formBuilder: FormBuilder,


  ) {
    this.chartOptions = {};
  }

  form!: FormGroup

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      idOficina: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      horaInicio: new FormControl('', [Validators.required]),
      horaFin: new FormControl('', [Validators.required]),
    });
    const hoy = new Date();
    this.fechaActual = hoy.toISOString().split('T')[0];
    this.getHoras();
    this.form.get('horaInicio')?.valueChanges.subscribe(() => this.onTimeChange());
    this.form.get('horaFin')?.valueChanges.subscribe(() => this.onTimeChange());
  }

  getHoras() {
    const horas: any = [];
    for (let i = 6; i <= 22; i++) {
      horas.push({ valor: i + ":00", time: i });
    }
    this.horas = horas;
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
  async EstadoEjecutivo() {
    this.submitted = true;
    if (this.form.valid) {
      this.form.value.slug = this.localSecureService.getValue('customer').slug;

      this.spinner.show("servicio-loading");
      const resp = await this.reporteService.reporteEstadoEjecutivo(this.form.value)
      this.spinner.hide("servicio-loading");
      if (resp.data.length > 0) {
        this.isCollapsed = true;
      }

      if (resp.status) {
        this.estadoEjecutivo = resp.data.map((item: any) => {
          return { ...item, jsonEstados: JSON.parse(item.jsonEstados) };
        });

        //Por cada registro obtenemos su info y la ordenamos para el gráfico
        const infoProcesada: any = resp.data.map((item: any) =>
          this.ordenarHoras(item.ejecutivo, JSON.parse(item.jsonEstados)),
        );

        if (this.estadoEjecutivo.length <= 0) {
          this.sweetAlertService.toastConfirm('warning', `¡No se encontraron resultados!`);
          return;
        }

        const oficinaSeleccionada = this.oficinas.find(ofi => ofi.id === parseInt(this.form.value.idOficina));

        //Con esto dejamos todo en un sólo array para que reporte no lo tome como distintas series dentro de una sola barra
        //sino que toma cada ejecutivo en una barra distinta
        const nuevoArray: any[] = [].concat.apply([], infoProcesada);
        const cantidadEjecutivos = Array.from(new Set(nuevoArray.map((dato) => dato.x)));

        // console.log(nuevoArray);
        // console.log(console.log(cantidadEjecutivos))

        this.chartOptions = {
          series: [
            {
              data: nuevoArray
            }
          ],
          chart: {
            height: 100 + (120 * cantidadEjecutivos.length), //height base + uno por cada barra
            type: "rangeBar",
          },
          plotOptions: {
            bar: {
              horizontal: true,
            },
          },
          tooltip: {
            custom: ({ series, seriesIndex, dataPointIndex, w }) => {
              const evento = w.config.series[seriesIndex].data[dataPointIndex].evento.tipo;
              const inicio = w.config.series[seriesIndex].data[dataPointIndex].horaInicio;
              const fin = w.config.series[seriesIndex].data[dataPointIndex].horaFin;

              return `
                <div class="custom-tooltip" style="padding: 10px;">
                  <span>Evento: ${evento}</span><br>
                  <span>Inicio: ${inicio}</span><br>
                  <span>Fin: ${fin}</span><br>
                </div>
              `;
            }
          },
          legend: {
            show: true,
            showForSingleSeries: true,
            position: 'bottom',
            horizontalAlign: 'center',
            customLegendItems: ['Activo', 'Pausa', 'Off'],
            markers: {
              customHTML: undefined,
              fillColors: ['#49c049', '#f06f6f', '#848585']
            },
          },
          //Dejamos como min y max, los rangos de hora ingresados en formulario
          //horaInicio le restamos 0.5 hora
          //horaFin le sumamos 0.5 hora
          xaxis: {
            type: "datetime",
            min: new Date(this.form.value.fecha).getTime() + ((parseInt(this.form.value.horaInicio, 10) - 0.5) * 60 * 60 * 1000),
            max: new Date(this.form.value.fecha).getTime() + ((parseInt(this.form.value.horaFin, 10) + 0.5) * 60 * 60 * 1000),
          },
          title: {
            text: 'Eventos ejecutivos',
            style: {
              fontSize: '20px', // Tamaño de fuente del título
            },
          },
          subtitle: {
            // text: `${this.oficinas[this.form.value.idOficina].valor}
            //       - ${this.form.value.fecha} ${this.form.value.horaInicio}:00 ~ ${this.form.value.horaFin}:00`,
            text: `Oficina: ${oficinaSeleccionada.valor}
                  - Fecha: ${this.form.value.fecha}
                  - Inicio: ${this.form.value.horaInicio}:00
                  - Fin: ${this.form.value.horaFin}:00`,
            align: 'left'
          }
        };

        // if (this.estadoEjecutivo.length <= 0) {
        //   this.sweetAlertService.toastConfirm('warning', `¡No se encontrarón resultados!`);
        // }
      } else
        this.sweetAlertService.toastConfirm('error', '¡Error al obtener estado del ejecutivo!');
    } else
      this.handleErrors();
  }

  obtenerTipoEvento(tipoEstado: string) {
    switch (tipoEstado) {
      case 'A':
        return { tipo: "Activo", color: '#49c049' };
      case 'P':
        return { tipo: "Pausa", color: '#f06f6f' };
      case 'O':
        return { tipo: "Off", color: '#848585' };
      default:
        return { tipo: "Off", color: '#848585' };
    }
  }

  ordenarHoras(ejecutivo: string, data: any) {
    let paresHoras = [];
    for (var i = 0; i <= data.length - 1; i++) {
      //Separamos hora y minuto del evento actual
      const [horaActual, minutoActual] = data[i].Hora.split(':');
      const horaActualMili = parseInt(horaActual, 10) * 60 * 60 * 1000;
      const minutoActualMili = parseInt(minutoActual, 10) * 60 * 1000;

      let [horaSiguiente, minutoSiguiente]: [string, string] = ["", ""];

      //En cada registro separamos hora y minuto del siguiente evento
      if (i < data.length - 1)
        [horaSiguiente, minutoSiguiente] = data[i + 1].Hora.split(':');
      else
        //Si es el último evento, tomamos la hora fin como referencia
        //Le sumamos una hora, a la horaFin del formulario
        [horaSiguiente, minutoSiguiente] = [this.form.value.horaFin, "00"];

      const horaSiguienteMili = parseInt(horaSiguiente, 10) * 60 * 60 * 1000;
      const minutoSiguienteMili = parseInt(minutoSiguiente, 10) * 60 * 1000;

      //Dejamos como dato extra horaInicio y horaFin para usar en tooltip
      var par = {
        fillColor: this.obtenerTipoEvento(data[i].Evento).color,
        evento: this.obtenerTipoEvento(data[i].Evento),
        horaInicio: data[i].Hora,
        horaFin: horaSiguiente + ":" + minutoSiguiente,
        x: ejecutivo,
        y: [
          new Date(this.form.value.fecha).getTime() + horaActualMili + minutoActualMili,
          new Date(this.form.value.fecha).getTime() + horaSiguienteMili + minutoSiguienteMili,
        ]
      };
      paresHoras.push(par);
    }

    return paresHoras;
  }



  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (key == 'idOficina' && keyError == 'required') {
            error = `El campo oficina es requerido`;
          }
          if (key == 'fecha' && keyError == 'required') {
            error = `El campo fecha es requerido`;
          }
          if (key == 'horaInicio' && keyError == 'required') {
            error = `El campo hora de inicio es requerido`;
          }
          if (key == 'horaFin' && keyError == 'required') {
            error = `El campo hora final es requerido`;
          }
          if (key == 'horaFin' && keyError == 'inavelidRange') {
            error = `El campo hora final es requerido`;
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


}
