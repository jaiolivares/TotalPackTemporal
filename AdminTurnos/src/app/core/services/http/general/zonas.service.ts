import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINT } from '../../../config/config';
import { lastValueFrom, map, Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})

export class ZonasService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }

  async obtenerZonas(slug: string):Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=ZON`;

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

  async obtenerUnaZona(slug: string, idZona:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Zonas/ObtenerZona?Slug=${slug}&idZona=${idZona}`;
    
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

  async agregarZona(slug: string, data:any, idUser:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Zonas/AgregarZona?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let zona = {
      idUser: idUser,
      zona: data.nombre,
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.post(url, zona, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }


  async actualizarZona(slug: string, data:any, idUser:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Zonas/EditarZona?Slug=${slug}`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let zona = {
      idUser: idUser,
      idZona: data.id,
      zona: data.nombre,
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.put(url, zona, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async eliminarZona(slug: string, idUser:number,idZona:number): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Zonas/EliminarZona?Slug=${slug}&iduser=${idUser}&idZona=${idZona}`;

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
