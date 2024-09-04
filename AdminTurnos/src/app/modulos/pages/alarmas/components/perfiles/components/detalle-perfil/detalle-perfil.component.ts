import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { trigger, transition, animate, style, state } from "@angular/animations";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { SweetAlertService } from "src/app/core/services/utils/sweet-alert.service";
import { NgxSpinnerService } from "ngx-spinner";
import { EstadoAlarmasService } from "src/app/core/services/pages/alarmas.service";
import { PerfilesService } from "src/app/core/services/http/alarmas/perfiles.service";
import { HORARIOS_POR_DIA_ALARMAS } from "src/app/core/constants/alarmas";

@Component({
  selector: "app-detalle-perfil",
  templateUrl: "./detalle-perfil.component.html",
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
export class DetallePerfilComponent implements OnInit, OnDestroy {
  @Output() editar = new EventEmitter();
  @Output() recargarPerfiles = new EventEmitter();

  constructor(public formBuilder: FormBuilder, private swaalService: SweetAlertService, private spinner: NgxSpinnerService, private estadoService: EstadoAlarmasService, private perfilesService: PerfilesService) {}
  submit = false;
  sinMotivos = false;
  isLoading = false;
  tablaTicket: any;
  motivos: any;
  form!: FormGroup;
  estado: any;
  modalEmitterSubscription: Subscription = new Subscription();
  estadoSubscription = new Subscription();
  horariosPorDiaAlarmas = HORARIOS_POR_DIA_ALARMAS;

  async ngOnInit() {
    this.estado = this.estadoService.getEstado();
    this.form = this.formBuilder.group({
      nombrePerfil: new FormControl(""),
      activo: new FormControl({ value: this.estado.selectedPerfilDetalle.fOk, disabled: true }),
      horarioDe: new FormControl(new Date()),
      horarioHasta: new FormControl(new Date()),
      dias: new FormControl("0"),
    });
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      //Estado previo
      const prevEstado = this.estado;
      //Estado actual
      this.estado = estado;
      //Para que se llame solo cuando el detalle del perfil cambie
      if (prevEstado && prevEstado.selectedPerfilDetalle != estado.selectedPerfilDetalle) {
        //Ver si la serieAgenda está definida, ya que al momento de borrar una serieAgenda la misma estará en false.
        // if (estado.selectedPerfilDetalle) {
        //   this.setHorariosDefault();
        //   this.setHorariosFromData();
        // }
      }
    });
    this.setHorariosFromData();
  }

  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
    this.estadoSubscription.unsubscribe();
  }

  setHorariosFromData() {
    this.horariosPorDiaAlarmas = this.horariosPorDiaAlarmas.map((dia: any) => {
      const horaInicio = `hmI${dia.id}`;
      const horaFin = `hmF${dia.id}`;
      const de = this.estado.selectedPerfilDetalle[horaInicio];
      const hasta = this.estado.selectedPerfilDetalle[horaFin];
      return { ...dia, de, hasta, activo: true };
    });
  }

  irAActualizar() {
    this.editar.emit();
  }

  async eliminarPerfil() {
    const option = await this.swaalService.swalConfirm("¿Desea eliminar este Perfil?");
    if (option) {
      this.isLoading = true;
      this.spinner.show("eliminar-loading");

      try {
        const resp: any = await this.perfilesService.eliminarPerfil(this.estado.selectedIdPerfil);
        if (resp["status"]) {
          this.swaalService.toastConfirm("success", "El Perfil se ha eliminado con éxito");
          this.estadoService.setValor("selectedIdPerfil", null);
          this.recargarPerfiles.emit(true);
        } else {
          this.swaalService.toastConfirm("error", `Ha ocurrido un error al eliminar el Perfil  ${resp.data?.[0]?.["msg"] ? "- " + resp.data?.[0]?.["msg"] : ""}`);
        }
        this.isLoading = false;
        this.spinner.hide("eliminar-loading");
      } catch (error: any) {
        this.isLoading = false;
        this.spinner.hide("eliminar-loading");
        this.swaalService.toastConfirm("error", `Ha ocurrido un error al eliminar el Perfil`);
      }
    }
  }
}
