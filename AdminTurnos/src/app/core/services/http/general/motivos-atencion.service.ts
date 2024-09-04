import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINT } from '../../../config/config';
import { lastValueFrom, map, Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';


@Injectable({
  providedIn: 'root'
})
export class MotivosAtencionService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }


  async obtenerMotivos(slug: string):Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=MOT`;

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

  async obtenerUnMotivo(slug: string, idMotivo:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Zonas/ObtenerZona?Slug=${slug}&idZona=${idMotivo}`;
    
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

  async agregarMotivo(slug: string, idUser:number, data:any,): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Motivo/AgregarMotivo?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let motivo = {
      idUser: idUser,
      motivo: data.motivo,
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
    const url = `${API_ENDPOINT.apiAdmin2}/Motivo/EditarMotivo?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let motivo = {
      idUser: idUser,
      motivo: data.motivo,
      idMotivo: data.id
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
    const url = `${API_ENDPOINT.apiAdmin2}/Motivo/EliminarMotivo?Slug=${slug}&iduser=${idUser}&idMotivo=${idMotivo}`;

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

  async obtenerSeriesMotivo(slug: string, idMotivo:number):Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Serie/ObtenerSeriexMotivo?Slug=${slug}&idMotivo=${idMotivo}`;

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

  async agregarSerieAMotivo(slug: string, idUser:number, idMotivo:number, ids:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Motivo/AgregarSeriesAMotivo?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let series = {
      idUsuario: idUser,
      idOficina: 0,
      idMotivo: idMotivo,
      listaSerie: ids
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.post(url, series, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }


  // async obtenerMotivos(): Promise<any> {
  //   const config = await this.config.getConfig();
  //   let url = './assets/data/generales/motivos-atencion.json';

  //   try {
  //     return await lastValueFrom(
  //       this.httpClient.get(url, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           ApiKey: config['ApiKey'],
  //         },
  //       })
  //     );
  //   } catch (error: any) {
  //     return { status: false, code: error?.code, message: error?.message };
  //   }
  // }
  
}
