import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { trigger, transition, animate, style, state } from "@angular/animations";
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { SweetAlertService } from "src/app/core/services/utils/sweet-alert.service";
import { NgxSpinnerService } from "ngx-spinner";
import { EstadoAlarmasService } from "src/app/core/services/pages/alarmas.service";
import { HORARIOS_POR_DIA_ALARMAS } from "src/app/core/constants/alarmas";

import { SeriesAlarmaService } from "src/app/core/services/http/alarmas/series.service";

@Component({
  selector: "app-create-edit-serie",
  templateUrl: "./create-edit-serie.component.html",
  styleUrls: ["./create-edit-serie.component.css"],
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
export class CreateEditSerieComponent implements OnInit, OnDestroy {
  @Output() volver = new EventEmitter();
  @Output() recargarSeries = new EventEmitter();

  form!: FormGroup;

  constructor(private swaalService: SweetAlertService, private spinner: NgxSpinnerService, private estadoService: EstadoAlarmasService, private seriesAlarmaService: SeriesAlarmaService, private formBuilder: FormBuilder) {}

  agregar = false;
  isSubmitted: boolean = false;
  isLoading = false;
  seriesHabilitadas: any[] = [];
  seriesDeshabilitadas: any[] = [];
  estado: any;
  modalEmitterSubscription: Subscription = new Subscription();
  horariosPorDiaAlarmas = HORARIOS_POR_DIA_ALARMAS;
  validationMsg: any = "";

  listaSeries: any;

  ngOnInit(): void {
    this.estado = this.estadoService.getEstado();

    //Si el detalle está definido, quiere decir que se puede editar
    // if (this.estado.selectedPerfilDetalle) {
    //   this.form = this.formBuilder.group({
    //     nombrePerfil: new FormControl(this.estado.selectedPerfilDetalle.alarma, [Validators.required, Validators.maxLength(50)]),
    //     activo: new FormControl(this.estado.selectedPerfilDetalle.fOk),
    //     horarioDe: new FormControl(new Date()),
    //     horarioHasta: new FormControl(new Date()),
    //     dias: new FormControl("0"),
    //   });
    // } else {
    //   this.form = this.formBuilder.group({
    //     nombrePerfil: new FormControl("", [Validators.required, Validators.maxLength(50)]),
    //     activo: new FormControl(true),
    //     horarioDe: new FormControl(new Date()),
    //     horarioHasta: new FormControl(new Date()),
    //     dias: new FormControl("0"),
    //   });
    // }

    // this.listaSeries = this.estado.listaSeries;

    this.form = this.formBuilder.group({
      registros: this.formBuilder.array(this.createRegistros()),
    });
  }

  createRegistros() {
    return this.estado.listaSeries.map((registro: any) =>
      this.formBuilder.group({
        id: [registro.id],
        valor: [registro.valor],
        cntEsp: [registro.cntEsp, [Validators.maxLength(4), Validators.pattern(/^(?:[1-9]\d{0,3}|9999)$/)]],
        tpoEsp: [registro.tpoEsp, [Validators.maxLength(6), Validators.pattern(/^(?:[1-9]\d{0,3}|[1-7]\d{4}|8[0-5]\d{3}|86[0-3]\d{2}|86400)$/)]],
        tpoAte: [registro.tpoAte, [Validators.maxLength(5), Validators.pattern(/^(?:[1-9]\d{0,3}|[1-7]\d{4}|8[0-5]\d{3}|86[0-3]\d{2}|86400)$/)]],
      })
    );
  }

  get registros(): FormArray {
    return this.form.get("registros") as FormArray;
  }

  validaNumero(event: KeyboardEvent): void {
    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete", "ArrowUp", "ArrowDown"]; // Teclas permitidas
    const isNumber = /^[0-9]$/;

    if (!isNumber.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  limpiarSerie(serie: any) {
    const registroGroup = this.registros.controls.find((control: AbstractControl) => (control as FormGroup).get("id")?.value === serie.id) as FormGroup;

    if (registroGroup) {
      registroGroup.patchValue({
        cntEsp: "",
        tpoEsp: "",
        tpoAte: "",
      });
    }
  }

  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
  }

  async enviarForm() {
    if (this.form.invalid) {
      this.swaalService.toastConfirm("error", "Verifique los valores ingresados en las series.");
      return;
    }

    let seriesAsignadas = "";

    this.registros.value.map((serie: any) => {
      if (serie.cntEsp !== "" || serie.tpoEsp !== "" || serie.tpoAte !== "") {
        const cntEsp = serie.cntEsp === null ? "" : serie.cntEsp;
        const tpoEsp = serie.tpoEsp === null ? "" : serie.tpoEsp;
        const tpoAte = serie.tpoAte === null ? "" : serie.tpoAte;

        seriesAsignadas += seriesAsignadas === "" ? `${serie.id},${cntEsp},${tpoEsp},${tpoAte}` : `;${serie.id},${cntEsp},${tpoEsp},${tpoAte}`;
      }
    });

    const data = {
      idOficina: 0,
      idAlarma: this.estado.selectedIdPerfil,
      lista: seriesAsignadas,
    };

    try {
      let resp: any = await this.seriesAlarmaService.actualizarAlarmaSeries(data);
      if (resp["status"]) {
        this.swaalService.toastConfirm("success", "Las series se han actualizado con éxito");
        this.onVolver();
        this.recargarSeries.emit();
      } else {
        this.swaalService.toastConfirm("error", `Ha ocurrido un error al registra las series.\n${resp.data?.[0]?.["msg"]}`);
      }
      this.isLoading = false;
      this.spinner.hide("create-edit-loading");
    } catch (error: any) {
      this.isLoading = false;
      this.spinner.hide("create-edit-loading");
      this.swaalService.toastConfirm("error", `Ha ocurrido un error al registra las series.\n${error}`);
    }
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
  }
}
