import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, map, Observable } from 'rxjs';
import { API_ENDPOINT } from '../../../config/config';
import { ConfigService } from '../../config/config.service';
import { LocalService } from '../../storage/local.service';

@Injectable({
  providedIn: 'root'
})
export class PantallasService {

  constructor(
    private httpClient: HttpClient,
    private localService: LocalService,
    private config: ConfigService,
  ) {}

  private headers: HttpHeaders = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    ApiKey: API_ENDPOINT.ApiKey,
  });


  async obtenerPantallas():Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const customer = this.localService.getValue('customer');   
    const url = `${API_ENDPOINT.apiCustomerMedic}/PantallaMedico/ObtenerPantllaMedicoPorIdCustomer?idCustomer=${customer.idCustomer}`;

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

  async agregarPantalla(idPantalla:string,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiCustomerMedic}/PantallaMedico_view/AgregarPantallaMedico_view`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let pantalla = {
      idPantallaMedico: idPantalla,
      box: data.box,
      piso: data.piso
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.post(url, pantalla, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.error.message };
    }
  }

  async actualizarPantalla(idPantallaMedico:string, idPantallaMedicoView:string, data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiCustomerMedic}/PantallaMedico_view/EditarPantallaMedico_view`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
 
    
    let pantalla = {
      idPantallaMedico: idPantallaMedico,
      box: data.box,
      piso: data.piso,
      idPantallaMedicoView:idPantallaMedicoView
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.put(url, pantalla, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.error.message };
    }
  }

  async eliminarPantalla(idMedicoView: string): Promise<any> {
    const url = `${API_ENDPOINT.apiCustomerMedic}/PantallaMedico_view/EliminarPantallaMedico_view?idPantallaMedicoView=${idMedicoView}`;

    try {
      return await lastValueFrom(
        this.httpClient.delete(url, { headers: this.headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

}
