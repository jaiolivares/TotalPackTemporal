import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
//interfaces
import { ButtonData, EmitterData } from "src/app/core/interfaces/emitter.interface";
import { Config } from "src/app/core/config/config";
import { CustomerData, CustomerParams, DataOficina } from "src/app/core/interfaces/customer.interface";
import { GlobalResponse, GlobalResponse2 } from "src/app/core/interfaces/global.interface";
import { Images } from "src/app/core/interfaces/images.interface";
import { TurnRequest, TurnResponse } from "src/app/core/interfaces/turn.interface";
import { TicketRequest, TicketResponse } from "src/app/core/interfaces/ticket.interface";
//services
import { AuthService } from "src/app/core/services/auth/auth.service";
import { CustomerService } from "src/app/core/services/http/customer.service";
import { InternetService } from "src/app/core/utils/internet.service";
import { PrinterService } from "src/app/core/services/http/printer.service";
import { StorageService } from "src/app/core/utils/storage.service";
import { SweetAlertService } from "src/app/core/utils/sweetalert.service";
import { TicketService } from "src/app/core/services/http/ticket.service";
import { TurnService } from "src/app/core/services/http/turn.service";
import { RequestAsignarNumero } from "src/app/core/interfaces/requests/emitter.interface";
import { ConsaludService } from "src/app/core/services/http/consalud.service";

@Component({
  selector: "app-ticket",
  templateUrl: "./ticket.component.html",
  styleUrls: ["./ticket.component.css"],
})
export class TicketComponent implements OnInit {
  //variables en cache
  customer!: CustomerData;
  emitter!: EmitterData;
  rut!: string;
  nombre!: string;
  oferta!: string;
  prioridad!: number;
  caminaContigo: boolean = false;
  selectedSerie!: ButtonData;
  selectedSubserie!: ButtonData;

  //rescatar imagenes de ticket, home y background
  images: Images = this.customerService.images.value;

  //otros
  generatedTurn: boolean = false;
  error: boolean = false;
  turn!: TurnResponse;
  showTicket: boolean = false;
  timeoutVolver: any;
  viewTurno: boolean = false;

  constructor(
    private authService: AuthService,
    private cache: StorageService,
    private customerService: CustomerService,
    private datePipe: DatePipe,
    private internetService: InternetService,
    private printerService: PrinterService,
    private router: Router,
    private sweetAlertService: SweetAlertService,
    private ticketService: TicketService,
    private turnService: TurnService,
    private consaludService: ConsaludService
  ) {
    this.customer = this.cache.getValue("customer") as CustomerData;
    this.emitter = this.cache.getValue("emitter") as EmitterData;
    this.rut = this.cache.getValue("client") as string;
    this.nombre = this.cache.getValue("nombre") as string;
    this.oferta = this.cache.getValue("oferta") as string;
    this.prioridad = this.cache.getValue("prioridad") as number;
    this.caminaContigo = this.cache.getValue("caminaContigo") as boolean;
    this.selectedSerie = this.cache.getValue("serie-selected") as ButtonData;
    this.selectedSubserie = this.cache.getValue("subserie-selected") as ButtonData;

    this.customerService.images.subscribe((res: Images) => (this.images = res));
  }

  async ngOnInit(): Promise<void> {
    this.onSubmit();
  }

  async onSubmit(): Promise<void> {
    this.sweetAlertService.swalLoading();

    //validar conexión a internet
    const online: boolean = await this.internetService.checkApi(true);
    if (!online) {
      return;
    }

    setTimeout(() => {
      this.viewTurno = true;
    }, 2100);

    this.emitTurn();
  }

  async emitTurn() {
    //validar que el turno no haya sido emitido
    if (this.generatedTurn) {
      return;
    }

    this.generatedTurn = true;

    try {
      let data: TurnRequest;

      if (this.caminaContigo) {
        data = {
          idOficina: Config.idOficina,
          idSerie: Config.idSerieCC,
          idMenu: 0,
          rut: this.rut,
          cliente: this.nombre,
          data: JSON.stringify({
            prioridad: this.prioridad,
          }),
          fono: "0",
          origen: 6,
          fechaAgenda: "",
          priorizado: false,
        };
      } else {
        data = {
          idOficina: this.emitter.idOficina,
          idSerie: this.selectedSubserie ? this.selectedSubserie.idSerie : this.selectedSerie.idSerie,
          idMenu: this.selectedSubserie && this.selectedSubserie.idSS ? this.selectedSubserie.idSS : 0,
          rut: this.rut,
          cliente: this.nombre,
          data: JSON.stringify({
            prioridad: this.prioridad,
          }),
          fono: "0",
          origen: 6,
          fechaAgenda: "",
          priorizado: false,
        };
      }

      const turn: GlobalResponse2<TurnResponse[]> = await this.turnService.newTurn(data, this.customer.slug);

      if (!turn.status) {
        this.error = true;
        this.sweetAlertService.swalClose();
        await this.sweetAlertService.swalError("¡No se ha podido generar el ticket! Por favor comunícate con un administrador.");
        this.regresar();
        return;
      }

      //el turno se emitio correctamente
      this.turn = turn.data[0];
      this.cache.setValue("turn", this.turn);

      this.AsignarNumero();

      //valida si el turno es informativo
      this.turn.fInfo == 1 ? this.turnoInformativo() : this.generateTicket();
    } catch (error) {
      console.log("error generando ticket: ", error);
      this.error = true;
      this.sweetAlertService.swalClose();
      await this.sweetAlertService.swalError("¡No se ha podido generar el ticket! Por favor comunícate con un administrador.");
      this.regresar();
    }
  }

  turnoInformativo() {
    this.sweetAlertService.swalClose();
    this.router.navigate(["/informative-ticket"]);
  }

  async AsignarNumero() {
    try {
      const splitRut = this.rut.split("-");
      const data: RequestAsignarNumero = {
        rutCliente: splitRut[0],
        dvCliente: splitRut[1],
        numero: this.turn.letra + this.turn.turno,
        idSerie: this.caminaContigo ? Config.idSerieCC : this.selectedSerie.idSerie,
        sucursal: Config.codigoOficina,
      };
      await this.consaludService.AsignarNumero(data);
    } catch (error) {
      console.log("Error al asignar número en consalud: ", error);
    }
  }

  async generateTicket() {
    try {
      const data: TicketRequest = {
        letra: this.turn.letra,
        turno: this.turn.turno,
        fecha: this.datePipe.transform(new Date(this.turn.fechaEmision), "yyyy-MM-dd HH:mm:ss")?.toString() ?? "",
        oferta: this.oferta ?? "",
        fila: `******* Hay ${this.turn.qEspSer} ${this.turn.qEspSer == 1 ? "persona" : "personas"} antes que tú *******`,
        urlQR: "",
        serie: this.caminaContigo ? "" : this.selectedSerie.serieBoton,
        mensajeOpcional: Config.mensajeOpcional,
      };

      const ticket: TicketResponse = await this.ticketService.crearTicket(data);
      this.sweetAlertService.swalClose();
      if (!ticket.status) {
        this.error = true;
        await this.sweetAlertService.swalError("¡No se ha podido generar el ticket! Por favor comunícate con un administrador.");
        this.regresar();
        return;
      }

      //ticket generado correctamente
      this.showTicket = true;
      this.printTicket(ticket.base64);
    } catch (error) {
      this.sweetAlertService.swalClose();
      this.error = true;
      await this.sweetAlertService.swalError("¡No se ha podido generar el ticket! Por favor comunícate con un administrador.");
      this.regresar();
    }
  }

  async printTicket(base64: string): Promise<void> {
    try {
      const restPrint: GlobalResponse = await this.printerService.printTurno(base64);
      if (restPrint.status === false) {
        if (Config.simular.impresion != true) {
          this.sweetAlertService.swalNoImprime();
        }
      }

      setTimeout(() => {
        this.regresar();
      }, 3000);
    } catch (error) {
      if (Config.simular.impresion != true) {
        this.sweetAlertService.swalNoImprime();
      }
      setTimeout(() => {
        this.regresar();
      }, 3000);
    }
  }

  async regresar() {
    //validar la conexión a internet antes de ir a buscar cualquier cosa
    const response: boolean = await this.internetService.checkApi(true);
    if (!response) {
      return;
    }

    this.authService.logout();
  }
}
