import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { SubSeriesService } from 'src/app/core/services/http/general/sub-series.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { groupByKey, groupByStringKey } from 'src/app/core/services/utils/utils';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-sub-servicios-edit',
  templateUrl: './sub-servicios-edit.component.html',
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
export class SubServiciosEditComponent implements OnInit {
  @Output() onVolver: EventEmitter<any> = new EventEmitter()
  @Input() data: any;
  error = false;
  listDrop: any = [];
  series: any = [];
  subSeries: any = [];
  menus: any = [];
  customer: any;
  errorMsg: any;
  subSeriesNoAsig: any = [];
  menusData: any = [];
  form!: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private subSeriesService: SubSeriesService,
    public formBuilder: FormBuilder,
    private localService: LocalService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService
  ) { }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      nombre: new FormControl(this.data.nombre, [Validators.required]),
    });
    this.customer = this.localService.getValue('customer');
  }
  async onSubmit() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      this.handleErrors()
    } else {
      this.spinner.show('servicio-create-menu-loading')
      const data = {
        idUser: this.localService.getValue('usuario').idUsuario,
        idMenu: this.data.idMenu,
        menu: this.form.get('nombre')?.value,
      }
      try {
        const resp: any = await this.subSeriesService.editarSubSerie(
          this.localService.getValue('customer').slug,
          data
        );
        if (resp['status'] && resp.data[0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'El menú se ha editado con éxito');
          this.volver(true);
        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al actualizar el menú  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.spinner.hide("servicio-create-menu-loading");
      }
      catch (error: any) {
        this.spinner.hide("servicio-create-menu-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al editar el menú');
      }
    }
  }
  volver(reFetch = false) {
    this.isSubmitted = false;
    this.onVolver.emit(reFetch)
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
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`
          } else {
            mensajeErrores = `\n${error}\n`
          }
        });
      }
    });
    this.sweetAlertService.toastConfirm('error', `No se ha podido editar el menú, debido a los siguientes errores:\n${mensajeErrores}`);
  }



}
