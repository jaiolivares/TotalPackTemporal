import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { API_ENDPOINT } from 'src/app/core/config/config';
import { ConfigService } from '../../config/config.service';
import { LocalService } from '../../storage/local.service';

@Injectable({
  providedIn: 'root'
})
export class BotonesService {

  constructor(private config: ConfigService, private httpClient:HttpClient, private localService: LocalService) { }

  async obtenerBotonesSeries(slug:any, idOficina:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Botones/ObtenerBotonesSeries?Slug=${slug}&idOficina=${idOficina}`;
    try {
      return await lastValueFrom(
        this.httpClient.get(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  // Detalle de botones de un emisor
  async obtenerBotonesEnEmisor(slug:any, idOficina:any, idEmisor: any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Botones/ObtenerBotones?Slug=${slug}&idOficina=${idOficina}&idEmisor=${idEmisor}`;
    try {
      return await lastValueFrom(
        this.httpClient.get(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  // Detalle de los botones de los emisores
  async obtenerListadoEmisores(slug:any, idOficina:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Botones/ObtenerBotones?Slug=${slug}&idOficina=${idOficina}&idEmisor=0`;
    try {
      return await lastValueFrom(
        this.httpClient.get(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  
  async asignarBotones(slug:any, data:any): Promise<any> {
    const usuario = this.localService.getValue('usuario');
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Botones/AsignarBotones?Slug=${slug}&idUsuario=${usuario.idUsuario}`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url,data, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
}
