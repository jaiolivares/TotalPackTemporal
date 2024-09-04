import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { Subscription } from 'rxjs';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import * as moment from 'moment';
import { minutesStringToSeconds, pad, stringNumbersToSeconds, stringToSeconds } from 'src/app/core/services/utils/utils';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstadoAgendaService } from 'src/app/core/services/pages/agenda.service';
import { ServiciosAgendaService } from 'src/app/core/services/http/agenda/servicios-agenda.service';
import { HORARIOS_ATENCION_POR_DIA_AGENDA } from 'src/app/core/constants/agenda';
@Component({
  selector: 'app-create-edit-agenda',
  templateUrl: './create-edit-agenda.component.html',
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
export class CreateEditAgendaComponent implements OnInit, OnDestroy {
  @Output() volver = new EventEmitter();
  @Output() recargarSeries = new EventEmitter();
  constructor(
    private seriesService: SeriesService,
    public formBuilder: FormBuilder,
    private swaalService: SweetAlertService,
    private localService: LocalService,
    private spinner: NgxSpinnerService,
    private estadoService: EstadoAgendaService,
    private servicosAgendaService: ServiciosAgendaService
  ) { }

  agregar = false;
  isSubmitted: boolean = false;
  isLoading = false;
  seriesHabilitadas: any[] = [];
  seriesDeshabilitadas: any[] = [];
  form!: FormGroup;
  estado: any;
  modalEmitterSubscription: Subscription = new Subscription();
  horariosAtencionPorDia = HORARIOS_ATENCION_POR_DIA_AGENDA;
  validationMsg: any = '';
  ngOnInit(): void {
    this.estado = this.estadoService.getEstado();
    //Si el detalle está definido, quiere decir que se puede editar
    if (this.estado.selectedSerieDetalle) {
      this.form = this.formBuilder.group({
        semanasProgramacion: new FormControl(this.estado.selectedSerieDetalle.QSemana, [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        tiempoAtencionxEsc: new FormControl(this.estado.selectedSerieDetalle.TAteEsc, [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        tiempoLlamadoPrevio: new FormControl(this.estado.selectedSerieDetalle.TAntes, [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        tiempoLlamadoPost: new FormControl(this.estado.selectedSerieDetalle.TDespues, [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        horarioDe: new FormControl(new Date()),
        horarioHasta: new FormControl(new Date()),
        horarioYDe: new FormControl(new Date()),
        horarioYHasta: new FormControl(new Date()),
        dias: new FormControl("0"),
      });
    } else {
      this.form = this.formBuilder.group({
        semanasProgramacion: new FormControl("", [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        tiempoAtencionxEsc: new FormControl("", [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        tiempoLlamadoPrevio: new FormControl("", [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        tiempoLlamadoPost: new FormControl("", [Validators.required, Validators.pattern('^(0|[1-9][0-9]*)$')]),
        horarioDe: new FormControl(new Date()),
        horarioHasta: new FormControl(new Date()),
        horarioYDe: new FormControl(new Date()),
        horarioYHasta: new FormControl(new Date()),
        dias: new FormControl("0"),
      });
    }

    this.setHorariosDefault();
    if (this.estado.selectedSerieDetalle) {
      this.setHorariosFromData();
    }
  }
  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
  }
  setHorariosDefault() {
    const horarioDe = this.form.get('horarioDe')?.value;
    horarioDe.setHours(8)
    horarioDe.setMinutes(0)
    const horarioHasta = this.form.get('horarioHasta')?.value;
    horarioHasta.setHours(23)
    horarioHasta.setMinutes(59)
    const horarioYDe = this.form.get('horarioYDe')?.value;
    horarioYDe.setHours(0)
    horarioYDe.setMinutes(0)
    const horarioYHasta = this.form.get('horarioYHasta')?.value;
    horarioYHasta.setHours(0)
    horarioYHasta.setMinutes(0)
    this.form.patchValue({
      horarioDe,
      horarioHasta,
      horarioYDe,
      horarioYHasta
    })
  }

  setHorariosFromData() {
    this.horariosAtencionPorDia = this.horariosAtencionPorDia.map((dia: any, index: any) => {
      let i = index
      if (i != 0) {
        i = i * 2;
      }
      const id = `HMIF${dia.id - 1}1`;
      const id2 = `HMIF${dia.id - 1}2`;
      const primerBloqueValido = this.estado.selectedSerieDetalle[id] == '-1' ? '00:00-00:00' : this.estado.selectedSerieDetalle[id];
      const segundoBloqueValido = this.estado.selectedSerieDetalle[id2] == '-1' ? '00:00-00:00' : this.estado.selectedSerieDetalle[id2];
      const de = primerBloqueValido.split('-')[0];
      const hasta = primerBloqueValido.split('-')[1]
      const yde = segundoBloqueValido.split('-')[0];
      const yhasta = segundoBloqueValido.split('-')[1];
      return {
        ...dia,
        de,
        hasta,
        yde,
        yhasta,
        activo: de == '00:00' && hasta == '00:00' ? 0 : 1
      }
    })
  }

  setHorarios() {
    if (this.dateLessThan()) {
      const horarioDe = this.form.get('horarioDe')?.value;
      const horarioHasta = this.form.get('horarioHasta')?.value;
      const horarioYDe = this.form.get('horarioYDe')?.value;
      const horarioYHasta = this.form.get('horarioYHasta')?.value;
      this.horariosAtencionPorDia = this.horariosAtencionPorDia.map((dia: any) => {
        switch (this.form.get('dias')?.value) {
          case '0':
            return {
              ...dia,
              de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
              hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
              yde: `${pad(horarioYDe.getHours())}:${pad(horarioYDe.getMinutes())}`,
              yhasta: `${pad(horarioYHasta.getHours())}:${pad(horarioYHasta.getMinutes())}`,
              activo: 1
            }
          case '1':
            if (dia.dia != 'Sábado' && dia.dia != 'Domingo' && dia.dia != 'Feriados') {
              return {
                ...dia,
                de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
                hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
                yde: `${pad(horarioYDe.getHours())}:${pad(horarioYDe.getMinutes())}`,
                yhasta: `${pad(horarioYHasta.getHours())}:${pad(horarioYHasta.getMinutes())}`,
                activo: 1
              }
            } else return dia;
          case '2':
            if (dia.dia == 'Sábado' || dia.dia == 'Domingo') {
              return {
                ...dia,
                de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
                hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
                yde: `${pad(horarioYDe.getHours())}:${pad(horarioYDe.getMinutes())}`,
                yhasta: `${pad(horarioYHasta.getHours())}:${pad(horarioYHasta.getMinutes())}`,
                activo: 1
              }
            } else return dia;
          //Días de la semana (id  == dias -2) ejem. dias = 3 (es decir Lunes) - 2 = 1 que es el id del lunes.
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            if (dia.id == parseInt(this.form.get('dias')?.value) - 1) {
              return {
                ...dia,
                de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
                hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
                yde: `${pad(horarioYDe.getHours())}:${pad(horarioYDe.getMinutes())}`,
                yhasta: `${pad(horarioYHasta.getHours())}:${pad(horarioYHasta.getMinutes())}`,
                activo: 1,
                modificado: true
              }
            } else return dia;
          case '10':
            if (dia.id == 1) {
              return {
                ...dia,
                de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
                hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
                yde: `${pad(horarioYDe.getHours())}:${pad(horarioYDe.getMinutes())}`,
                yhasta: `${pad(horarioYHasta.getHours())}:${pad(horarioYHasta.getMinutes())}`,
                activo: 1
              }
            } else return dia;
          default:
            break;
        }
      })
      return false;
    } else {
      this.swaalService.toastConfirm('error', `Existe un error en los horarios, verfica por favor, ${this.validationMsg}`);
      return true;
    }
  }
  deleteHorarioAtencion(element: any) {
    this.horariosAtencionPorDia = this.horariosAtencionPorDia.map((dia: any) => {
      if (dia.dia == element) {
        return {
          ...dia,
          activo: 0,
          modificado: true
        }
      } else {
        return dia;
      }
    });
  }
  async enviarForm() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      if (this.form.invalid) {
        this.handleErrors()
      }

    } else {
      this.isLoading = true;
      this.spinner.show("servicio-loading");

      const horariosPorDia = this.generarHorasMinutos()
      const data = {
        ...horariosPorDia,
        acc: 'A',
        ido: 0,
        ids: this.estado.selectedIdSerie,
        idU: parseInt(this.localService.getValue('usuario').idUsuario),
        qsem: parseInt(this.form.get('semanasProgramacion')?.value),
        tae: parseInt(this.form.get('tiempoAtencionxEsc')?.value),
        tpre: parseInt(this.form.get('tiempoLlamadoPrevio')?.value),
        tpost: parseInt(this.form.get('tiempoLlamadoPost')?.value),
        trll: 0
      }
      try {
        const resp: any = await this.servicosAgendaService.agregarActualizarServicio(
          data
        );
        if (resp['status']) {
          this.swaalService.toastConfirm('success', this.estado.selectedSerieDetalle ? 'La serie se ha actualizado con éxito' : 'La serie se ha agregado con éxito');
          this.onVolver();
          this.recargarSeries.emit();
        } else {
          this.swaalService.toastConfirm('error', `Ha ocurrido un error al ${this.estado.selectedSerieDetalle ? 'editar' : 'agregar'} la serie  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.isLoading = false;
        this.spinner.hide("servicio-loading");
      }
      catch (error: any) {
        this.isLoading = false;
        this.spinner.hide("servicio-loading");
        this.swaalService.toastConfirm('error', `Ha ocurrido un error al ${this.estado.selectedSerieDetalle ? 'editar' : 'agregar'} la serie`);
      }

    }
  }
  generarHorasMinutos(): any {
    let horarios: any = {
      HMIF01: '-1',
      HMIF02: '-1',
      HMIF11: '-1',
      HMIF12: '-1',
      HMIF21: '-1',
      HMIF22: '-1',
      HMIF31: '-1',
      HMIF32: '-1',
      HMIF41: '-1',
      HMIF42: '-1',
      HMIF51: '-1',
      HMIF52: '-1',
      HMIF61: '-1',
      HMIF62: '-1',
      HMIF71: '-1',
      HMIF72: '-1',
    }
    this.horariosAtencionPorDia.forEach((dia: any) => {
      if (dia.activo == 0) {
        const id = `HMIF${dia.id - 1}1`;
        const id2 = `HMIF${dia.id - 1}2`;
        horarios[id] = -1;
        horarios[id2] = -1;
      } else {
        const id = `HMIF${dia.id - 1}1`;
        const id2 = `HMIF${dia.id - 1}2`;
        const horarioPrimerBloque = `${dia.de.split(':')[0]}${dia.de.split(':')[1]}${dia.hasta.split(':')[0]}${dia.hasta.split(':')[1]}`;
        const horarioSegundoBloque = `${dia.yde.split(':')[0]}${dia.yde.split(':')[1]}${dia.yhasta.split(':')[0]}${dia.yhasta.split(':')[1]}`;
        horarios[id] = horarioPrimerBloque == '00000000' ? -1 : horarioPrimerBloque;
        horarios[id2] = horarioSegundoBloque == '00000000' ? -1 : horarioSegundoBloque;
      }
    })
    return horarios
  }

  handleTexts(value: any, text: any) {
    let generatedText = value;
    if (generatedText) {
      generatedText = generatedText + text
    } else {
      generatedText = text
    }
    return generatedText
  }

  handleErrors() {
    let mensajeErrores: any
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError: any) => {
          let error;
          if (keyError == 'required') {
            error = `El campo ${key} es requerido`
          }
          if (keyError == 'pattern') {
            error = `¡El valor del campo ${key} debe ser un número natural!`
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`
          } else {
            mensajeErrores = `\n${error}\n`
          }
        });
      }
    });
    if (this.horariosAtencionPorDia.every((dia) => dia.activo == 0)) {
      if (mensajeErrores) {
        mensajeErrores = `${mensajeErrores}\n ${'Todos los horarios de atención no tienen horas asignadas'}\n`
      } else {
        mensajeErrores = `\n${'Todos los horarios de atención no tienen horas asignadas'}\n`
      }
    }
    this.swaalService.toastConfirm('error', `No se ha podido crear la serie, debido a los siguientes errores:\n${mensajeErrores}`);
  }
  onVolver() {
    this.isSubmitted = false;
    this.volver.emit()
  }
  dateLessThan(): boolean {
    let validacion: boolean = true;
    const horarioDe = this.form.get('horarioDe')?.value;
    const horarioHasta = this.form.get('horarioHasta')?.value;
    const horarioYDe = this.form.get('horarioYDe')?.value;
    const horarioYHasta = this.form.get('horarioYHasta')?.value;
    const hInicial1 = moment(`${horarioDe.getHours()}:${horarioDe.getMinutes()}`, "hh:mm").valueOf();
    const hFinal1 = moment(`${horarioHasta.getHours()}:${horarioHasta.getMinutes()}`, "hh:mm").valueOf();
    const hInicial2 = moment(`${horarioYDe.getHours()}:${horarioYDe.getMinutes()}`, "hh:mm").valueOf();
    const hFinal2 = moment(`${horarioYHasta.getHours()}:${horarioYHasta.getMinutes()}`, "hh:mm").valueOf();
    if (horarioDe.getHours() == 0) {
      validacion = false;
      this.validationMsg = 'La hora de inicio no debe empezar por 0, es decir, es válido a partir de la 1 AM';
    } else if (hInicial1 > hFinal1) {
      validacion = false;
      this.validationMsg = 'El horario inicial del primer bloque es mayor que el horario final del primer bloque';
    } else if (hFinal1 > hInicial2) {
      validacion = false;
      this.validationMsg = 'El horario final del primer bloque es mayor que el horario inicial del segundo bloque';
      if (horarioYDe.getHours() == 0 && horarioYDe.getMinutes() == 0 && horarioYHasta.getHours() == 0 && horarioYHasta.getMinutes() == 0) {
        validacion = true;
      }
    } else if (hInicial2 > hFinal2) {
      validacion = false;
      this.validationMsg = 'El horario inicial del segundo bloque es mayor que el horario final del segundo bloque';
    } else {
      validacion = true;
    }
    return validacion;
  }
}
