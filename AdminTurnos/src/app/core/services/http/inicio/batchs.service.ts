import { lastValueFrom } from 'rxjs';
import { API_ENDPOINT } from '../../../config/config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class BatchsService {

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService
  ) { }

  async getBatchAtencion(slug: string, fechaIni: any,fechaFin:any) {
    const config = await this.configService.getConfig();
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/BatchAtecion?Slug=${slug}&fechaInicio=${fechaIni.toISOString()}&fechaFinal=${fechaFin.toISOString()}`;
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
  async getBatchMotivosAtencion(slug: string, fechaIni: any,fechaFin:any) {
    const config = await this.configService.getConfig();
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/BatchMotivoAtencion?Slug=${slug}&fechaInicio=${fechaIni.toISOString()}&fechaFinal=${fechaFin.toISOString()}`;
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
  async getBatchEstadosEjecutivos(slug: string, fechaIni: any,fechaFin:any) {
    const config = await this.configService.getConfig();
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/BatchEstadosEjecutivos?Slug=${slug}&fechaInicio=${fechaIni.toISOString()}&fechaFinal=${fechaFin.toISOString()}`;
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
}
