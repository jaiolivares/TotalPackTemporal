import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
//configuracion
import { Settings } from '../../config/settings';
//interfaces
import { EmitterData } from 'src/app/core/interfaces/emitter.interface';
import { CustomerData, CustomerParams, DataOficina } from 'src/app/core/interfaces/customer.interface';
import { Images } from '../../interfaces/images.interface';
//services
import { GlobalResponse2 } from '../../interfaces/global.interface';
import { OfficeCodeResponse } from '../../interfaces/office.interface';
import { StorageService } from 'src/app/core/utils/storage.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  images: BehaviorSubject<Images> = new BehaviorSubject<Images>({ background: '', home: '', ticket: '' } as Images);

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    ApiKey: Settings.api_turno.apiKey,
  })

  constructor(
    private cache: StorageService,
    private http: HttpClient
  ) { }

  async getCustomer(idCustomer: string): Promise<CustomerData[]> {
    try {
      const url = `${ Settings.api_turno.url }Turno/v1/customer?id=${idCustomer}`;
      return await lastValueFrom(this.http.get<CustomerData[]>(url, { headers: this.headers }));
    } catch(error) { return [] }
  }

  async getOfficeCode(slug: string, idOffice: number): Promise<GlobalResponse2<OfficeCodeResponse[]>> {
    try {
      const url = `${ Settings.api_auxiliar.url }api/v1/Totem/ObtenerCodigoOficina?Slug=${slug}&idOficina=${idOffice}`;
      const headers = this.headers.set('ApiKey', Settings.api_auxiliar.apiKey);
      return await lastValueFrom(this.http.post<GlobalResponse2<OfficeCodeResponse[]>>(url, {}, { headers }));
    } catch (error) {
      return { status: false, data: [], code: 804, message: "Error interno" } as GlobalResponse2<OfficeCodeResponse[]>;
    }
  }

  setStyles() {
    const emitter: EmitterData = this.cache.getValue('emitter')?? null;
    const customer: CustomerData = this.cache.getValue('customer')?? null;
    if(!emitter || !customer) { return; }

    const params: CustomerParams = JSON.parse(customer.parametros);
    const oficina: DataOficina | undefined = params.oficinas.find((oficina: DataOficina) => oficina.id === emitter.idOficina);


    //cambiar estilos de la aplicación a los correspondientes de cada banco
    if (oficina) {
      if (oficina.banco === 'edwards') {
        params.colorestotem = {
          ...params.colorestotem,
          color1: '#00C09F',
          color2: '#FFF',
          color3: '#00C09F',
        };
      } else {
        params.colorestotem = {
          ...params.colorestotem,
          color1: '#01225D',
          color2: '#FFF',
          color3: '#002884',
        };
      }
    }

    document.documentElement.style.setProperty('--fondo-pantalla', params.colorestotem.color3, 'important');
    document.documentElement.style.setProperty('--franja-1', params.colorestotem.color3, 'important');
    document.documentElement.style.setProperty('--color-llamado-texto', params.colorestotem.color2, 'important');
    document.documentElement.style.setProperty('--color-llamado-small', params.colorestotem.color2, 'important');
    document.documentElement.style.setProperty('--color-footer', params.colorestotem.color2, 'important');
    document.documentElement.style.setProperty('--color-llamado', params.colorestotem.color1, 'important');
    document.documentElement.style.setProperty('--color-llamado-small-texto', params.colorestotem.color1, 'important');
    document.documentElement.style.setProperty('--franja-2', params.colorestotem.color1, 'important');
    document.documentElement.style.setProperty('--texto-solo', params.colorestotem.color1, 'important');
    //cambio
    if (oficina) {
      oficina.banco === 'edwards' ? 
      document.documentElement.style.setProperty('--fondo-botones', params.colorestotem.color1, 'important') 
      :document.documentElement.style.setProperty('--fondo-botones', 'linear-gradient(90deg, rgba(10,24,97,1) 0%, rgba(14,33,135,1) 100%)', 'important');
    }

    //RESCATAR IMAGENES
    const ancho = window.innerWidth <= 768 ? "1366" : "1920";
    if(oficina) {
      const images: Images = {
        home: `assets/img/banco_${oficina.banco}/home/${ancho}-home.jpg`,
        background: `assets/img/banco_${oficina.banco}/background/${ancho}-BG.jpg`,
        ticket: `assets/img/banco_${oficina.banco}/ticket/ticket-${oficina.banco}.gif`
      };

      this.images.next(images);
    }
  }
}
