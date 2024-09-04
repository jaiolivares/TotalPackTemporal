import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { EstadoAlarmasService } from "src/app/core/services/pages/alarmas.service";
import { NgxSpinnerService } from "ngx-spinner";
import { PerfilesService } from "src/app/core/services/http/alarmas/perfiles.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-perfiles",
  templateUrl: "./perfiles.component.html",
  encapsulation: ViewEncapsulation.None,
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
export class PerfilesComponent implements OnInit, OnDestroy {
  agregarEditar = false;
  error = false;
  isLoading = false;
  errorMsg = "";
  servicios: any;
  permisosAdministracion: any;
  estado: any;
  estadoSubscription = new Subscription();

  @Output() procesoCancelado = new EventEmitter<boolean>();

  constructor(private spinner: NgxSpinnerService, private estadoService: EstadoAlarmasService, private perfilesService: PerfilesService) {}

  async ngOnInit() {
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      //Estado previo
      const prevEstado = this.estado;
      //Estado actual
      this.estado = estado;
      //Para que se llame solo cuando el perfil cambia, de modo que si se está en editar, regrese a datos.
      if (prevEstado && prevEstado.selectedIdPerfil != estado.selectedIdPerfil) {
        if (estado.selectedIdPerfil === undefined) {
          return;
        }
        //Al volver a datos, deselecciona el detalle que se tenga almacenado
        this.volverADatos();
        this.estadoService.setValor("selectedPerfilDetalle", false);
        await this.obtenerPerfilDetalle();
      }
      this.agregarEditar = this.estado.agregarEditar;
    });
  }

  ngProcesoCancelado(mostrar: boolean) {
    this.procesoCancelado.emit(mostrar);
  }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  async obtenerPerfilDetalle() {
    this.error = false;
    this.isLoading = true;
    this.spinner.show("servicio-get-perfiles-loading");
    try {
      let resp = await this.perfilesService.obtenerPerfilDetalle(this.estado.selectedIdPerfil);
      if (resp["status"] == true) {
        //limpia formato de hora eliminando los segundos de 00:00:00 a 00:00
        this.limpiarHora(resp.data[0]);
        //Una vez se obtiene el detalle, se carga al estado.
        this.estadoService.setValor("selectedPerfilDetalle", resp.data[0]);
      } else {
        this.error = true;
        this.errorMsg = "Ha ocurrido un error al obtener el detalle del perfil";
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = "Ha ocurrido un error al obtener el detalle del perfil";
    }
    this.spinner.hide("servicio-get-perfiles-loading");
    this.isLoading = false;
  }

  async recargarPerfiles(luegoDeEliminar = false) {
    this.isLoading = true;
    this.estadoService.setValor("refrescarPerfiles", true);
    //Si no se elimina, es necesario recargar el detalle para obtener la data fresca
    if (!luegoDeEliminar) {
      await this.obtenerPerfilDetalle();
    } else {
      //Si se elimina se debe eliminar el detalle anterior, pero no se refresca la data ya que la data ya no existe
      this.isLoading = false;
    }
  }

  volverADatos() {
    //Oculta el formulario de crear/editar
    // this.agregarEditar = false;
  }

  irACrear() {
    //Muestra el formulario de crear/editar
    this.agregarEditar = true;
    this.estadoService.setValor("selectedPerfilDetalle", false);
  }

  irAEditar() {
    this.ngProcesoCancelado(false);
    //Muestra el formulario de crear/editar
    this.agregarEditar = true;
  }

  limpiarHora(detalle: any) {
    for (let index = 1; index <= 7; index++) {
      const idInicio = `hmI${index}`;
      const idTermino = `hmF${index}`;

      if (detalle[idInicio] !== null) {
        let horaSplit = detalle[idInicio].split(":");
        detalle[idInicio] = horaSplit[0] + ":" + horaSplit[1];
      }

      if (detalle[idTermino] !== null) {
        let horaSplit = detalle[idTermino].split(":");
        detalle[idTermino] = horaSplit[0] + ":" + horaSplit[1];
      }
    }
  }
}
