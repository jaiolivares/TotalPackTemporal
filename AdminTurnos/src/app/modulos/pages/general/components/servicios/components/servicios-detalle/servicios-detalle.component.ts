import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ModalCodigosComponent } from '../modals/modal-codigos/modal-codigos.component';
import { Subscription } from 'rxjs';
import { ModalVistaPreviaTicketComponent } from '../modals/modal-vista-previa-ticket/modal-vista-previa-ticket.component';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import * as moment from 'moment';
import { minutesStringToSeconds, pad, secondsToMinuteString, secondsToString, stringNumbersToSeconds, stringToSeconds } from 'src/app/core/services/utils/utils';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-servicios-detalle',
  templateUrl: './servicios-detalle.component.html',
  animations: [
    trigger('openClose', [
      state('open', style({
          height: '*',
          opacity: '1',
          'visibility': 'visible'
      })),
      state('closed', style({
          height: '0px',
          opacity: '0',
          'margin-bottom': '-100px',
          'visibility': 'hidden'
      })),
      transition('open => closed', [
          animate('0.5s')
      ]),
      transition('closed => open', [
          animate('0.5s')
      ]),
  ]),
]
})
export class ServiciosDetalleComponent implements OnInit,OnDestroy {
  @Output() volver = new EventEmitter();
  @Input() data:any
  @ViewChild('ticketTextArea') ticketTextArea!: ElementRef;
  constructor(
    private seriesService:SeriesService,
    public formBuilder: FormBuilder,
    private swaalService: SweetAlertService,
    private localService: LocalService,
    private spinner: NgxSpinnerService
  ) { }

  submit = false;
  sinMotivos = false;
  isLoading = false;
  serie:any;
  tablaTicket:any;
  motivos:any;
  form!:FormGroup;

  modalEmitterSubscription: Subscription = new Subscription();
  horariosAtencionPorDia=[
    {
      id:1,
      dia:'Lunes',
      de:'00:00',
      hasta:'23:59',
      yde:'00:00',
      yhasta:'00:00',
      activo:1
    },
    {
      id:2,
      dia:'Martes',
      de:'00:00',
      hasta:'23:59',
      yde:'00:00',
      yhasta:'00:00',
      activo:1
    },
    {
      id:3,
      dia:'Miércoles',
      de:'00:00',
      hasta:'23:59',
      yde:'00:00',
      yhasta:'00:00',
      activo:1
    },
    {
      id:4,
      dia:'Jueves',
      de:'00:00',
      hasta:'23:59',
      yde:'00:00',
      yhasta:'00:00',
      activo:1
    },
    {
      id:5,
      dia:'Viernes',
      de:'00:00',
      hasta:'23:59',
      yde:'00:00',
      yhasta:'00:00',
      activo:1
    },
    {
      id:6,
      dia:'Sábado',
      de:'00:00',
      hasta:'23:59',
      yde:'00:00',
      yhasta:'00:00',
      activo:1
    },
    {
      id:7,
      dia:'Domingo',
      de:'00:00',
      hasta:'23:59',
      yde:'00:00',
      yhasta:'00:00',
      activo:1
    },
  ]
  async ngOnInit() {
    await this.obtenerSeriePorId();
    await this.obtenerMotivosPorSerie()
    this.vistaPreviaTicket()
    this.form = this.formBuilder.group({
      nombreSerie: new FormControl(this.serie.serie,  [Validators.required]),
      boton: new FormControl(this.serie.serieBoton,  [Validators.required]),
      exigeId: new FormControl(this.serie.exigeId,  [Validators.required]),
      info: new FormControl(this.serie.info,  [Validators.required]),
      vip: new FormControl(this.serie.vip,  [Validators.required]),
      valor: new FormControl(this.serie.valor,[Validators.required]),
      jornada: new FormControl(this.serie.jornada,  [Validators.required]),
      posDeriva: new FormControl(this.serie.posDeriva,  [Validators.required]),
      tiempoMaximoEspera: new FormControl(secondsToString(this.serie.tiempoMaximoEspera).replace(new RegExp(':', "g"),''),[Validators.required]),
      tiempoMaximoAtencion: new FormControl(secondsToString(this.serie.tiempoMaximoAtencion).replace(new RegExp(':', "g"),''),[Validators.required]),
      tiempoMinimoAtencion: new FormControl(secondsToString(this.serie.tiempoMinimoAtencion).replace(new RegExp(':', "g"),''),[Validators.required]),
      letra: new FormControl(this.serie.letra,[Validators.required,Validators.maxLength(1),Validators.pattern('[A-Za-z]')]),
      tipo: new FormControl(this.serie.tipo, [Validators.required]),
      descripcion: new FormControl(this.serie.descripcion),
      ticket: new FormControl(this.serie.ticket,[Validators.required]),
      dias: new FormControl("0"),
      horarioDe: new FormControl(new Date()),
      horarioHasta: new FormControl(new Date()),
      horarioYDe: new FormControl(new Date()),
      horarioYHasta: new FormControl(new Date()),
      infoMsg: new FormControl(this.serie.infoMsg)
    });
    const tiempoMaximoEspera= secondsToString(this.serie.tiempoMaximoEspera).replace(new RegExp(':', "g"),'')
    this.serie.tiempoMaximoEspera=  tiempoMaximoEspera[0]+tiempoMaximoEspera[1]+':'+tiempoMaximoEspera[2]+tiempoMaximoEspera[3]+':'+tiempoMaximoEspera[4]+tiempoMaximoEspera[5]
    const tiempoMaximoAtencion= secondsToString(this.serie.tiempoMaximoAtencion).replace(new RegExp(':', "g"),'')
    this.serie.tiempoMaximoAtencion=  tiempoMaximoAtencion[0]+tiempoMaximoAtencion[1]+':'+tiempoMaximoAtencion[2]+tiempoMaximoAtencion[3]+':'+tiempoMaximoAtencion[4]+tiempoMaximoAtencion[5]
    const tiempoMinimoAtencion= secondsToString(this.serie.tiempoMinimoAtencion).replace(new RegExp(':', "g"),'')
    this.serie.tiempoMinimoAtencion=  tiempoMinimoAtencion[0]+tiempoMinimoAtencion[1]+':'+tiempoMinimoAtencion[2]+tiempoMinimoAtencion[3]+':'+tiempoMinimoAtencion[4]+tiempoMinimoAtencion[5]
    this.setHorariosDefault();
    this.setHorariosFromData();
  }
  async obtenerSeriePorId(){
    this.isLoading = true;
    this.spinner.show("servicio-loading");
    const customer = this.localService.getValue('customer');
    let resp = await this.seriesService.obtenerSeriePorId(customer.slug,this.data.id);
    if(resp['status']){
      if(resp['data'].length > 0){
        this.serie = resp['data'][0];
      } else {
        this.swaalService.toastConfirm('error','No se encontró la serie');
        this.onVolver();
      }

     }else{
      this.swaalService.toastConfirm('error','Ocurrió un error al obtener la serie');
      this.onVolver();
     }
     this.isLoading = false;
     this.spinner.hide("servicio-loading");
  }
  async obtenerMotivosPorSerie(){
    this.isLoading = true;
    this.spinner.show("servicio-loading");
    const customer = this.localService.getValue('customer');
    let resp = await this.seriesService.obtenerMotivosPorSerie(customer.slug,this.data.id);
    if(resp['status']){
      if(resp['data'].length > 0){
        this.motivos = resp['data'];
      } else {
        this.swaalService.toastConfirm('error','No se encontraron motivos');
        this.sinMotivos=true;

      }

     }else{
      this.swaalService.toastConfirm('error','Ocurrió un error al obtener los motivos');
     }
     this.isLoading = false;
     this.spinner.hide("servicio-loading");
  }
  ngOnDestroy(): void {
    this.modalEmitterSubscription.unsubscribe();
  }
  setHorariosDefault(){
    const horarioDe = this.form.get('horarioDe')?.value;
    horarioDe.setHours(0)
    horarioDe.setMinutes(0)
    const horarioHasta = this.form.get('horarioHasta')?.value;
    horarioHasta.setHours(23)
    horarioHasta.setMinutes(59)
    const horarioYDe = this.form.get('horarioYDe')?.value;
    horarioYDe.setHours(0)
    horarioYDe.setMinutes(0)
    const horarioYHasta = this.form.get('horarioYHasta')?.value;
    horarioYHasta.setHours(0)
    horarioYHasta.setMinutes(0)
    this.form.patchValue({
      horarioDe,
      horarioHasta,
      horarioYDe,
      horarioYHasta
    })
  }
  setHorariosFromData(){
    this.horariosAtencionPorDia = this.horariosAtencionPorDia.map((dia:any,index:any)=>{
      let i = index
      if(i != 0){
        i = i*2;
      }
      const de = this.serie.hI1[i]+this.serie.hI1[i+1]+':'+this.serie.mI1[i]+this.serie.mI1[i+1];
      const hasta = this.serie.hF1[i]+this.serie.hF1[i+1]+':'+this.serie.mF1[i]+this.serie.mF1[i+1]
      return {...dia,
        de,
        hasta,
        yde:this.serie.hI2[i]+this.serie.hI2[i+1]+':'+this.serie.mI2[i]+this.serie.mI2[i+1],
        yhasta:this.serie.hF2[i]+this.serie.hF2[i+1]+':'+this.serie.mF2[i]+this.serie.mF2[i+1],
        activo: de == '00:00' && hasta == '00:00' ? 0 : 1
      }

    })
  }


  onVolver(){
    this.volver.emit()
  }
  vistaPreviaTicket() {
    let sRow   = '';
    let bHexa  = false;
    let bWidth = false;
    let bGraf  = false;
    let bControl  = false;
    let sAlign = 'left';
    let sFont  = '';
    let sFontO = '';
    let outerTable = '';
    let table = '';
    let text = [];
    let texto = '';

    outerTable =  '<table width="70%" class="bg-white" border="1" cellspacing="0" cellpadding="0">' +
                  '<tr>' +
                  '<td>' +
                  '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                  '<tr><td>&nbsp;</td></tr>'+
                  '<tr><td>&nbsp;</td></tr>';

    let ticket = this.serie.ticket.split(/\r?\n/);
    for(let i=0; i<ticket.length; i++){
      let tick = ticket[i].split("\\");
      for(let j=0; j<tick.length; j++){
        text = tick[j].split(/(\d+)/);

        if(text[2] !== '' && text[2] !== undefined){
          sRow = text[2];
        }

        if(tick[j] !== '') {
          sRow = tick[j].replace(/[0-9]/g, '');
        }

        switch(tick[j].substring(0, 2)){
          case '01': // align Izquierda
            sAlign = 'left';
            break;
          case '02': // align Centro
            sAlign = 'center';
            break;
          case '03': // align Derecha
            sAlign = 'right';
            break;
          case '04': // font A
            sFont = 'TKFA';
            bWidth = false;
            break;
          case '05': // font A Ancho
            sFont = 'TKFAW';
            bWidth = true;
            break;
          case '06': // font A Alto
            sFont = 'TKFAH';
            bWidth = false;
            break;
          case '07': // font A Ancho-Alto
            sFont = 'TKFAWH';
            bWidth = false;
            break;
          case '08': // font A Negrita
            sFont = 'TKFAB';
            bWidth = false;
            break;
          case '09': // font A Negrita Ancho
            sFont = 'TKFAWB';
            bWidth = true;
            break;
          case '10': // font A Negrita Alto
            sFont = 'TKFAHB';
            bWidth = false;
            break;
          case '11': // font A Negrita Ancho-Alto
            sFont = 'TKFAWHB';
            bWidth = false;
            break;
          case '12': // font B
            sFont = 'TKFB';
            bWidth = false;
            break;
          case '13': // font B Ancho
            sFont = 'TKFBW';
            bWidth = true;
            break;
          case '14': // font B Alto
            sFont = 'TKFBH';
            bWidth = false;
            break;
          case '15': // font B Ancho-Alto
            sFont = 'TKFBWH';
            bWidth = false;
            break;
          case '16': // font B Negrita
            sFont = 'TKFBB';
            bWidth = false;
            break;
          case '17': // font B Negrita Ancho
            sFont = 'TKFBWB';
            bWidth = true;
            break;
          case '18': // font B Negrita Alto
            sFont = 'TKFBHB';
            bWidth = false;
            break;
          case '19': // font B Negrita Ancho-Alto
            sFont = 'TKFBWHB';
            bWidth = false;
            break;
          case '21': // Letra Turno (texto)
            sRow += 'A 123';
            break;
          case '22': // Turno (texto)
            sRow += 'A123';
            break;
          case '23': // Letra Turno (gráfico)
            sFontO = sFont;
            sFont  = 'TKFG';
            sRow += 'A 123';
            bGraf = true;
            break;
          case '24': // Turno (gráfico)
            sFontO = sFont;
            sFont  = 'TKFG';
            sRow += '123';
            bGraf = true;
            break;
          case '25': // Fecha
            sRow += '03/06/2010';
            break;
          case '26': // Hora
            sRow += ' 16:45';
            break;
          case '27': // Tiempo de Espera
            sRow += '15';
            break;
          case '28': // Raya doble
            sRow += '================';
            break;
          case '29': // Raya simple
            sRow += '----------------';
            break;
          case '90': // Hexa ini
            bHexa = true;
            break;
          case '91': // Hexa fin
            bHexa = false;
            break;
          default:
            bControl = false;
            break;
        }
      }
      if(sRow !== '') {
        table += `  <tr align="${sAlign}">
                      <td class="${sFont}">${sRow}</td>
                    </tr>`;
      }
      sRow = '';
    }

    let tablaFinal = outerTable + table;
    tablaFinal += '<tr><td>&nbsp;</td></tr>' +
                  '<tr><td>&nbsp;</td></tr>' +
                  '</table>' +
                  '</td>' +
                  '</tr>' +
                  '</table>';
    this.tablaTicket = tablaFinal;
  }

}
