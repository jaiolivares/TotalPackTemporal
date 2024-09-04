import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";
import { EstadoAlarmasService } from "src/app/core/services/pages/alarmas.service";
import { SeriesAlarmaService } from "src/app/core/services/http/alarmas/series.service";

@Component({
  selector: "app-series",
  templateUrl: "./series.component.html",
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
export class SeriesComponent implements OnInit, OnDestroy {
  agregarEditar = false;
  error = false;
  isLoading = false;
  errorMsg = "";
  servicios: any;
  permisosAdministracion: any;
  estado: any;
  estadoSubscription = new Subscription();

  listaSeries: any;
  listaSeriesAsignadas: any;

  constructor(private spinner: NgxSpinnerService, private estadoService: EstadoAlarmasService, private seriesAlarmaService: SeriesAlarmaService) {}

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
        // this.estadoService.setValor("selectedPerfilDetalle", false);
        await this.obteneSeriesAsignadas();
        this.setSeriesFromData();
      }
    });
  }
  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  async obteneSeriesAsignadas() {
    this.error = false;
    this.isLoading = true;
    this.spinner.show("servicio-get-perfiles-loading");
    try {
      let idOficina = 0;
      let resp = await this.seriesAlarmaService.obteneSeriesAsignadas(this.estado.selectedIdPerfil, idOficina);
      if (resp["status"] == true) {
        this.estadoService.setValor("seriesAsignadas", resp.data);
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

  setSeriesFromData() {
    this.listaSeries = this.estado.listaSeries;
    this.listaSeriesAsignadas = this.estado.seriesAsignadas;
    this.listaSeries = this.listaSeries.map((serie: any) => {
      let cntEsp = "";
      let tpoEsp = "";
      let tpoAte = "";
      let serieAsignada = this.listaSeriesAsignadas.find((s: any) => s.idSerie === serie.id);
      if (serieAsignada !== undefined) {
        cntEsp = serieAsignada.cntEsp;
        tpoEsp = serieAsignada.tpoEsp;
        tpoAte = serieAsignada.tpoAte;
      }
      return { ...serie, cntEsp, tpoEsp, tpoAte };
    });
    this.estadoService.setValor("listaSeries", this.listaSeries);
  }

  // async obtenerPerfilDetalle() {
  //   this.error = false;
  //   this.isLoading = true;
  //   this.spinner.show("servicio-get-perfiles-loading");
  //   try {
  //     let resp = await this.perfilesService.obtenerPerfilDetalle(this.estado.selectedIdPerfil);
  //     if (resp["status"] == true) {
  //       //limpia formato de hora eliminando los segundos de 00:00:00 a 00:00
  //       this.limpiarHora(resp.data[0]);
  //       //Una vez se obtiene el detalle, se carga al estado.
  //       this.estadoService.setValor("selectedPerfilDetalle", resp.data[0]);
  //     } else {
  //       this.error = true;
  //       this.errorMsg = "Ha ocurrido un error al obtener el detalle del perfil";
  //     }
  //   } catch (e: any) {
  //     this.error = true;
  //     this.errorMsg = "Ha ocurrido un error al obtener el detalle del perfil";
  //   }
  //   this.spinner.hide("servicio-get-perfiles-loading");
  //   this.isLoading = false;
  // }

  async recargarSeries(luegoDeEliminar = false) {
    this.isLoading = true;
    this.estadoService.setValor("refrescarSeries", true);
    //Si no se elimina, es necesario recargar el detalle para obtener la data fresca
    if (!luegoDeEliminar) {
      // await this.obtenerPerfilDetalle();

      await this.obteneSeriesAsignadas();
      this.setSeriesFromData();
    } else {
      //Si se elimina se debe eliminar el detalle anterior, pero no se refresca la data ya que la data ya no existe
      this.isLoading = false;
    }
  }

  volverADatos() {
    //Oculta el formulario de crear/editar
    this.agregarEditar = false;
  }

  irACrear() {
    //Muestra el formulario de crear/editar
    this.agregarEditar = true;
    this.estadoService.setValor("selectedPerfilDetalle", false);
  }

  irAEditar() {
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
