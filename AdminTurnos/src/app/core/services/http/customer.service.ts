import { lastValueFrom } from 'rxjs';
import { EncryptService } from './../utils/encrypt.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../../config/config';
import { LocalService } from '../storage/local.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'ApiKey': 'c58aaa5a-a026-4fe8-8ef3-1bcec32e2bd9'
  });

  constructor(
    private httpClient: HttpClient,
    private encriptado: EncryptService,
    private localService: LocalService
  ) { }

  async getCustomer(id: any) {
    //const config = await this.config.getConfig();
    const encript: string = this.encriptado.aesEncrypt(`id=${id}`);
    const url = `${API_ENDPOINT.apiTurno}/customer?secret=${encript}`;

    try {
      return await lastValueFrom(
        this.httpClient.get(url, {headers: this.headers})
      );
    } catch (error:any) {
      return { status: false, code: error.status, message: error.title };
    }
  }

  async obtenerCustomer() {
    //const config = await this.config.getConfig();
    //const encript: string = this.encriptado.aesEncrypt(`id=${id}`);
    const url = `${API_ENDPOINT.apiCustomer}/Datebase/ObtenerCustomer`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'ApiKey': 'Q3VzdG9tZXJzVFRQ',
    });

    try {
      return await lastValueFrom(
        this.httpClient.get(url, {headers: headers})
      );
    } catch (error:any) {
      return { status: false, code: error.status, message: error.title };
    }
  }

  setColores(){
    const parametrosJson = JSON.parse(this.localService.getValue('customer').parametros);
    const coloresTotem = parametrosJson.colorestotem;
    const stylesheets:any = document.styleSheets;
    const colores = stylesheets[0].cssRules[0]  as unknown as HTMLElement;
    colores.style.setProperty('--fondo-pantalla',coloresTotem.color3,'important');
    colores.style.setProperty('--franja-1',coloresTotem.color3,'important');
    colores.style.setProperty('--color-llamado-texto',coloresTotem.color2,'important');
    colores.style.setProperty('--color-llamado-small',coloresTotem.color2,'important');
    colores.style.setProperty('--color-footer',coloresTotem.color2,'important');
    colores.style.setProperty('--color-llamado',coloresTotem.color1,'important');
    colores.style.setProperty('--color-llamado-small-texto',coloresTotem.color1,'important');
    colores.style.setProperty('--franja-2',coloresTotem.color1,'important');
    colores.style.setProperty('--texto-solo',coloresTotem.color1,'important');
  }
}
