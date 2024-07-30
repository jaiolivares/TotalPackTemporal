import { Injectable } from '@angular/core';
import { TicketRequest, TicketResponse } from '../../interfaces/ticket.interface';
import { lastValueFrom } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
//configuracion
import { Settings } from '../../config/settings';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  headers: HttpHeaders =  new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  async crearTicket(body: TicketRequest): Promise<TicketResponse> {
    try {
      const url = `${Settings.api_ticket.url}api/v1/Impresion/CrearTurno_BChile`;
      return await lastValueFrom(this.http.post<TicketResponse>(url, body));
    } catch (error) { throw(error) }
  }
}
