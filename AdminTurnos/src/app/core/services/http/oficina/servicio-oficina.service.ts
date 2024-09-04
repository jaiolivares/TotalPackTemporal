import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINT } from '../../../config/config';
import { lastValueFrom, map, Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { LocalService } from '../../storage/local.service';

@Injectable({
  providedIn: 'root'
})
export class ServicioOficinaService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
    private localService: LocalService
  ) { }

  async obtenerSeriesXoficina(slug:any, idOfi:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=SER&id=${idOfi}`;

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


  async agregarSerieAOficina(slug: string, idOficina:number, ids:any): Promise<any> {
    const usuario = this.localService.getValue('usuario');
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Serie/AsignacionSeriesOficina?Slug=${slug}&idUsuario=${usuario.idUsuario}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let series = {
      idOficina: idOficina,
      idSeries: ids
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.post(url, series, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

}
