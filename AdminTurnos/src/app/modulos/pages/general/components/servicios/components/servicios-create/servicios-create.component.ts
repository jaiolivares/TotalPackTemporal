import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ModalCodigosComponent } from '../modals/modal-codigos/modal-codigos.component';
import { Subscription } from 'rxjs';
import { ModalVistaPreviaTicketComponent } from '../modals/modal-vista-previa-ticket/modal-vista-previa-ticket.component';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import * as moment from 'moment';
import { minutesStringToSeconds, pad, stringNumbersToSeconds, stringToSeconds } from 'src/app/core/services/utils/utils';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-servicios-create',
  templateUrl: './servicios-create.component.html',
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
export class ServiciosCreateComponent implements OnInit, OnDestroy {
  @Output() volver = new EventEmitter();
  @Output() recargarSeries = new EventEmitter();

  @ViewChild('ticketTextArea') ticketTextArea!: ElementRef;
  constructor(
    private seriesService: SeriesService,
    public formBuilder: FormBuilder,
    private modalService: ModalService,
    private swaalService: SweetAlertService,
    private localService: LocalService,
    private spinner: NgxSpinnerService
  ) { }

  agregar = false; // eliminar 
  isSubmitted = false;
  isLoading = false;
  seriesHabilitadas: any[] = [];
  seriesDeshabilitadas: any[] = [];
  form!: FormGroup;
  modalEmitterSubscription: Subscription = new Subscription();
  horariosAtencionPorDia = [
    {
      id: 1,
      dia: 'Lunes',
      de: '00:00',
      hasta: '23:59',
      yde: '00:00',
      yhasta: '00:00',
      activo: 1
    },
    {
      id: 2,
      dia: 'Martes',
      de: '00:00',
      hasta: '23:59',
      yde: '00:00',
      yhasta: '00:00',
      activo: 1
    },
    {
      id: 3,
      dia: 'Miércoles',
      de: '00:00',
      hasta: '23:59',
      yde: '00:00',
      yhasta: '00:00',
      activo: 1
    },
    {
      id: 4,
      dia: 'Jueves',
      de: '00:00',
      hasta: '23:59',
      yde: '00:00',
      yhasta: '00:00',
      activo: 1
    },
    {
      id: 5,
      dia: 'Viernes',
      de: '00:00',
      hasta: '23:59',
      yde: '00:00',
      yhasta: '00:00',
      activo: 1
    },
    {
      id: 6,
      dia: 'Sábado',
      de: '00:00',
      hasta: '23:59',
      yde: '00:00',
      yhasta: '00:00',
      activo: 1
    },
    {
      id: 7,
      dia: 'Domingo',
      de: '00:00',
      hasta: '23:59',
      yde: '00:00',
      yhasta: '00:00',
      activo: 1
    },
  ]
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      nombreSerie: new FormControl("", [Validators.required]),
      boton: new FormControl("", [Validators.required]),
      exigeId: new FormControl(false, [Validators.required]),
      info: new FormControl(false, [Validators.required]),
      vip: new FormControl(false, [Validators.required]),
      valor: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(255), Validators.pattern('^(0|[1-9][0-9]*)$')]),
      jornada: new FormControl(8, [Validators.required, Validators.min(0), Validators.max(24), Validators.pattern('^(0|[1-9][0-9]*)$')]),
      posDeriva: new FormControl(-1, [Validators.required]),
      tiempoMaximoEspera: new FormControl('001500', [Validators.required]),
      tiempoMaximoAtencion: new FormControl('001500', [Validators.required]),
      tiempoMinimoAtencion: new FormControl("000000", [Validators.required]),
      letra: new FormControl("", [Validators.required, Validators.maxLength(1), Validators.pattern('[A-Za-z]')]),
      tipo: new FormControl(0, [Validators.required]),
      descripcion: new FormControl(""),
      ticket: new FormControl("\\08\\25\\26\n\\11\\28\n\\21\n\\28\n%nombre serie%\n\\28\n\\04", [Validators.required]),
      dias: new FormControl("0"),
      horarioDe: new FormControl(new Date()),
      horarioHasta: new FormControl(new Date()),
      horarioYDe: new FormControl(new Date()),
      horarioYHasta: new FormControl(new Date()),
      modificarHorarios: new FormControl(false),
      infoMsg: new FormControl("")
    });
    this.setHorariosDefault()
  }
  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
  }
  setHorariosDefault() {
    const horarioDe = this.form.get('horarioDe')?.value;
    horarioDe.setHours(0)
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
            if (dia.dia != 'Sábado' && dia.dia != 'Domingo') {
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
            if (dia.id == parseInt(this.form.get('dias')?.value) - 2) {
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
          default:
            break;
        }
      })
      return false;
    } else {
      this.swaalService.toastConfirm('error', 'Existe un error en los horarios, verfica por favor');
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
  onChangeNombreSerie() {
    this.form.patchValue({
      boton: this.form.get('nombreSerie')?.value
    })
  }
  replaceTicketTextArea(value: any) {
    this.form.patchValue({
      ticket: value
    })
  }
  async enviarForm() {
    this.isSubmitted = true;
    if (this.form.get('jornada')?.value < 0 || this.form.get('jornada')?.value > 24) {
      this.swaalService.toastConfirm('error', `No se ha podido crear la serie, la jornada debe ser un número entre 0 y 24`);
    }
    const tiempoMaximoEsperaSegundos = stringNumbersToSeconds(this.form.get('tiempoMaximoEspera')?.value)
    const tiempoMaximoAtencionSegundos = stringNumbersToSeconds(this.form.get('tiempoMaximoAtencion')?.value)
    const tiempoMinimoAtencionSegundos = stringNumbersToSeconds(this.form.get('tiempoMinimoAtencion')?.value)
    if (this.form.invalid || tiempoMaximoEsperaSegundos >= 32767 || tiempoMaximoAtencionSegundos >= 32767 || tiempoMinimoAtencionSegundos >= 32767  ) {
      if (this.form.invalid) {
        this.handleErrors()
      }
      if (tiempoMaximoEsperaSegundos >= 32766) {
        this.swaalService.toastConfirm('error', `No se ha podido crear la serie, el tiempo máximo de espera es demasiado alto.`);
      }
      if (tiempoMaximoAtencionSegundos >= 32766) {
        this.swaalService.toastConfirm('error', `No se ha podido crear la serie, el tiempo máximo de atención es demasiado alto.`);
      }
      if (tiempoMinimoAtencionSegundos >= 32766) {
        this.swaalService.toastConfirm('error', `No se ha podido crear la serie, el tiempo mínimo de atención es demasiado alto.`);
      }

    } else {
      this.isLoading = true;
      this.spinner.show("servicio-loading");

      const horariosPrimerBloque = this.generarHorasMinutos()
      //console.log(horariosPrimerBloque);
      const horariosSegundoBloque = this.generarHorasMinutos(false)
      //console.log(horariosSegundoBloque);
      const data = {
        idUser: this.localService.getValue('usuario').idUsuario,
        serie: this.form.get('nombreSerie')?.value,
        serieBoton: this.form.get('boton')?.value,
        letra: this.form.get('letra')?.value,
        exigeId: this.form.get('exigeId')?.value,
        info: this.form.get('info')?.value,
        vip: this.form.get('vip')?.value,
        valor: this.form.get('valor')?.value,
        posDeriva: this.form.get('posDeriva')?.value,
        tiempoMaximoEspera: stringNumbersToSeconds(this.form.get('tiempoMaximoEspera')?.value),
        tiempoMinimoAtencion: stringNumbersToSeconds(this.form.get('tiempoMinimoAtencion')?.value),
        tiempoMaximoAtencion: stringNumbersToSeconds(this.form.get('tiempoMaximoAtencion')?.value),
        jornada: this.form.get('jornada')?.value,
        "hI1": horariosPrimerBloque.horasI1,
        "mI1": horariosPrimerBloque.minutosI1,
        "hF1": horariosPrimerBloque.horasF1,
        "mF1": horariosPrimerBloque.minutosF1,
        "hI2": horariosSegundoBloque.horasI2,
        "mI2": horariosSegundoBloque.minutosI2,
        "hF2": horariosSegundoBloque.horasF2,
        "mF2": horariosSegundoBloque.minutosF2,
        ticket: this.form.get('ticket')?.value,
        tipo: this.form.get('tipo')?.value,
        descripcion: this.form.get('descripcion')?.value,
        infoMsg: this.form.get('info')?.value ? this.form.get('infoMsg')?.value : '',
        "data": ""
      }
      try {
        const resp: any = await this.seriesService.agregarSerie(
          this.localService.getValue('customer').slug,
          data
        );
        if (resp['status'] && resp['data'][0].codError == 0) {
          this.swaalService.toastConfirm('success', 'La serie se ha agregado con éxito');
          this.onVolver();
          this.recargarSeries.emit();
        } else {
          this.swaalService.toastConfirm('error', `Ha ocurrido un error al crear la serie  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.isLoading = false;
        this.spinner.hide("servicio-loading");
      }
      catch (error: any) {
        this.isLoading = false;
        this.spinner.hide("servicio-loading");
        // this.onVolver();
        this.swaalService.toastConfirm('error', 'Ha ocurrido un error al crear la serie');
      }

    }
  }
  generarHorasMinutos(esPrimerBloque = true): any {
    let horasI1: any;
    let minutosI1: any;
    let horasF1: any;
    let minutosF1: any;
    let horasI2: any;
    let minutosI2: any;
    let horasF2: any;
    let minutosF2: any;
    this.horariosAtencionPorDia.forEach((dia: any) => {
      if (esPrimerBloque) {
        if (dia.activo == 0) {
          horasI1 = this.handleTexts(horasI1, '00')
          minutosI1 = this.handleTexts(minutosI1, '00')
          horasF1 = this.handleTexts(horasF1, '00')
          minutosF1 = this.handleTexts(minutosF1, '00')
        } else {
          horasI1 = this.handleTexts(horasI1, dia.de.split(':')[0])
          minutosI1 = this.handleTexts(minutosI1, dia.de.split(':')[1])
          horasF1 = this.handleTexts(horasF1, dia.hasta.split(':')[0])
          minutosF1 = this.handleTexts(minutosF1, dia.hasta.split(':')[1])
        }

      } else {
        if (dia.activo == 0) {
          horasI2 = this.handleTexts(horasI2, '00')
          minutosI2 = this.handleTexts(minutosI2, '00')
          horasF2 = this.handleTexts(horasF2, '00')
          minutosF2 = this.handleTexts(minutosF2, '00')
        } else {
          horasI2 = this.handleTexts(horasI2, dia.yde.split(':')[0])
          minutosI2 = this.handleTexts(minutosI2, dia.yde.split(':')[1])
          horasF2 = this.handleTexts(horasF2, dia.yhasta.split(':')[0])
          minutosF2 = this.handleTexts(minutosF2, dia.yhasta.split(':')[1])
        }

      }
    })
    if (esPrimerBloque) {
      //console.log(horasI1, 'horas iniciales 1');
      //console.log(minutosI1, 'minutos iniciales 1');
      //console.log(horasF1, 'horas finales 1');
      //console.log(minutosF1, 'minutos finales 1');
      return { horasI1, minutosI1, horasF1, minutosF1 }
    } else {
      //console.log(horasI2, 'horas iniciales 2');
      //console.log(minutosI2, 'minutos iniciales 2');
      //console.log(horasF2, 'horas finales 2');
      //console.log(minutosF2, 'minutos finales 2');
      return { horasI2, minutosI2, horasF2, minutosF2 }
    }
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
    //console.log(this.form.controls)
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        //console.log(controlErrors)
        Object.keys(controlErrors).forEach((keyError: any) => {
          //console.log(keyError);
          let error;
          if (keyError == 'required') {
            error = `El campo ${key} es requerido`
          }
          if (keyError == 'mask') {
            error = `Por favor, completa el formato (hh:mm:ss) para el campo ${key}`
          }
          if (keyError == 'pattern' && key == 'letra') {
            error = '¡La letra debe ser alfabética con solo una letra!'
          }
          if (keyError == 'pattern' && key == 'valor') {
            error = '¡El valor debe ser un número natural!'
          }
          if (keyError == 'maxlength' && key == 'letra') {
            error = '¡La letra no puede contener más de un caracter!'
          }
          if (keyError == 'min') {
            error = `¡El valor mínimo del campo ${key} debe ser ${controlErrors.min?.min} !`
          }
          if (keyError == 'max') {
            error = `¡El valor máximo del campo ${key} debe ser ${controlErrors.max?.max} !`
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
  modalCodigos() {
    this.modalEmitterSubscription.unsubscribe();
    const options = {
      id: 1,
      class: 'modal-lg modal-dialog-centered modal-info-oficinas modal-codigos ',
      centered: true,
      ignoreBackdropClick: true,
      initialState: { data: { ticketTextArea: this.form.get('ticket')?.value } },
      animated: true,

    };
    this.modalService.openModal(
      ModalCodigosComponent,
      options,
      'modal-codigos'
    );
    this.modalEmitterSubscription = this.modalService.getModalRef('modal-codigos')?.content.onReplaceTicketTextAreaEmitter.subscribe((value: any) => {
      this.replaceTicketTextArea(value);
    })
  }
  modalVistaPreviaTicket() {
    const options = {
      id: 1,
      class: 'modal-lg modal-dialog-centered modal-info-oficinas modal-vista-previa-ticket',
      centered: true,
      ignoreBackdropClick: true,
      initialState: { data: { ticketTextArea: this.form.get('ticket')?.value } },
      animated: true,
    };
    this.modalService.openModal(
      ModalVistaPreviaTicketComponent,
      options,
      'modal-vista-previa-ticket'
    );
  }
  async swaalDefaultTicket() {
    const alert: any = await this.swaalService.swalConfirm('¿Desea regresar al ticket default?');
    if (alert) {
      this.replaceTicketTextArea('\\08\\25\\26\n\\11\\28\n\\21\n\\28\n%nombre serie%\n\\28\n\\04');
    }
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
    if (hInicial1 > hFinal1) {
      validacion = false;
    } else if (hFinal1 > hInicial2) {
      validacion = false;
      if (horarioYDe.getHours() == 0 && horarioYDe.getMinutes() == 0 && horarioYHasta.getHours() == 0 && horarioYHasta.getMinutes() == 0) {
        validacion = true;
      }
    } else if (hInicial2 > hFinal2) {
      validacion = false;
    } else {
      validacion = true;
    }
    return validacion;
  }
}