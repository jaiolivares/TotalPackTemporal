import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { InformesService } from 'src/app/core/services/http/Informes/informes.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { saveAs } from 'file-saver';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { exportDataToTextFile } from 'src/app/core/services/utils/utils';

@Component({
  selector: 'app-dwh-pausa',
  templateUrl: './dwh-pausa.component.html',
  styleUrls: ['./dwh-pausa.component.css'],
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
export class DwhPausaComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  informe:any = [];
  nombreOficinas: any // Lista de oficinas seleccionadas
  searchOficina!: string;
  submitted = false;
  isSubmitted = false;
  isCollapsed = false; // Estado inicial de la sección
  @Input()oficinas:any[] = [];
  @Input()series: any[] = [];

  constructor(
    public formBuilder: FormBuilder,
    private informeService: InformesService,
    private localSecureService: LocalService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
  ) { 
    this.bsConfig = Object.assign({},
      {
        container: 'body',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        displayOneMonthRange: true,
        displayMonths:1 ,
        locale: 'es',
      });
      this.obtenerOficinas();
  }

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      listIdOficina: new FormControl('', [Validators.required]),
      // listIdSerie:  new FormControl('', [Validators.required]),
      fechaInicio: new FormControl('', [Validators.required]),
      fechaFin: new FormControl('', [Validators.required]),
    });
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

  async informeDWH(): Promise<any> {

    const resp = await this.informeService.informeDWHPausas(this.form.value);
    this.spinner.show("servicio-loading");
    if (resp.status) {
      this.spinner.hide("servicio-loading");
      this.informe = resp.data;
    } else {
      this.sweetAlertService.toastConfirm('error', resp.message);
    }
    return resp;
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

  exportTxt() {
    let csvContent = ''; //Inicia el contenido como string vacío
    csvContent = this.informe;
    
    exportDataToTextFile(csvContent,"Reporte DWH Pausas.txt")
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
            error = `El campo fecha es requerido`;
          }
          if (key == 'fechaFin' && keyError == 'required') {
            error = `El campo fecha es requerido`;
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
  async onSubmit():Promise<void>{
    this.submitted = true;
    if (this.form.valid) {
      this.spinner.show("servicio-loading");
      await this.informeDWH();
      this.spinner.hide("servicio-loading");
      this.exportTxt();
    } else {
      this.handleErrors();
    }
  }
}
