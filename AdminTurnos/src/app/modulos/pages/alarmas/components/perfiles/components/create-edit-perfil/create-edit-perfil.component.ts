import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { trigger, transition, animate, style, state } from "@angular/animations";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { SweetAlertService } from "src/app/core/services/utils/sweet-alert.service";
import * as moment from "moment";
import { pad } from "src/app/core/services/utils/utils";
import { LocalService } from "src/app/core/services/storage/local.service";
import { NgxSpinnerService } from "ngx-spinner";
import { EstadoAlarmasService } from "src/app/core/services/pages/alarmas.service";
import { PerfilesService } from "src/app/core/services/http/alarmas/perfiles.service";
import { HORARIOS_POR_DIA_ALARMAS } from "src/app/core/constants/alarmas";

@Component({
  selector: "app-create-edit-perfil",
  templateUrl: "./create-edit-perfil.component.html",
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
export class CreateEditPerfilComponent implements OnInit, OnDestroy {
  @Output() volver = new EventEmitter();
  @Output() recargarPerfiles = new EventEmitter();

  @Output() procesoCancelado = new EventEmitter<boolean>();

  constructor(public formBuilder: FormBuilder, private swaalService: SweetAlertService, private localService: LocalService, private spinner: NgxSpinnerService, private estadoService: EstadoAlarmasService, private PerfilesService: PerfilesService) {}

  agregar = false;
  isSubmitted: boolean = false;
  isLoading = false;
  seriesHabilitadas: any[] = [];
  seriesDeshabilitadas: any[] = [];
  form!: FormGroup;
  estado: any;
  modalEmitterSubscription: Subscription = new Subscription();
  horariosPorDiaAlarmas = HORARIOS_POR_DIA_ALARMAS;
  validationMsg: any = "";

  ngOnInit(): void {
    this.estado = this.estadoService.getEstado();
    //Si el detalle está definido, quiere decir que se puede editar
    if (this.estado.selectedPerfilDetalle) {
      this.form = this.formBuilder.group({
        nombrePerfil: new FormControl(this.estado.selectedPerfilDetalle.alarma, [Validators.required, Validators.maxLength(50)]),
        activo: new FormControl(this.estado.selectedPerfilDetalle.fOk),
        horarioDe: new FormControl(new Date()),
        horarioHasta: new FormControl(new Date()),
        dias: new FormControl("0"),
      });
    } else {
      this.form = this.formBuilder.group({
        nombrePerfil: new FormControl("", [Validators.required, Validators.maxLength(50)]),
        activo: new FormControl(true),
        horarioDe: new FormControl(new Date()),
        horarioHasta: new FormControl(new Date()),
        dias: new FormControl("0"),
      });
    }

    if (this.estado.selectedPerfilDetalle) {
      this.setHorariosFromData();
    }
  }

  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
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

  setHorarios() {
    if (this.dateLessThan()) {
      const horarioDe = this.form.get("horarioDe")?.value;
      const horarioHasta = this.form.get("horarioHasta")?.value;
      this.horariosPorDiaAlarmas = this.horariosPorDiaAlarmas.map((dia: any) => {
        switch (this.form.get("dias")?.value) {
          case "0":
            return {
              ...dia,
              de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
              hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
              activo: 1,
              modificado: true,
            };
          case "1":
            if (dia.dia != "Sábado" && dia.dia != "Domingo") {
              return {
                ...dia,
                de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
                hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
              };
            } else return dia;
          case "2":
            if (dia.dia == "Sábado" || dia.dia == "Domingo") {
              return {
                ...dia,
                de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
                hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
                activo: 1,
                modificado: true,
              };
            } else return dia;
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            if (dia.id == parseInt(this.form.get("dias")?.value) - 2) {
              return {
                ...dia,
                de: `${pad(horarioDe.getHours())}:${pad(horarioDe.getMinutes())}`,
                hasta: `${pad(horarioHasta.getHours())}:${pad(horarioHasta.getMinutes())}`,
                activo: 1,
                modificado: true,
              };
            } else return dia;
          default:
            break;
        }
      });
      return false;
    } else {
      this.swaalService.toastConfirm("error", `Existe un error en los horarios, verfica por favor.<br> ${this.validationMsg}`);
      return true;
    }
  }

  deleteHorarioAtencion(element: any) {
    this.horariosPorDiaAlarmas = this.horariosPorDiaAlarmas.map((dia: any) => {
      if (dia.dia == element) {
        return { ...dia, activo: 0, modificado: true };
      } else {
        return dia;
      }
    });
  }

  async enviarForm() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      if (this.form.invalid) {
        this.handleErrors();
      }
    } else {
      if (this.nombrePerfilValido()) {
        this.isLoading = true;
        this.spinner.show("create-edit-loading");
        const data = {
          idUsuario: parseInt(this.localService.getValue("usuario").idUsuario),
          alarma: this.form.get("nombrePerfil")?.value.trim(),
          fOk: Boolean(this.form.get("activo")?.value),
          hmI1: this.horariosPorDiaAlarmas[0].de,
          hmF1: this.horariosPorDiaAlarmas[0].hasta,
          hmI2: this.horariosPorDiaAlarmas[1].de,
          hmF2: this.horariosPorDiaAlarmas[1].hasta,
          hmI3: this.horariosPorDiaAlarmas[2].de,
          hmF3: this.horariosPorDiaAlarmas[2].hasta,
          hmI4: this.horariosPorDiaAlarmas[3].de,
          hmF4: this.horariosPorDiaAlarmas[3].hasta,
          hmI5: this.horariosPorDiaAlarmas[4].de,
          hmF5: this.horariosPorDiaAlarmas[4].hasta,
          hmI6: this.horariosPorDiaAlarmas[5].de,
          hmF6: this.horariosPorDiaAlarmas[5].hasta,
          hmI7: this.horariosPorDiaAlarmas[6].de,
          hmF7: this.horariosPorDiaAlarmas[6].hasta,
          idAlarma: this.estado.selectedIdPerfil,
        };

        try {
          let resp: any = this.estado.selectedPerfilDetalle ? await this.PerfilesService.actualizarPerfil(data) : await this.PerfilesService.agregarPerfil(data);
          if (resp["status"]) {
            this.swaalService.toastConfirm("success", this.estado.selectedPerfilDetalle ? "El perfil se ha actualizado con éxito" : "El perfil se ha agregado con éxito");
            this.recargarPerfiles.emit();
            this.onVolver();
          } else {
            this.swaalService.toastConfirm("error", `Ha ocurrido un error al ${this.estado.selectedPerfilDetalle ? "editar" : "agregar"} el perfil  ${resp.data?.[0]?.["msg"] ? "- " + resp.data?.[0]?.["msg"] : ""}`);
          }
          this.isLoading = false;
          this.spinner.hide("create-edit-loading");
        } catch (error: any) {
          this.isLoading = false;
          this.spinner.hide("create-edit-loading");
          this.swaalService.toastConfirm("error", `Ha ocurrido un error al ${this.estado.selectedPerfilDetalle ? "editar" : "agregar"} el perfil`);
        }
      }
    }
  }

  nombrePerfilValido(): boolean {
    if (this.form.get("nombrePerfil")?.value.trim() === "") {
      this.swaalService.toastConfirm("error", "Debe ingresar Nombre del perfil.");
      return false;
    }

    if (
      this.estado.listaAlarmas.findIndex((alarma: any) => {
        return alarma.valor.trim().toLowerCase() === this.form.get("nombrePerfil")?.value.trim().toLowerCase() && alarma.id !== this.estado.selectedIdPerfil;
      }) > -1
    ) {
      this.swaalService.toastConfirm("error", "El Nombre del perfil ya se encuentra asignado.");
      return false;
    }
    return true;
  }

  handleTexts(value: any, text: any) {
    let generatedText = value;
    if (generatedText) {
      generatedText = generatedText + text;
    } else {
      generatedText = text;
    }
    return generatedText;
  }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError: any) => {
          let error;
          if (keyError == "required") {
            error = `El campo ${key} es requerido`;
          }
          if (keyError == "pattern") {
            error = `¡El valor del campo ${key} debe ser un número natural!`;
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`;
          } else {
            mensajeErrores = `\n${error}\n`;
          }
        });
      }
    });
    // if (this.horariosPorDiaAlarmas.every((dia) => dia.activo == 0)) {
    //   if (mensajeErrores) {
    //     mensajeErrores = `${mensajeErrores}\n ${"Todos los horarios de atención no tienen horas asignadas"}\n`;
    //   } else {
    //     mensajeErrores = `\n${"Todos los horarios de atención no tienen horas asignadas"}\n`;
    //   }
    // }
    this.swaalService.toastConfirm("error", `No se ha podido crear el perfil, debido a los siguientes errores:\n${mensajeErrores}`);
  }

  onVolver() {
    this.isSubmitted = false;
    this.volver.emit();
    this.estadoService.setValor("agregarEditar", false);
    this.procesoCancelado.emit(true);
  }

  dateLessThan(): boolean {
    let validacion: boolean = true;
    const horarioDe = this.form.get("horarioDe")?.value;
    const horarioHasta = this.form.get("horarioHasta")?.value;
    const hInicial1 = moment(`${horarioDe.getHours()}:${horarioDe.getMinutes()}`, "hh:mm").valueOf();
    const hFinal1 = moment(`${horarioHasta.getHours()}:${horarioHasta.getMinutes()}`, "hh:mm").valueOf();
    if (hInicial1 > hFinal1) {
      validacion = false;
      this.validationMsg = "El horario inicial es mayor que el horario final";
    } else if (hInicial1 == hFinal1) {
      validacion = false;
      this.validationMsg = "El horario inicial es igual que el horario final";
    }
    return validacion;
  }
}
