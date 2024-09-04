import { formatDate } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { FeriadosService } from 'src/app/core/services/http/agenda/feriados.service';
import { AesService } from 'src/app/core/services/utils/aes.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-feriados',
  templateUrl: './feriados.component.html',
  styles: [`
    .box-series {
      min-height: 265px;
    }

    .box-input .text-danger {
      font-size:20px
  }

    .box-sel-series {
        min-height: 1px;
    }

    .w-20 {
      width:23% !important;
    }
  `],
  encapsulation: ViewEncapsulation.None,

})
export class FeriadosComponent implements OnInit {

  constructor(
    public formBuilder: FormBuilder,
    private feriadosService: FeriadosService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private aesService: AesService,
  ) { }

  fechaActual: any;
  form!: FormGroup;
  submit: boolean = false;
  feriados: any = [];
  anio = new FormControl('', [Validators.required]);
  isSubmitted: boolean = false;
  error=false;
  ngOnInit(): void {
    this.fechaActual = new Date().toISOString().split('T')[0];
    this.form = this.formBuilder.group({
      fecha: new FormControl("", [Validators.required]),
    });
  }

  consultar() {
    if (this.anio.valid) {
      this.obtenerFeriasdos(this.anio.value);
    }
  }

  async obtenerFeriasdos(anio: any) {
    this.spinner.show("servicio-loading");
    (await this.feriadosService.obtenerFeriados(anio))
      .subscribe({
        next: async (resp: any) => {
          if (resp.status) {
            this.feriados = this.aesService.aesDecrypt(resp.data);
            this.spinner.hide("servicio-loading");
          } else {
            this.feriados = [];
            this.spinner.hide("servicio-loading");
            this.sweetAlertService.toastConfirm('error', resp.message);
          }
        },
       error: async (error) => {
        this.error = true;
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener los días asignados.');
       }
      });
  }

  get listaAnios(): number[] {
    const AnioActual = new Date().getFullYear();
    const proximosAnios = Array.from({ length: 11 }, (_, index) => AnioActual + index);
    return proximosAnios;
  }

  async agregarFeriado() {
    this.isSubmitted = true;

    if (this.form.valid) {
      this.spinner.show("servicio-loading");
      let accion = "I";
      const resp = await this.feriadosService.AccionFeriados(accion, this.form.value.fecha)

      if (resp.status) {
        this.spinner.hide("servicio-loading");

        let partesFecha: string[] = this.form.value.fecha.split('-');
        let anio: number = + partesFecha[0];

        if (anio == this.anio.value) {
          await this.obtenerFeriasdos(this.anio.value);
        }
        this.sweetAlertService.toastConfirm('success', '¡Día agregado!');
      } else {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', resp.message);
      }
    } else {
      this.sweetAlertService.toastConfirm('warning', "Por favor selecciona una fecha");
    }

  }

  async eliminarFeriado(fecha: any) {
    this.spinner.show("servicio-loading");
    let accion = "D";

    let partesFecha: string[] = fecha.split('/');
    let dia: number = +partesFecha[0];
    let mes: number = +partesFecha[1];
    let anio: number = +partesFecha[2];
    fecha = new Date(anio, mes - 1, dia).toISOString().split('T')[0];

    const resp = await this.feriadosService.AccionFeriados(accion, fecha)

    if (resp.status) {
      this.spinner.hide("servicio-loading");

      if (anio == this.anio.value) {
        await this.obtenerFeriasdos(this.anio.value);
      }
      await this.sweetAlertService.toastConfirm('success', '¡Día eliminado!');
    } else {
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('error', resp.message);
    }
  }

}
