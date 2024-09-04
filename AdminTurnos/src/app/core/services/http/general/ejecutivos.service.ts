import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINT } from '../../../config/config';
import { lastValueFrom, map, Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class EjecutivosService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }

  async obtenerEjecutivos(slug: string):Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Ejecutivo/ObtenerListaEjecutivos?Slug=${slug}&tipo=EJE`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    try {
      return this.httpClient.get(url, { headers: headers })
      .pipe(map((res: any) => {
        return res;
      }))
    } catch (error: any) {
      return error;
    }
  }

  async obtenerUnEjecutivo(slug: string, idEje:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Ejecutivo/ObtenerEjecutivo?Slug=${slug}&idEjecutivo=${idEje}`;
    
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


  async agregarEjecutivo(slug: string, idUser:number, data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Ejecutivo/AgregarEjecutivo?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let ejecutivo = {
      idUser: idUser,
      ejecutivo: data.nombre,
      fgok: data.habilitado,
      userName: data.usuario,
      pass: data.password,
      data: ""
    }

    try {
    return await lastValueFrom(
        this.httpClient.post(url, ejecutivo, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async agregarEjecutivoDesdeUsuarios(slug: string,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Ejecutivo/AgregarEjecutivo?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
    try {
    return await lastValueFrom(
        this.httpClient.post(url, data, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }


  async actualizarEjecutivo(slug: string, idUser:number, data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Ejecutivo/EditarEjecutivo?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
 
    let ejecutivo = {
      idUser: idUser,
      idEje: data.id,
      ejecutivo: data.nombre,
      fgok: data.habilitado,
      userName: data.usuario,
      pass: data.password,
      data: ""
    }

    try {
    return await lastValueFrom(
        this.httpClient.put(url, ejecutivo, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async eliminarEjecutivo(slug: string, idUser:number,idEje:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Ejecutivo/EliminarEjecutivo?Slug=${slug}&iduser=${idUser}&idEjecutivo=${idEje}`;

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
  
  // async obtenerEjecutivos(): Promise<any> {
  //   const config = await this.config.getConfig();
  //   let url = './assets/data/generales/ejecutivos.json';

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
