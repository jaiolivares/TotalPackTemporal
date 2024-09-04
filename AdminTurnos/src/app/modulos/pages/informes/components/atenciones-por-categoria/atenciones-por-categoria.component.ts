import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, animate, style, state } from '@angular/animations';

import { InformesService } from 'src/app/core/services/http/Informes/informes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';

import { EsperaAgrupadoService } from 'src/app/core/services/utils/excelService/espera-agrupado.service';
import { AFCAtencionesCategoriaService } from 'src/app/core/services/utils/excelService/afc-atenciones-categoria.service';

@Component({
  selector: 'app-atenciones-por-categoria',
  templateUrl: './atenciones-por-categoria.component.html',
  styleUrls: ['./atenciones-por-categoria.component.css'],
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
export class AtencionesPorCategoriaComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  public error: any
  public isCollapsed = false; // Estado inicial de la sección
  public submitted = false;
  nombreOficinas: any // Lista de oficinas seleccionadas
  constructor(
    public formBuilder: FormBuilder,
    private informeService: InformesService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private localSecureService: LocalService,
    private localeService: BsLocaleService,
    private excelService: AFCAtencionesCategoriaService
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
    this.obtenerOficinas();
  }

  @Input() oficinas: any[] = [];
  @Input() series: any[] = [];
  searchOficina!: string

  horas: any = [];
  informe: any = [];
  form!: FormGroup

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      listIdOficina: new FormControl('', [Validators.required]),
      fechaInicio: new FormControl('', [Validators.required]),
      fechaFin: new FormControl('', [Validators.required]),
    });
  }


  async onsubmit() {
    this.submitted = true;
    if (this.form.valid) {
      this.spinner.show("servicio-loading");
      this.form.value.idu = this.localSecureService.getValue('usuario').idUsuario;
      this.form.value.slug = this.localSecureService.getValue('customer').slug;
      const resp = await this.informeService.informeAtencionesCategoria(this.form.value);
      this.spinner.hide("servicio-loading");
      this.obtenerNombreOficina(this.form.value.listIdOficina);
      if (resp.status) {
        this.informe = resp.data
        if (this.informe.length > 0) {
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
    const resp = await this.informeService.informeListaOficina(this.localSecureService.getValue('customer').slug)
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


  async tecleado(event: any, input: string) {
    if (input == "oficinas") {
      this.searchOficina = event.value;
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
          if (key == 'fechaInicio' && keyError == 'required') {
            error = `El campo fecha de inicio es requerido`;
          }
          if (key == 'fechaFin' && keyError == 'required') {
            error = `El campo fecha final es requerido`;
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
  formatearFecha(fecha: string): string {
    const partesFecha = fecha.split('-');
    if (partesFecha.length === 3) {
      // Construye la fecha en el formato 'DD-MM-YYYY'
      return `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
    } else {
      // Manejo de error si el formato no es el esperado
      console.error('Formato de fecha no válido:', fecha);
      return fecha; // Devuelve la fecha sin cambios
    }
  }

  exportarDataExcel() {
    // Obtén las fechas del formulario (asumiendo que son strings en formato 'YYYY-MM-DD')
    const fechaInicio = this.form.value.fechaInicio;
    const fechaFin = this.form.value.fechaFin;

    // Convierte las fechas al formato deseado ('DD-MM-YYYY')
    const fechaInicioFormateada = this.formatearFecha(fechaInicio);
    const fechaFinFormateada = this.formatearFecha(fechaFin);

    // Construye el objeto de datos
    const data = {
      "listIdOficina": this.nombreOficinas,
      "fechaInicio": fechaInicioFormateada,
      "fechaFin": fechaFinFormateada,
    };
    this.excelService.setCamposFiltrados(data);
    this.excelService.download(this.informe);

  }
}
