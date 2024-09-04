import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { API_ENDPOINT } from 'src/app/core/config/config';

@Injectable({
  providedIn: 'root'
})
export class PantallasService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }

  async obtenerPantallas(idOficinaCustomer:string):Promise<any>{
    const url = `${API_ENDPOINT.apiCustomer}/PantallaTurno/ObtenerPantallasTurno?idOficinaCustomer=${idOficinaCustomer}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': API_ENDPOINT.ApiKey
    });

    try {
      return lastValueFrom(this.httpClient.get(url, { headers: headers }))
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async obtenerSeriesPorPantalla(idPantalla:string):Promise<any>{
    const url = `${API_ENDPOINT.apiCustomer}/PantallaView/ObtenerPantallasTurnoView?idPantalla=${idPantalla}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': API_ENDPOINT.ApiKey
    });

    try {
      return lastValueFrom(this.httpClient.get(url, { headers: headers }))
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async asignarSerieAPantalla(data:any, idLogin:any):Promise<any>{
    const url = `${API_ENDPOINT.apiCustomer}/PantallaView/CrearPantallaTurnoView?idLogin=${idLogin}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': API_ENDPOINT.ApiKey
    });

    try {
      return lastValueFrom(this.httpClient.post(url,data, { headers: headers }))
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async desasignarSerieAPantalla(idPantallaTurnoView:any,idLogin:any):Promise<any>{
    const url = `${API_ENDPOINT.apiCustomer}/PantallaView/EliminarPantallaTurnoView?idLogin=${idLogin}&idPantallaTurnoView=${idPantallaTurnoView}`;
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': API_ENDPOINT.ApiKey
    });
    try {
      return lastValueFrom(this.httpClient.delete(url, { headers: headers }))
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

}
