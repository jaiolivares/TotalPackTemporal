import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
//configuracion
import { Settings } from 'src/app/core/config/settings';
import { Config } from 'src/app/core/config/config';
//interfaces
import { ButtonData, EmitterData } from 'src/app/core/interfaces/emitter.interface';
import { CampaignRequest, CampaignResponse, RegisterEvtRequest } from 'src/app/core/interfaces/campaign.interface';
import { CustomerData, CustomerParams, DataOficina } from 'src/app/core/interfaces/customer.interface';
import { GlobalResponse, GlobalResponse2 } from 'src/app/core/interfaces/global.interface';
import { Images } from 'src/app/core/interfaces/images.interface';
import { SegmentationRes } from 'src/app/core/interfaces/segmentation.interface';
import { TurnRequest, TurnResponse } from 'src/app/core/interfaces/turn.interface';
import { TicketRequest, TicketResponse } from 'src/app/core/interfaces/ticket.interface';
//services
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CampaignService } from 'src/app/core/services/http/campaign.service';
import { CustomerService } from 'src/app/core/services/http/customer.service';
import { InternetService } from 'src/app/core/utils/internet.service';
import { PrinterService } from 'src/app/core/services/http/printer.service';
import { SegmentationService } from 'src/app/core/services/http/segmentation.service';
import { StorageService } from 'src/app/core/utils/storage.service';
import { SweetAlertService } from 'src/app/core/utils/sweetalert.service';
import { TicketService } from 'src/app/core/services/http/ticket.service';
import { TurnService } from 'src/app/core/services/http/turn.service';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {
  
  //variables en cache
  customer!: CustomerData;
  emitter!: EmitterData;
  rut!: string;
  selectedSerie!: ButtonData;
  selectedSubserie!: ButtonData;
  //rescatar imagenes de ticket, home y background
  images: Images = this.customerService.images.value;

  //servicios bchile
  segmentacion!: SegmentationRes;
  campaign!: CampaignResponse;

  //otros
  generatedTurn: boolean = false;
  error: boolean = false;
  turn!: TurnResponse;
  showTicket: boolean = false;
  showCounter: boolean = true;
  showCampana: boolean = false;
  counter: number = 10;
  counterInterval: any;
  timeoutVolver: any;
  imprimeTextoCampana: boolean = false;

  constructor(
    private authService: AuthService,
    private cache: StorageService,
    private campaignService: CampaignService,
    private customerService: CustomerService,
    private datePipe: DatePipe,
    private internetService: InternetService,
    private printerService: PrinterService,
    private router: Router,
    private segmentationService: SegmentationService, 
    private sweetAlertService: SweetAlertService,
    private ticketService: TicketService,
    private turnService: TurnService
  ) {
    this.customer = this.cache.getValue('customer') as CustomerData;
    this.emitter = this.cache.getValue('emitter') as EmitterData;
    this.rut = this.cache.getValue('client') as string;
    this.selectedSerie = this.cache.getValue('serie-selected') as ButtonData;
    this.selectedSubserie = this.cache.getValue('subserie-selected') as ButtonData;

    this.customerService.images.subscribe((res: Images) => this.images = res);
  }

  async ngOnInit(): Promise<void> {
    this.onSubmit();
  }

  async onSubmit(): Promise<void> {
    this.sweetAlertService.swalLoading();
    //validar conexión a internet
    const online: boolean = await this.internetService.checkApi(true);
    if(!online) { return }

    //recuperar seguimiento del banco
    await this.getSegmentation();
    
    //recuperar campaña del banco
    await this.getCampaign();

    //si no hay campaña se manda a generar el ticket
    if(!this.campaign) { this.emitTurn(); return; }

    //si hay campaña se registra el evento
    this.registrarEvento('PR');
    this.sweetAlertService.swalClose();

    if (this.showCounter) {
      clearInterval(this.counterInterval);
      this.startCounter();
      this.showCampana = true;
      this.timeoutVolver = setTimeout(() => {
        this.showCampana = false;
        this.emitTurn();
      }, 10000);
    } else {
      this.emitTurn();
    }
  }

  async getSegmentation(): Promise<void> {
    try {
      const response: GlobalResponse2<SegmentationRes> = await this.segmentationService.getSegmentation(this.rut.replace(/\./g, ""));
      if (response.status) { this.segmentacion = response.data; }
    } catch (error) {
      console.log("error al obtener segmentación: ", error); 
    }
  }

  async getCampaign(): Promise<void> {
    try {
      
      const data: CampaignRequest = {
        rut: this.rut.replace(/\./g, ""),
        canal: 'FILA',
        sucursal: this.cache.getValue('codOficina') ?? ''
      };

      const response: GlobalResponse2<CampaignResponse> = await this.campaignService.getCampaign(data);
      if (response.status) { this.campaign = response.data; }
    } catch (error) {
      console.log('error en consulta campaña: ', error);
    }
  }

  async emitTurn() {

    //validar que el turno no haya sido emitido
    if(this.generatedTurn) { return; }

    this.generatedTurn = true;

    try {
      const data: TurnRequest = {
        idOficina: this.emitter.idOficina,
        idSerie: this.selectedSubserie ? this.selectedSubserie.idSerie : this.selectedSerie.idSerie,
        idMenu: this.selectedSubserie && this.selectedSubserie.idSS ? this.selectedSubserie.idSS : 0,
        rut: this.rut.replace(/\./g, ""),
        cliente: "Sin nombre",
        data: JSON.stringify({
          segmento: this.segmentacion ? this.segmentacion.Respuesta.Prioridad : 0,
          imagen: ''
        }),
        fono: '0', 
        origen: 3, 
        fechaAgenda: '',
        priorizado: false
      }

      const turn: GlobalResponse2<TurnResponse[]> = await this.turnService.newTurn(data, this.customer.slug);
      if(!turn.status) {
        this.error = true;
        this.sweetAlertService.swalClose();
        await this.sweetAlertService.swalError('¡No se ha podido generar el ticket! Por favor comunícate con un administrador.');
        this.regresar();
        return;
      }

      //el turno se emitio correctamente
      this.turn = turn.data[0];
      this.cache.setValue('turn', this.turn);
      
      //valida si el turno es informativo
      this.turn.fInfo == 1 ? this.turnoInformativo() :  this.generateTicket();
    } catch (error) {
      console.log('error generando ticket: ', error);
      this.error = true;
      this.sweetAlertService.swalClose();
      await this.sweetAlertService.swalError('¡No se ha podido generar el ticket! Por favor comunícate con un administrador.');
      this.regresar();
    }    
  }      

  async generateTicket() {
    try {
      const params: CustomerParams = JSON.parse(this.customer.parametros);
      const oficina: DataOficina | undefined = params.oficinas.find((oficina: DataOficina) => oficina.id === this.emitter.idOficina);
      
      const data: TicketRequest = {
        letra: this.turn.letra,
        turno: this.turn.turno,
        fecha: this.datePipe.transform(new Date(this.turn.fechaEmision), 'yyyy-MM-dd HH:mm:ss')?.toString() ?? '',
        oferta: this.campaign ? this.campaign.CampanaImpresion : '',
        banco: oficina?.banco ?? 'chile',
        ancho: '',
        alto: '',
        urlQR: `${ Settings.url_seguimiento }/saas/${ this.customer.slug }/${ this.turn.idTurno }`,
        serie: this.selectedSerie.serieBoton,
        mensajeOpcional: Config.msgSeguimiento
      }
        
      const ticket: TicketResponse = await this.ticketService.crearTicket(data);
      this.sweetAlertService.swalClose();
      if(!ticket.status) {
        this.error = true;
        await this.sweetAlertService.swalError('¡No se ha podido generar el ticket! Por favor comunícate con un administrador.');
        this.regresar();
        return;
      }

      //ticket generado correctamente
      this.showTicket = true;
      this.printTicket(ticket.base64);    
    } catch (error) {
      this.sweetAlertService.swalClose();
      this.error = true;
      await this.sweetAlertService.swalError('¡No se ha podido generar el ticket! Por favor comunícate con un administrador.');
      this.regresar();                  
    }
  }

  async printTicket(base64: string): Promise<void> {
    try {
      const restPrint: GlobalResponse = await this.printerService.printTurno(base64);
      if (restPrint.status === false) {
        if (Config.simular.impresion != true) { this.sweetAlertService.swalNoImprime(); }
      }
      
      setTimeout(() => {
        this.regresar();
      }, 3000)
    } catch (error) {
      if (Config.simular.impresion != true) {
        this.sweetAlertService.swalNoImprime();
      }
      setTimeout(() => {
        this.regresar();
      }, 3000)
    }
  }  

  turnoInformativo() {
    this.sweetAlertService.swalClose();
    this.router.navigate(['/informative-ticket']);
  }
                      
  async regresar() {
    //validar la conexión a internet antes de ir a buscar cualquier cosa
    const response: boolean = await this.internetService.checkApi(true);
    if(!response) { return; }
    
    this.authService.logout();
  }

  async registrarEvento(respuesta: any) {
    let evento: string = this.getEvento(respuesta)
    clearTimeout(this.timeoutVolver);
    this.sweetAlertService.swalLoading();

    try {
      const data: RegisterEvtRequest = {
        sessionId: this.campaign.SessionID,
        rutCliente: this.rut.replace(/\./g, ""),
        telefonoCliente: this.campaign.Telefono,
        treatmentCode: this.campaign.TrackingCode,
        canal: 'FILA',
        segmento: this.segmentacion.Respuesta.Segmento,
        tipoVenta: '',
        evento: evento, //Presentado PR
        responseTypeCode: respuesta,
        codigoOferta: this.campaign.CodigoOferta,
        nombreCliente: this.campaign.NombreCliente,
        nombreOferta: this.campaign.TipoOferta,
        montoOferta: this.campaign.Monto,
      }

      await this.campaignService.registrarEvento(data);
      //define en true la bandera para imprimir posteriormente en ticket, si se acepta la campaña y si trae contenido a imprimir
      if (evento == 'Manifiesta_Interes' && this.campaign.CampanaImpresion != '') {
        this.imprimeTextoCampana = true;
      }

      if (evento != "Presentado") //no continúa a flujo de desición si el evento es "Presentado"
      {
        this.sweetAlertService.swalClose();
        this.showCampana = false;
        await this.emitTurn();
      }
    } catch (e) {
      if (evento != "Presentado") //no continúa a flujo de desición si el evento es "Presentado"
      {
        this.showCampana = false;
        await this.emitTurn();
      }
    }
  }

  getEvento(code: string): string {
    switch (code) {
      case 'PR':
        return 'Presentado';
      case 'RP':
        return 'Rechazado_Parcial';
      case 'MI':
        return 'Manifiesta_Interes';
      default:
        return '';
    }
  }

  startCounter() {
    this.counterInterval = setInterval(() => {
      this.counter--;
      if (this.counter === 0) {
        clearInterval(this.counterInterval);
        this.registrarEvento('RP');
      }
    }, 1000);
    this.showCounter = false;
  }
}
                        