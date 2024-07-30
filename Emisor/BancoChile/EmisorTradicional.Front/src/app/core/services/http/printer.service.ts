import { Injectable } from '@angular/core';
import { GlobalResponse } from 'src/app/core/interfaces/global.interface';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TicketRequest, TicketResponse } from '../../interfaces/ticket.interface';
//configuracion
import { Settings } from '../../config/settings';
import { Config } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  })

  constructor(private http: HttpClient) { }

  async printerStatus(): Promise<GlobalResponse> {
    try {
      const url = `${Settings.api_impresion.url}api/v1/PrinterStatus`;
      //validar si esta la respuesta a simular
      if(Config.simular.impresion) { return { status: true, code: 200, message: "OK" } as GlobalResponse }

      //si no esta simulado se ejecuta el servicio
      return await lastValueFrom(this.http.get<GlobalResponse>(url, {headers: this.headers}));
    } catch(error) {
      return { status: false } as GlobalResponse;
    }
  }

  async printTurno(base64: string): Promise<GlobalResponse> {
    try {
      const url: string = `${Settings.api_impresion.url}api/v1/PrintTerm64`;
      return await lastValueFrom(this.http.post<GlobalResponse>(url,{ document:base64 }, { headers: this.headers }));
    } catch(error) { throw(error); }
  }
}
