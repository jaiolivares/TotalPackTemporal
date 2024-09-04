import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { API_ENDPOINT } from 'src/app/core/config/config';

@Injectable({
  providedIn: 'root'
})
export class SubSeriesService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }

  async obtenerSubSeries(slug:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Subserie/ObtenerSubSerie?Slug=${slug}&idOficina=0`;

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
  async agregarSubSerie(slug:any,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/SubSerie/AgregarSubSerie?Slug=${slug}`;
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
  async editarSubSerie(slug:any,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/SubSerie/EditarSubSerie?Slug=${slug}`;
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
  async eliminarSubSerie(slug:any,idUser:any,idMenu:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/SubSerie/EliminarSubSerie?Slug=${slug}&idUser=${idUser}&idMenu=${idMenu}`;
    try {
      return await lastValueFrom(
        this.httpClient.delete(url, {
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
  async actualizarMenus(slug:any,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/SubSerie/SerSerieXSubSerie?Slug=${slug}`;
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
