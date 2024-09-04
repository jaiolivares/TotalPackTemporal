import { lastValueFrom } from 'rxjs';
import { API_ENDPOINT } from '../../../config/config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalService } from '../../storage/local.service';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class DetalleOficinasService {

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService
  ) { }

  async getDetalleOficinas(slug: string, idUsuario: string,idOficina:string) {
    const config = await this.configService.getConfig();
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/DetalleDeOficinas?Slug=${slug}&idUsuario=${idUsuario}&idOficina=${idOficina}`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
    try {
      return await lastValueFrom(
        this.httpClient.get(url, { headers: headers })
      );
    } catch (error: any) {
      return { status: error.status, code: error.code, message: error.message };
    }
  }
  async getInfoTurnosGeneral(slug: string, idUsuario: string,idOficina:string) {
    const config = await this.configService.getConfig();
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/ListaTurnos?Slug=${slug}&idUsuario=${idUsuario}&idOficina=${idOficina}`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
    try {
      return await lastValueFrom(
        this.httpClient.get(url, { headers: headers })
      );
    } catch (error: any) {
      return { status: error.status, code: error.code, message: error.message };
    }
  }
  async getInfoTurnosEspera(slug: string, idUsuario: string,idOficina:string) {
    const config = await this.configService.getConfig();
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/ListaTurnosEnEspera?Slug=${slug}&idUsuario=${idUsuario}&idOficina=${idOficina}`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
    try {
      return await lastValueFrom(
        this.httpClient.get(url, { headers: headers })
      );
    } catch (error: any) {
      return { status: error.status, code: error.code, message: error.message };
    }
  }
  async derivarTurno(slug:any,idTurno:any,idEsc:any): Promise<any> {
    const config = await this.configService.getConfig();
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/DerivarTurno?Slug=${slug}&idTurno=${idTurno}&idEsc=${idEsc}`;
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
}
