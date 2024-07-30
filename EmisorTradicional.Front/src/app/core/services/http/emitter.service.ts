import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
//interfaces
import { ButtonData, EmitterData } from 'src/app/core/interfaces/emitter.interface';
import { GlobalResponse2 } from '../../interfaces/global.interface';
//configuration
import { Settings } from '../../config/settings';

@Injectable({
  providedIn: 'root'
})
export class EmitterService {

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    ApiKey: Settings.api_turno.apiKey,
  })

  constructor(private http: HttpClient) { }

  async validateEmitter(idEmitter: string): Promise<EmitterData[]>{
    try {
      const url = `${ Settings.api_turno.url }Turno/v1/emisor?id=${idEmitter}`;
      return await lastValueFrom(this.http.get<EmitterData[]>(url, { headers: this.headers }));
    } catch (error) { throw(error) }
  }

   //Endpoint Admin v40 auxiliar
   async getButtons(slug: string, idOffice: number, idEmitter: number): Promise<GlobalResponse2<ButtonData[]>> {
     try {
      const url = `${ Settings.api_auxiliar.url }api/v1/Turno/ObtenerBoton?Slug=${ slug }&idOficina=${ idOffice }&idEmisor=${ idEmitter }`;
      const headers = this.headers.set('ApiKey', Settings.api_auxiliar.apiKey);
      return await lastValueFrom(this.http.get<GlobalResponse2<ButtonData[]>>(url, { headers }));
    } catch (error) { throw(error) }
  }
}
