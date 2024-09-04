import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { InformesService } from 'src/app/core/services/http/Informes/informes.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { saveAs } from 'file-saver';
import { exportDataToTextFile } from 'src/app/core/services/utils/utils';

@Component({
  selector: 'app-dwh-atencion-proveedor',
  templateUrl: './dwh-atencion-proveedor.component.html',
  styleUrls: ['./dwh-atencion-proveedor.component.css'],
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
export class DwhAtencionProveedorComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  informe:any = [];
  public submitted = false;
  isSubmitted = false;
  isCollapsed = false; // Estado inicial de la sección
  @Input()oficinas:any[] = [];
  @Input()series: any[] = [];

  constructor(
    public formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private informesService: InformesService,
    private spinner: NgxSpinnerService,
    ) 
    
    { 
    this.bsConfig = Object.assign({},
      {
        container: 'body',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        displayOneMonthRange: true,
        displayMonths:1 ,
        locale: 'es',
      });
  }

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      // listIdOficina: new FormControl('', [Validators.required]),
      // listIdSerie:  new FormControl('', [Validators.required]),
      fechaInicio: new FormControl('', [Validators.required]),
      fechaFin: new FormControl('', [Validators.required]),
    });
  }

  async informeDWH(): Promise<any> {

    const resp = await this.informesService.informeDwhAtencionProveedores(this.form.value);
    this.spinner.show("servicio-loading");
    if (resp.status) {
      this.spinner.hide("servicio-loading");
      this.informe = resp.data;
    } else {
      this.sweetAlertService.toastConfirm('error', resp.message);
    }
    return resp;
  }

  selectFecha(e:any){
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
    exportDataToTextFile(csvContent,"Reporte DWH Atención Proveedores.txt")
  }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          // if (key == 'listIdOficina' && keyError == 'required') {
          //   error = `El campo oficinas es requerido`;
          // }
         
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

  async onSubmit() : Promise<void>{
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
