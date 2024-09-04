import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { trigger, transition, animate, style, state } from "@angular/animations";
import { Subscription } from "rxjs";
import { SweetAlertService } from "src/app/core/services/utils/sweet-alert.service";
import { LocalService } from "src/app/core/services/storage/local.service";
import { NgxSpinnerService } from "ngx-spinner";
import { EstadoAlarmasService } from "src/app/core/services/pages/alarmas.service";
import { PerfilesService } from "src/app/core/services/http/alarmas/perfiles.service";
import { HORARIOS_POR_DIA_ALARMAS } from "src/app/core/constants/alarmas";

@Component({
  selector: "app-detalle-serie",
  templateUrl: "./detalle-serie.component.html",
  animations: [
    trigger("openClose", [
      state(
        "open",
        style({
          height: "*",
          opacity: "1",
          visibility: "visible",
        })
      ),
      state(
        "closed",
        style({
          height: "0px",
          opacity: "0",
          "margin-bottom": "-100px",
          visibility: "hidden",
        })
      ),
      transition("open => closed", [animate("0.5s")]),
      transition("closed => open", [animate("0.5s")]),
    ]),
  ],
})
export class DetalleSerieComponent implements OnInit, OnDestroy {
  @Output() editar = new EventEmitter();
  @Output() recargarSeries = new EventEmitter();
  constructor(private estadoService: EstadoAlarmasService) {}
  submit = false;
  sinMotivos = false;
  isLoading = false;
  tablaTicket: any;
  motivos: any;
  estado: any;
  modalEmitterSubscription: Subscription = new Subscription();
  estadoSubscription = new Subscription();
  horariosPorDiaAlarmas = HORARIOS_POR_DIA_ALARMAS;

  listaSeries: any;

  estadioSubscription = new Subscription();

  ngOnInit(): void {
    this.estado = this.estadoService.getEstado();
    this.estadioSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      //Estado previo
      const prevEstado = this.estado;
      //Estado actual
      this.estado = estado;
      //Para que se llame solo cuando el perfil cambia, de modo que si se está en editar, regrese a datos.
      if (prevEstado && prevEstado.selectedIdPerfil != estado.selectedIdPerfil) {
        // //Al volver a datos, deselecciona el detalle que se tenga almacenado
        // this.volverADatos();
        // // this.estadoService.setValor("selectedSerie", false);
        // await this.obteneSeriesAsignadas();
        // this.setSeriesFromData();
      }

      this.listaSeries = this.estado.listaSeries;
    });
  }

  // async ngOnInit() {
  // this.estado = this.estadoService.getEstado();
  // this.form = this.formBuilder.group({
  //   nombrePerfil: new FormControl(""),
  //   activo: new FormControl(this.estado.selectedPerfilDetalle.fOk),
  //   horarioDe: new FormControl(new Date()),
  //   horarioHasta: new FormControl(new Date()),
  //   dias: new FormControl("0"),
  // });
  // this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
  //   //Estado previo
  //   const prevEstado = this.estado;
  //   //Estado actual
  //   this.estado = estado;
  //   //Para que se llame solo cuando el detalle del perfil cambie
  //   if (prevEstado && prevEstado.selectedPerfilDetalle != estado.selectedPerfilDetalle) {
  //     //Ver si la serieAgenda está definida, ya que al momento de borrar una serieAgenda la misma estará en false.
  //     // if (estado.selectedPerfilDetalle) {
  //     //   this.setHorariosDefault();
  //     //   this.setHorariosFromData();
  //     // }
  //   }
  // });
  // this.setHorariosFromData();
  // }

  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
    this.estadoSubscription.unsubscribe();
  }

  irAActualizar() {
    this.editar.emit();
  }
}
