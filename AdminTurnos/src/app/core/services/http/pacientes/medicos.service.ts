import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, map, Observable } from 'rxjs';
import { API_ENDPOINT } from '../../../config/config';
import { ConfigService } from '../../config/config.service';
import { LocalService } from '../../storage/local.service';

@Injectable({
  providedIn: 'root',
})
export class MedicosService {
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

  async obtenerMedicos():Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const customer = this.localService.getValue('customer');   
    const url = `${API_ENDPOINT.apiCustomerMedic}/Medico/ObtenerMedicos?idCustomer=${customer.idCustomer}`;

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

  async agregarMedico(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const customer = this.localService.getValue('customer');  
    const url = `${API_ENDPOINT.apiCustomerMedic}/Medico/AgregarMedico`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });

    let medico = {
        idCustomer: customer.idCustomer,
        rut: data.rut,
        nombre: data.nombre,
        paterno: data.apellidoPaterno,
        materno: data.apellidoMaterno,
        box: data.box
    }
    
    try {
    return await lastValueFrom(
        this.httpClient.post(url, medico, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.error.message };
    }
  }

  async actualizarMedico(idMedic:number, data:any): Promise<any> {
    const config = await this.config.getConfig();
    const customer = this.localService.getValue('customer');  
    const url = `${API_ENDPOINT.apiCustomerMedic}/Medico/EditarMedico`;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'ApiKey': config['ApiKey']
    });
 
    let medico = {
      idMedico: idMedic,
      idCustomer: customer.idCustomer,
      rut: data.rut,
      nombre: data.nombre,
      paterno: data.apellidoPaterno,
      materno: data.apellidoMaterno,
      box: data.box
  }
  
    try {
    return await lastValueFrom(
        this.httpClient.put(url, medico, { headers: headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async eliminarMedico(idMedico: number): Promise<any> {
    const customer = this.localService.getValue('customer');
    const url = `${API_ENDPOINT.apiCustomerMedic}/Medico/EliminarMedico?idMedico=${idMedico}`;

    try {
      return await lastValueFrom(
        this.httpClient.delete(url, { headers: this.headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
}
