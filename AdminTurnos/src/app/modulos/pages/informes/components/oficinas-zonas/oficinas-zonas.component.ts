import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,  } from '@angular/forms';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { InformesService } from 'src/app/core/services/http/Informes/informes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

import { NgxSpinnerService } from 'ngx-spinner';

import { RankingEjecutivoService } from 'src/app/core/services/utils/excelService/ranking-ejecutivo.service';
import { ZonasService } from "../../../../../core/services/http/general/zonas.service";
import { EstadoGeneralService } from "../../../../../core/services/pages/generales.service";
import {secondsToString} from "../../../../../core/services/utils/utils";



@Component({
  selector: 'app-oficinas-zonas',
  templateUrl: './oficinas-zonas.component.html',
  styleUrls: ['./oficinas-zonas.component.css'],
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
export class OficinasZonasComponent implements OnInit {
  public ofis: any[] = [];
  public series: any[] = [];
  public respInforme: any[] = [];
  public totalQAtendidas: number = 0;
  public informeSucursales: any = [];
  public verSucursales = false;
  public verDetalleSucursal = false;
  public verDatosMensuales = false;
  public verReporteZona = false;
  public oficinaSeleccionada: any = null;
  public soloZonas = true;
  public idzona: any;
  public nombreZona: any;
  public report:any;
  searchOficina!: string;
  public menorA20 = 0;
  public mayorA20 = 0;

  form!: FormGroup;
  @Input() oficinas: any[] = [];

  public chartOptionsDia: any = {
    series: [99], // Aquí puedes cambiar el porcentaje
    chart: {
      height: 250,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '50%',
        }
      },
    },
    labels: ['Porcentaje'],
  };

  public chartOptionsMes: any = {
    series: [75], // Aquí puedes cambiar el porcentaje
    chart: {
      height: 250,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '50%',
        }
      },
    },
    labels: ['Porcentaje'],
  };

  chartOptionsEsperaAtencion: any = {
  series: [52, 48],
  chart: {
    height: 200,
    type: 'pie'
  },
  colors: ['#3B78C2', '#f05b4f'],
  labels: ['Promedio de Atención', 'Promedio de Espera'],
  tooltip: {
    enabled: false // Deshabilitar tooltip
  },
  states: {
    hover: {
      filter: {
        type: 'none' // Deshabilitar efectos en hover
      }
    },
    active: {
      filter: {
        type: 'none' // Deshabilitar efectos en clic o selección activa
      }
    }
  }
};

chartOptionsAtendidosPerdidos: any = {
  series: [97, 3],
  chart: {
    height: 200,
    type: 'pie'
  },
  colors: ['#3B78C2', '#f05b4f'],
  labels: ['Atendidos', 'Perdidos'],
  tooltip: {
    enabled: false // Deshabilitar tooltip
  },
  states: {
    hover: {
      filter: {
        type: 'none' // Deshabilitar efectos en hover
      }
    },
    active: {
      filter: {
        type: 'none' // Deshabilitar efectos en clic o selección activa
      }
    }
  }
};

chartOptionsSLA: any = {
  series: [95, 5],
  chart: {
    height: 200,
    type: 'pie'
  },
  colors: ['#3B78C2', '#f05b4f'],
  labels: ['<= 20 min', '> 20 min'],
  tooltip: {
    enabled: false // Deshabilitar tooltip
  },
  states: {
    hover: {
      filter: {
        type: 'none' // Deshabilitar efectos en hover
      }
    },
    active: {
      filter: {
        type: 'none' // Deshabilitar efectos en clic o selección activa
      }
    }
  }
};


  constructor(
    private zonaService: ZonasService,
    public formBuilder: FormBuilder,
    private informeService: InformesService,
    private localService: LocalService,
    private sweetAlert: SweetAlertService,
    private spinner: NgxSpinnerService,
    private excelService: RankingEjecutivoService,
    private estadoService: EstadoGeneralService,
    private sweetAlertService: SweetAlertService,
    private localSecureService: LocalService,
  ) {

  }

  detalleZona = false;
  selectedZona: any;
  customer: any;
  zonas: any[] = [];

    convertSecondsToString(seconds:any){
    return secondsToString(seconds);
  }

  ngOnInit(): void {
    this.customer = this.localSecureService.getValue('customer');
    // this.obtenerZonas();
    this.obtenerZona();
  }

    async tecleado(event: any, input: string) {
    if (input == "oficinas") {
      this.searchOficina = event.value;
    }
  }

  async obtenerZonas() {
    this.spinner.show("servicio-loading");
    (await this.zonaService.obtenerZonas(this.customer.slug))
      .subscribe(resp => {
        if (resp.status) {
          this.zonas = resp.data;

          this.estadoService.setValor('totalZonas', resp.data.length)
          this.spinner.hide("servicio-loading");
        } else {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error', 'Error al obtener zonas!');
        }
      }, error => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', 'Error al obtener zonas!');
      });
  }


  async irAReporteZona(data: any): Promise<any> {
    // this.detalleZona = true;
    this.idzona = data.idZona;
    this.nombreZona = data.zona;
    this.verSucursales = false;
    this.selectedZona = data;
    console.log(this.selectedZona);
    this.soloZonas = false;
    this.verReporteZona = true;
    this.verDatosMensuales = false;
  }

  async obtenerZona() {
    this.spinner.show("servicio-loading");
    const usurario = this.localSecureService.getValue('usuario').idUsuario;

    const data = {
      idUsuario: usurario,
      idZ: 0
    }
    let report = await this.informeService.informeDwhOnlineZonas(data);

    this.spinner.hide("servicio-loading");
    if (report.status) {
      this.detalleZona = true ;
      this.zonas = report.data;
      if (this.zonas.length > 0) {
      }
      return;

    } else {
      this.sweetAlert.swalError('Error', 'No se pudo obtener el reporte', 'warning');
      return;
    }


  }

llamadoDetalleSucrusal(oficina: any) {
  console.log(oficina);

  if (this.oficinaSeleccionada === oficina.idZona) {
    this.oficinaSeleccionada = null;
  } else {
    this.oficinaSeleccionada = oficina.idZona;
    this.selectedZona = oficina;
  }

}

  async obtenerInformeZonasOficinas(): Promise<any> {
    this.spinner.show("servicio-loading");
    const usuario = this.localSecureService.getValue('usuario').idUsuario;
    if (this.idzona === 0) {
      const data = {
        idUsuario: usuario,
        idZ: -1
      }
      this.report = await this.informeService.informeDwhOnlineZonas(data);
    }else{
      const data = {
        idUsuario: usuario,
        idZ: this.idzona
      }
      this.report = await this.informeService.informeDwhOnlineZonas(data);
    }



    this.spinner.hide("servicio-loading");
    if (this.report.status) {
      this.informeSucursales = this.report.data;
      return;
    } else {
      this.sweetAlert.swalError('Error', 'No se pudo obtener el informe', 'warning');
      return;
    }

  }

    get porcentajeEmiM(): number {
    if (!this.selectedZona || this.selectedZona.qEmiM + this.selectedZona.qEmiEM === 0) return 0;
    return parseFloat(((this.selectedZona.qEmiM / (this.selectedZona.qEmiM + this.selectedZona.qEmiEM)) * 100).toFixed(1));
  }

  get porcentajeEmiEM(): number {
    if (!this.selectedZona || this.selectedZona.qEmiM + this.selectedZona.qEmiEM === 0) return 0;
    return parseFloat(((this.selectedZona.qEmiEM / (this.selectedZona.qEmiM + this.selectedZona.qEmiEM)) * 100).toFixed(1));
  }

    get porcentajeAtendidos(): number {
    const total = this.selectedZona.qAteT + this.selectedZona.qPer;
    if (!this.selectedZona || total === 0) return 0;
    return parseFloat(((this.selectedZona.qAteT / total) * 100).toFixed(1));
  }

  get porcentajePerdidos(): number {
    const total = this.selectedZona.qAteT + this.selectedZona.qPer;
    if (!this.selectedZona || total === 0) return 0;
    return parseFloat(((this.selectedZona.qPer / total) * 100).toFixed(1));
  }

    get porcentajePromedioAtencion(): number {
    const total = this.selectedZona.tAteP + this.selectedZona.tEspM;
    if (!this.selectedZona || total === 0) return 0;
    return parseFloat(((this.selectedZona.tAteP / total) * 100).toFixed(1));
  }

  get porcentajePromedioEspera(): number {
    const total = this.selectedZona.tAteP + this.selectedZona.tEspM;
    if (!this.selectedZona || total === 0) return 0;
    return parseFloat(((this.selectedZona.tEspM / total) * 100).toFixed(1));
  }



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
          if (key == 'jornada' && keyError == 'required') {
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
  estado(){
    //this.volver = this.volver ? false : true;
  }

  /*onVolver() {
    this.volver = true;
    this.verSucursales = false;
    this.verDatosMensuales = false;
  }*/

  llamadoSucursales() {
    if (this.idzona < 0) {
      console.log('aca');
      this.sweetAlert.toastConfirm('warning', 'Seleccione una zona');
      this.verSucursales = false;
      return;
    }
    this.obtenerInformeZonasOficinas();
    this.soloZonas = false;
    this.verReporteZona = false;
    this.verDatosMensuales = false;
    this.verSucursales = true;
  }

  llamadoDatosMensuales(){

    /*this.verSucursales = false;
    this.detalleZona = false;*/
    this.verSucursales = false;
    this.verReporteZona = false;
    this.verDatosMensuales = true;
    this.soloZonas = false;
  }

  llamadoReporteZona(){
    this.verSucursales = false;
    this.soloZonas = false;
    this.verDatosMensuales = false;
    this.verReporteZona = true;
  }

  protected readonly secondsToString = secondsToString;
}
