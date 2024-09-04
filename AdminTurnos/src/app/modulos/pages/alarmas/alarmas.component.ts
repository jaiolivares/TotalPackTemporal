import { Component, OnDestroy, OnInit } from "@angular/core";
import { EstadoAlarmasService } from "src/app/core/services/pages/alarmas.service";
import { FormControl } from "@angular/forms";
import { LocalService } from "src/app/core/services/storage/local.service";
import { NgxSpinnerService } from "ngx-spinner";
import { PerfilesService } from "src/app/core/services/http/alarmas/perfiles.service";
import { SeriesService } from "src/app/core/services/http/general/series.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-alarmas",
  templateUrl: "./alarmas.component.html",
  styleUrls: ["./alarmas.component.css"],
  providers: [EstadoAlarmasService],
})
export class AlarmasComponent implements OnInit, OnDestroy {
  searchText: string = "";
  inputSearh = new FormControl("");
  isLoading: boolean = false;
  error: boolean = false;
  errorMsg: string = "";
  perfiles: any = [];
  series: any = [];
  selectedIdPerfil: any;
  estado: any;
  estadoSubscription = new Subscription();
  serviciosAlarmaTab: any;
  verAgregar: boolean = true;

  constructor(private estadoService: EstadoAlarmasService, private localService: LocalService, private spinner: NgxSpinnerService, private perfilesService: PerfilesService, private seriesService: SeriesService) {}

  async ngOnInit() {
    await this.obtenerPerfiles();
    await this.obtenerSeries();
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      this.estado = estado;
      //Refresca el serivicio luego de crear/editar data
      if (estado.refrescarPerfiles) {
        this.estadoService.setValor("refrescarPerfiles", false);
        await this.obtenerPerfiles();
        this.estadoService.setValor(
          "selectedPerfil",
          this.perfiles.find((perfil: any) => perfil.id == estado.selectedIdPerfil)
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  irACrear(): void {
    this.verAgregar = false;
    this.estadoService.setValor("agregarEditar", true);
    this.selectedIdPerfil = undefined;
    this.estadoService.setValor("selectedPerfil", undefined);
    this.estadoService.setValor("selectedIdPerfil", undefined);
    this.estadoService.setValor("seriesAsignadas", undefined);
    this.estadoService.setValor("selectedPerfilDetalle", undefined);
    this.serviciosAlarmaTab = 0;
  }

  ngProcesoCancelado(ver: boolean) {
    this.verAgregar = ver;
  }

  tecleado(event: any) {
    this.searchText = event.value;
  }

  limpiar() {
    this.searchText = "";
    this.inputSearh.setValue("");
  }

  async obtenerPerfiles() {
    this.error = false;
    this.isLoading = true;
    this.spinner.show("servicio-alarmas-loading");
    try {
      let resp = await this.perfilesService.obtenerPerfiles();
      if (resp["status"] == true) {
        this.perfiles = resp.data;
        this.estadoService.setValor("listaAlarmas", resp.data);
      } else {
        this.error = true;
        this.errorMsg = "Ha ocurrido un error al obtener los perfiles";
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = "Ha ocurrido un error al obtener los perfiles";
    }
    this.spinner.hide("servicio-alarmas-loading");
    this.isLoading = false;
  }

  async obtenerSeries() {
    this.error = false;
    this.isLoading = true;
    this.spinner.show("servicio-alarmas-loading");
    try {
      let idOficina = 0;
      let resp = await this.seriesService.obtenerSeriesPorOficina(this.localService.getValue("customer").slug, idOficina);
      if (resp["status"] == true) {
        this.series = resp.data;
      } else {
        this.error = true;
        this.errorMsg = "Ha ocurrido un error al obtener las series";
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = "Ha ocurrido un error al obtener las series";
    }
    this.spinner.hide("servicio-alarmas-loading");
    this.isLoading = false;
  }

  handleSelectSerie(perfil: any) {
    if (this.selectedIdPerfil !== perfil.id) {
      this.verAgregar = true;
      this.selectedIdPerfil = perfil.id;
      this.estadoService.setValor("agregarEditar", false);
      this.estadoService.setValor("selectedPerfil", perfil);
      this.estadoService.setValor("selectedIdPerfil", perfil.id);
      this.estadoService.setValor("listaSeries", this.series);
    }
  }
}
