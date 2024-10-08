import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
//interfaces
import { ButtonData, EmitterData } from "src/app/core/interfaces/emitter.interface";
import { Config } from "src/app/core/config/config";
import { CustomerData } from "src/app/core/interfaces/customer.interface";
import { GlobalResponse } from "src/app/core/interfaces/global.interface";
import { GlobalResponse2 } from "src/app/core/interfaces/global.interface";
//services
import { DniService } from "src/app/core/utils/dni.service";
import { EmitterService } from "src/app/core/services/http/emitter.service";
import { InternetService } from "src/app/core/utils/internet.service";
import { PrinterService } from "src/app/core/services/http/printer.service";
import { StorageService } from "src/app/core/utils/storage.service";
import { SweetAlertService } from "src/app/core/utils/sweetalert.service";
import { AuthService } from "src/app/core/services/auth/auth.service";
import { ConsaludService } from "src/app/core/services/http/consalud.service";
import { DataService } from 'src/app/core/utils/data.service';
import { DataAfiliado, DataMensajeAtencion, DataCaminaContigo } from "src/app/core/interfaces/afiliado.interface";
import { RequestDataAfiliado, RequestMensajeAtencion, RequestCaminaContigo } from "src/app/core/interfaces/requests/emitter.interface";

@Component({
  selector: "app-dni",
  templateUrl: "./dni.component.html",
  styleUrls: ["./dni.component.css"],
})
export class DniComponent implements OnInit {
  //variables en cache
  emitter!: EmitterData;
  customer!: CustomerData;
  //formulario
  rut: FormControl = new FormControl("", [Validators.required, this.dniService.validarRut([])]);
  isSubmitted: boolean = false;

  constructor(
    private cache: StorageService,
    private dniService: DniService,
    private emitterService: EmitterService,
    private internetService: InternetService,
    private printerService: PrinterService,
    private router: Router,
    private sweetAlertService: SweetAlertService,
    private authService: AuthService,
    private consaludService: ConsaludService,
    private dataService: DataService
  ) {
    this.customer = this.cache.getValue("customer") as CustomerData;
    this.emitter = this.cache.getValue("emitter") as EmitterData;
  }

  async ngOnInit(): Promise<void> {
    this.authService.stopWatching();
  }

  keypress(key: any) {
    if (this.rut.value.length < 12) {
      this.rut.setValue(this.dniService.formaterRut(this.rut.value + key));
    }
  }

  deleteKey() {
    let dni = this.rut.value.substr(0, this.rut.value.length - 1);
    this.rut.setValue(this.dniService.formaterRut(dni));
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;

    //valida que el rut sea valido
    if (this.rut.invalid) { return; }

    try {
      this.sweetAlertService.swalLoading();

      //validar conexión a internet
      const online: boolean = await this.internetService.checkApi(true);
      if (!online) { return; }

      //valida que la impresora este conectada
      const impresora: GlobalResponse = await this.printerService.printerStatus();
      if(!impresora.status) {
        this.sweetAlertService.swalNoImprime();
        return;
      }

      //parsea el rut y separa el dv de la mantisa
      const rut = this.rut.value.replace(/\./g, "");
      const splitRut = rut.split("-");
      this.dataService.setValue("Rut", this.rut.value);

      //obtener nombre del afiliado
      const dataAfiliado: RequestDataAfiliado = { rutPers: splitRut[0] };
      const responseAfiliado: GlobalResponse2<DataAfiliado> = await this.consaludService.ObtenerNombreAfiliado(dataAfiliado);
      //si el afiliado posee un nombre, se asignar para la posterior emisión de ticket
      const nombre: string = responseAfiliado.status && responseAfiliado.data.data ? responseAfiliado.data.data : "Sin nombre";
      this.dataService.setValue('Nombre', nombre);

      //validar si el usuario tiene oferta
      await this.ObtenerOfertaUsuario(rut);

      //CAMINA CONTIGO
      const dataCC: RequestCaminaContigo = { rut: splitRut[0] };
      const responseCC: GlobalResponse2<DataCaminaContigo> = await this.consaludService.CaminaContigo(dataCC);
      
      //si pertenece al grupo camina contigo debo emitir un ticket de inmediato
      if (responseCC.status && responseCC.data.data.beneficiarioAnfitrion.grupoPrioritario?.toUpperCase() === "CAMINA CONTIGO") {
        this.dataService.setValue("CaminaContigo", true);
        this.sweetAlertService.swalClose();
        this.router.navigate(["/ticket"]);
        return;
      }


      //ejecutar servicio para obtener series
      const idEmitter: number = this.cache.getValue("multi-emitter") ?? 1;
      const response: GlobalResponse2<ButtonData[]> = await this.emitterService.getButtons(this.customer.slug, this.emitter.idOficina, idEmitter);
      if (!response.status) {
        this.sweetAlertService.swalClose();
        this.sweetAlertService.swalError("¡No se han podido cargar las series! Por favor comunícate con un administrador.");
        return;
      }

      //extraer series que "tienen" subseries pero no poseen ninguna asignada
      let series: ButtonData[] = response.data.filter((serie: ButtonData) => {
        // Si tieneSS es 0, incluir la serie
        if (serie.tieneSS === 0) {
          return true;
        } else if (serie.tieneSS === 1) {
          return response.data.some((subserie: ButtonData) => subserie.idSerieM === serie.idSerie);
        } else {
          return false;
        }
      });

      //valida que las series no posean una serie madre
      const seriesM: ButtonData[] = series.filter((series: ButtonData) => {
        return series.idSerieM == 0;
      });

      this.sweetAlertService.swalClose();

      this.dataService.setValue("CaminaContigo", false);
      this.dataService.setValue("Series", series);
      this.dataService.setValue("SeriesM", seriesM);
      this.authService.idleUser(); // inicia el timer de inactividad
  
      //redireccionar a la siguiente vista
      this.router.navigate(["/series"]);
    } catch (error) {
      this.sweetAlertService.swalClose();
      this.sweetAlertService.swalError("¡No se han podido cargar las series! Por favor comunícate con un administrador.");
    }
  }

  async ObtenerOfertaUsuario(rut: string) {
    const splitR = rut.split("-");

    const data: RequestMensajeAtencion = {
      dvCliente: splitR[1],
      rutCliente: splitR[0],
      idSerie: Config.idSerieCC,
      sucursal: this.cache.getValue('codOficina'),
    };

    const response: GlobalResponse2<DataMensajeAtencion> = await this.consaludService.MensajeTicket(data);
    const oferta: string | null = response.status && response.data.data.tieneMensaje === "S" ? response.data.data.mensaje : "";
    const prioridad: number | null = response.status && response.data.data.prioridad ? response.data.data.prioridad : 0;

    this.dataService.setValue("Oferta", oferta);
    this.dataService.setValue("Prioridad", prioridad);
  }
}
