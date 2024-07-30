import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
//interfaces
import { GlobalResponse2 } from "../../interfaces/global.interface";
import { RequestAsignarNumero, RequestCaminaContigo, RequestDataAfiliado, RequestMensajeAtencion } from "src/app/core/interfaces/requests/emitter.interface";
import { DataAsignarNumero, DataAfiliado, DataCaminaContigo, DataMensajeAtencion } from "src/app/core/interfaces/responses/emitter.interface";
import { Settings } from "../../config/settings";

import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ConsaludService {
  headers = new HttpHeaders({
    accept: "application/json",
    "Content-Type": "application/json",
  });

  constructor(private http: HttpClient) {}

  async AsignarNumero(data: RequestAsignarNumero): Promise<GlobalResponse2<DataAsignarNumero>> {
    try {
      const url = `${Settings.api_consalud.url}api/v1/Emitter/AsignarNumero`;
      const headers = this.headers.set("ApiKey", Settings.api_consalud.apiKey);
      return await lastValueFrom(this.http.post<GlobalResponse2<DataAsignarNumero>>(url, data, { headers }));
    } catch (error) {
      throw error;
    }
  }

  async CaminaContigo(data: RequestCaminaContigo): Promise<GlobalResponse2<DataCaminaContigo>> {
    try {
      const url = `${Settings.api_consalud.url}api/v1/Emitter/ListaBeneficiariosTTP`;
      const headers = this.headers.set("ApiKey", Settings.api_consalud.apiKey);
      return await lastValueFrom(this.http.post<GlobalResponse2<DataCaminaContigo>>(url, data, { headers }));
    } catch (error) {
      throw error;
    }
  }

  async MensajeTicket(data: RequestMensajeAtencion): Promise<GlobalResponse2<DataMensajeAtencion>> {
    try {
      const url = `${Settings.api_consalud.url}api/v1/Emitter/MensajeAtencion`;
      const headers = this.headers.set("ApiKey", Settings.api_consalud.apiKey);
      return await lastValueFrom(this.http.post<GlobalResponse2<DataMensajeAtencion>>(url, data, { headers }));
    } catch (error) {
      throw error;
    }
  }

  async ObtenerNombreAfiliado(body: RequestDataAfiliado): Promise<GlobalResponse2<DataAfiliado>> {
    try {
      const url = `${Settings.api_consalud.url}api/v1/Emitter/ConsultaNombreAfiliado`;
      const headers = this.headers.set("ApiKey", Settings.api_consalud.apiKey);
      return await lastValueFrom(this.http.post<GlobalResponse2<DataAfiliado>>(url, body, { headers }));
    } catch (error) {
      throw error;
    }
  }
}
