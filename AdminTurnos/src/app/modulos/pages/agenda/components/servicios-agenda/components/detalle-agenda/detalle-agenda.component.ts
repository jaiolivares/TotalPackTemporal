import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  trigger,
  transition,
  animate,
  style,
  state,
} from '@angular/animations';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstadoAgendaService } from 'src/app/core/services/pages/agenda.service';
import { ServiciosAgendaService } from 'src/app/core/services/http/agenda/servicios-agenda.service';
import { HORARIOS_ATENCION_POR_DIA_AGENDA } from 'src/app/core/constants/agenda';
@Component({
  selector: 'app-detalle-agenda',
  templateUrl: './detalle-agenda.component.html',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '*',
          opacity: '1',
          visibility: 'visible',
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: '0',
          'margin-bottom': '-100px',
          visibility: 'hidden',
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
})
export class DetalleAgendaComponent implements OnInit, OnDestroy {
  @Output() editar = new EventEmitter();
  @Output() recargarSeries = new EventEmitter();
  constructor(
    public formBuilder: FormBuilder,
    private swaalService: SweetAlertService,
    private localService: LocalService,
    private spinner: NgxSpinnerService,
    private estadoService: EstadoAgendaService,
    private servicosAgendaService: ServiciosAgendaService
  ) {}

  submit = false;
  sinMotivos = false;
  isLoading = false;
  tablaTicket: any;
  motivos: any;
  form!: FormGroup;
  estado: any;
  modalEmitterSubscription: Subscription = new Subscription();
  estadoSubscription = new Subscription();
  horariosAtencionPorDia = HORARIOS_ATENCION_POR_DIA_AGENDA
  async ngOnInit() {
    this.estado = this.estadoService.getEstado();
    this.form = this.formBuilder.group({
      semanasProgramacion: new FormControl('', [Validators.required]),
      tiempoAtencionxEsc: new FormControl('', [Validators.required]),
      tiempoLlamadoPrevio: new FormControl('', [Validators.required]),
      tiempoLlamadoPost: new FormControl('', [Validators.required]),
      horarioDe: new FormControl(new Date()),
      horarioHasta: new FormControl(new Date()),
      horarioYDe: new FormControl(new Date()),
      horarioYHasta: new FormControl(new Date()),
      dias: new FormControl('0'),
    });
    this.estadoSubscription = this.estadoService.estado$.subscribe(
      async (estado) => {
        //Estado previo
        const prevEstado = this.estado;
        //Estado actual
        this.estado = estado;
        //Para que se llame solo cuando el detalle de la serie cambie
        if (
          prevEstado &&
          prevEstado.selectedSerieDetalle != estado.selectedSerieDetalle
        ) {
          //Ver si la serieAgenda está definida, ya que al momento de borrar una serieAgenda la misma estará en false.
          if (estado.selectedSerieDetalle) {
            this.setHorariosDefault();
            this.setHorariosFromData();
          }
        }
      }
    );
    this.setHorariosDefault();
    this.setHorariosFromData();
  }
  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
    this.estadoSubscription.unsubscribe();
  }
  setHorariosDefault() {
    const horarioDe = this.form.get('horarioDe')?.value;
    horarioDe.setHours(0);
    horarioDe.setMinutes(0);
    const horarioHasta = this.form.get('horarioHasta')?.value;
    horarioHasta.setHours(23);
    horarioHasta.setMinutes(59);
    const horarioYDe = this.form.get('horarioYDe')?.value;
    horarioYDe.setHours(0);
    horarioYDe.setMinutes(0);
    const horarioYHasta = this.form.get('horarioYHasta')?.value;
    horarioYHasta.setHours(0);
    horarioYHasta.setMinutes(0);
    this.form.patchValue({
      horarioDe,
      horarioHasta,
      horarioYDe,
      horarioYHasta,
    });
  }
  setHorariosFromData() {
    this.horariosAtencionPorDia = this.horariosAtencionPorDia.map(
      (dia: any, index: any) => {
        let i = index;
        if (i != 0) {
          i = i * 2;
        }
        const id = `HMIF${dia.id - 1}1`;
        const id2 = `HMIF${dia.id - 1}2`;
        const primerBloqueValido =
          this.estado.selectedSerieDetalle[id] == '-1'
            ? '00:00-00:00'
            : this.estado.selectedSerieDetalle[id];
        const segundoBloqueValido =
          this.estado.selectedSerieDetalle[id2] == '-1'
            ? '00:00-00:00'
            : this.estado.selectedSerieDetalle[id2];
        const de = primerBloqueValido.split('-')[0];
        const hasta = primerBloqueValido.split('-')[1];
        const yde = segundoBloqueValido.split('-')[0];
        const yhasta = segundoBloqueValido.split('-')[1];
        return {
          ...dia,
          de,
          hasta,
          yde,
          yhasta,
          activo: de == '00:00' && hasta == '00:00' ? 0 : 1,
        };
      }
    );
  }

  irAActualizar() {
    this.editar.emit();
  }

  async eliminarSerieAgenda() {
    const option = await this.swaalService.swalConfirm(
      '¿Desea eliminar esta serie?'
    );
    if (option) {
      this.isLoading = true;
      this.spinner.show('servicio-loading');

      const data = {
        // ...this.estado.selectedSerieDetalle,
        acc: 'D',
        ido: 0,
        ids: this.estado.selectedIdSerie,
        idU: parseInt(this.localService.getValue('usuario').idUsuario),
        qsem: parseInt(this.estado.selectedSerieDetalle.QSemana),
        tae: parseInt(this.estado.selectedSerieDetalle.TAteEsc),
        tpre: parseInt(this.estado.selectedSerieDetalle.TAntes),
        tpost: parseInt(this.estado.selectedSerieDetalle.TDespues),
        trll: 0,
        HMIF01:-1,
        HMIF02:-1,
        HMIF11:-1,
        HMIF12:-1,
        HMIF21:-1,
        HMIF22:-1,
        HMIF31:-1,
        HMIF32:-1,
        HMIF41:-1,
        HMIF42:-1,
        HMIF51:-1,
        HMIF52:-1,
        HMIF61:-1,
        HMIF62:-1,
        HMIF71:-1,
        HMIF72:-1,
      };
      try {
        const resp: any =
          await this.servicosAgendaService.agregarActualizarServicio(data);
        if (resp['status']) {
          this.swaalService.toastConfirm(
            'success',
            'La serie se ha eliminado con éxito'
          );
          this.recargarSeries.emit(true);
        } else {
          this.swaalService.toastConfirm(
            'error',
            `Ha ocurrido un error al eliminar la serie  ${
              resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''
            }`
          );
        }
        this.isLoading = false;
        this.spinner.hide('servicio-loading');
      } catch (error: any) {
        this.isLoading = false;
        this.spinner.hide('servicio-loading');
        this.swaalService.toastConfirm(
          'error',
          `Ha ocurrido un error al eliminar la serie`
        );
      }
    }
  }
}
