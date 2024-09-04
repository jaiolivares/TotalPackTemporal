import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ModalService } from 'src/app/core/services/utils/modal.service';

@Component({
  selector: 'app-modal-vista-previa-ticket',
  templateUrl: './modal-vista-previa-ticket.component.html',
})
export class ModalVistaPreviaTicketComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    public formBuilder: FormBuilder,
  ) {}
  data: any;
  selectedCodigo:any;
  ticketTextArea:any;
  tablaTicket!:any;
  async ngOnInit() {
    this.ticketTextArea = this.data.ticketTextArea;
    this.vistaPreviaTicket();
  }
  closeModal() {
    this.modalService.closeModal('modal-vista-previa-ticket');
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

    outerTable =  '<table width="100%" border="1" cellspacing="0" cellpadding="0">' +
                  '<tr>' +
                  '<td>' +
                  '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
                  '<tr><td>&nbsp;</td></tr>'+
                  '<tr><td>&nbsp;</td></tr>';

    let ticket = this.ticketTextArea.split(/\r?\n/);
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
