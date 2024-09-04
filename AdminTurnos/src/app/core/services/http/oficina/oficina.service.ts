import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { API_ENDPOINT } from 'src/app/core/config/config';

@Injectable({
  providedIn: 'root'
})
export class OficinaService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) { }

  async obtenerOficinas(slug: string):Promise<Observable<any>>{
    //const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=OFI`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': API_ENDPOINT.ApiKey
    });

    try {
      return this.httpClient.get(url, { headers: headers })
      .pipe(map((res: any) => {
        return res
      }))
    } catch (error: any) {
      return error
    }
  }
  async obtenerCustomerOficinas(idCustomer: string):Promise<any>{
    //const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiCustomer}/OficinaCustomer/ObtenerOficinasCustomer?idCustomer=${idCustomer}`;

    try {
      return await lastValueFrom(
        this.httpClient.get(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: API_ENDPOINT.ApiKey,
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async obtenerOficina(slug: string,idOficina:any):Promise<any>{
    //const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Oficinas/ObtenerOficina?Slug=${slug}&idOficina=${idOficina}`;

    try {
      return await lastValueFrom(
        this.httpClient.get(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: API_ENDPOINT.ApiKey,
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async editarOficina(slug: string,data:any):Promise<any>{
    //const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Oficinas/EditarOficina?Slug=${slug}`;

    try {
      return await lastValueFrom(
        this.httpClient.put(url,data,{
          headers: {
            'Content-Type': 'application/json',
            ApiKey: API_ENDPOINT.ApiKey,
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
}
