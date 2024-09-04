import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINT } from '../../../config/config';
import { lastValueFrom, map, Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class MotivosPausaService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }

  async obtenerMotivos(slug: string):Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=PAU`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    try {
      return this.httpClient.get(url, { headers: headers })
      .pipe(map((res: any) => {
        return res
      }))
    } catch (error: any) {
      return error;
    }
  }

  async obtenerMotivoId(slug: string, idMotivo:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Pausa/ObtenerPausa?Slug=${slug}&idPausa=${idMotivo}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
    
    try {
    return await lastValueFrom(
        this.httpClient.get(url, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async agregarMotivo(slug: string, idUser:number, data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Pausa/AgregarPausa?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let motivo = {
      idUser: idUser,
      pausa: data.motivo,
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.post(url, motivo, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async actualizarMotivo(slug: string, idUser:number, data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Pausa/EditarPausa?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let motivo = {
      idUser: idUser,
      pausa: data.motivo,
      idPausa: data.id
    }

    try {
    return await lastValueFrom(
        this.httpClient.put(url, motivo, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }


  async eliminarMotivo(slug: string, idUser:number,idMotivo:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Pausa/EliminarPausa?Slug=${slug}&iduser=${idUser}&idPausa=${idMotivo}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    try {
    return await lastValueFrom(
        this.httpClient.delete(url, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }


}
