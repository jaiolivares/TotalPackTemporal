import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINT } from '../../../config/config';
import { ConfigService } from '../../config/config.service';
import { lastValueFrom, map, Observable } from 'rxjs';
import { AesService } from '../../utils/aes.service';
import { LocalService } from '../../storage/local.service';

@Injectable({
  providedIn: 'root'
})
export class FeriadosService {

  slug: string;
  Idusuario:number

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
    private localSecureService: LocalService,
    private aesService: AesService,
  ) {
    let customer = this.localSecureService.getValue('customer');
    this.slug = customer.slug.replace('ttp_','');

    this.Idusuario = this.localSecureService.getValue('usuario').idUsuario;
   }


   async obtenerFeriados(anio:string):Promise<Observable<any>>{
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAgenda}/Schedule/GetHoliday`;
    
    const encript = this.aesService.aesEncrypt(JSON.stringify({year:anio, Slug:this.slug}))   
    let json = { data:encript }
    
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      ApiKey: config['apiKeyAgenda'],
    });

    try {
      return this.httpClient.post(url, json, { headers: headers })
      .pipe(map((res: any) => {
        return res
      }))
    } catch (error: any) {
      return error;
    }
  }

  async AccionFeriados(accion:string, fecha:string): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAgenda}/Schedule/SetHoliday`;
    
    const encript = this.aesService.aesEncrypt(JSON.stringify({Slug:this.slug, IdU:this.Idusuario, Acc:accion, Fh_fer:fecha}))   
    //console.log(JSON.stringify({Slug:this.slug, IdU:this.Idusuario, Acc:accion, Fh_fer:fecha}));
    
    let json = { data:encript }
    
    try {
      return await lastValueFrom(
        this.httpClient.post(url,json, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['apiKeyAgenda'],
          },
        })
      );
    } catch (error: any) {
        console.log(error);
        return { status: false, code: error?.code, message: error?.message };
    }
  }
  
  

}


//const encript1 = this.aesService.aesEncrypt(`{"year":"${anio}", "Slug":"${this.customer.slug}"}`)