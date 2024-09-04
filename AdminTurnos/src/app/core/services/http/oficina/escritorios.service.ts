import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { API_ENDPOINT } from 'src/app/core/config/config';

@Injectable({
  providedIn: 'root'
})
export class EscritoriosService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }
  async obtenerEscritorios(slug: string, idOficina:string):Promise<any>{
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=ESC&id=${idOficina}`;

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
  async obtenerEscritorio(slug: string, idOficina:string, idEscritorio:string):Promise<any>{
    const url = `${API_ENDPOINT.apiAdmin2}/Escritorio/ObtenerEscritorio?Slug=${slug}&idOficina=${idOficina}&idEscritorio=${idEscritorio}`;

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
  async agregarEscritorio(slug: string,data:any):Promise<any>{
    const url = `${API_ENDPOINT.apiAdmin2}/Escritorio/AgregarEscritorio?Slug=${slug}`;

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
  async editarEscritorio(slug: string,data:any):Promise<any>{
    const url = `${API_ENDPOINT.apiAdmin2}/Escritorio/EditarEscritorio?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': API_ENDPOINT.ApiKey
    });

    try {
      return lastValueFrom(this.httpClient.put(url,data, { headers: headers }))
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async eliminarEscritorio(slug: string, idOficina:string,idUser:string, idEscritorio:string,):Promise<any>{
    const url = `${API_ENDPOINT.apiAdmin2}/Escritorio/EliminarEscritorio?Slug=${slug}&iduser=${idUser}&idOficina=${idOficina}&idEscritorio=${idEscritorio}`;
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
