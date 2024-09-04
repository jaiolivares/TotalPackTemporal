import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { API_ENDPOINT } from 'src/app/core/config/config';
import { LocalService } from '../../storage/local.service';
import { AesService } from '../../utils/aes.service';

@Injectable({
  providedIn: 'root'
})
export class ServiciosAgendaService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
    private localService: LocalService,
    private aesService: AesService
  ) { }

  async obtenerServicios(): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAgenda}/Schedule/GetScheduleSeriesList`;
    const customerSlug = this.localService.getValue('customer').slug
    try {
      return await lastValueFrom(
        this.httpClient.post(url,{
          data: this.aesService.aesEncrypt(JSON.stringify({Slug:customerSlug.replace('ttp_','')}))
        }, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['apiKeyAgenda'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async obtenerSerieDetalle(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAgenda}/Schedule/GetScheduleSerie`;
    const customerSlug = this.localService.getValue('customer').slug
    try {
      return await lastValueFrom(
        this.httpClient.post(url,{
          data: this.aesService.aesEncrypt(JSON.stringify({...data,Slug:customerSlug.replace('ttp_','')}))
        }, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['apiKeyAgenda'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async agregarActualizarServicio(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAgenda}/Schedule/UpdateSeries`;
    const customerSlug = this.localService.getValue('customer').slug
    try {
      return await lastValueFrom(
        this.httpClient.post(url,{
          data: this.aesService.aesEncrypt(JSON.stringify({...data,Slug:customerSlug.replace('ttp_','')}))
        }, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['apiKeyAgenda'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
 
  async editarSerie(slug:any,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Serie/EditarSerie?Slug=${slug}`;
    try {
      return await lastValueFrom(
        this.httpClient.put(url,data, {
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
