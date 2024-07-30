import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//configuracion
import { Settings } from '../../config/settings';
import { Config } from '../../config/config';
//interfaces
import { CampaignRequest, CampaignResponse, RegisterEvtRequest, RegisterEvtResponse } from '../../interfaces/campaign.interface';
import { GlobalResponse2 } from '../../interfaces/global.interface';
//services
import { AesService } from 'src/app/core/utils/aes.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    ApiKey: Settings.api_campana.apiKey,
  });

  constructor(
    private aesService: AesService, 
    private http: HttpClient
  ) { }

  async getCampaign(data: CampaignRequest): Promise<GlobalResponse2<CampaignResponse>>{
    try {
      //respuesta enviada si la api de campaña se simular para NO afecar el flujo
      if(Config.simular.campana) { return {status: false} as GlobalResponse2<CampaignResponse> }  

      const url = `${ Settings.api_campana.url }api/BancoChile/ConsultarCampana`;
      const body = { data: this.aesService.aesEncrypt(JSON.stringify(data)) }
      const response: GlobalResponse2<string> = await lastValueFrom(this.http.post<GlobalResponse2<string>>(url,body, { headers: this.headers }));
      //debo desencriptar la data
      const decrypt: CampaignResponse = this.aesService.aesDecrypt(response.data) as CampaignResponse;
      return { ...response, data: decrypt } as GlobalResponse2<CampaignResponse>;
    } catch (error) { return { status: false } as GlobalResponse2<CampaignResponse> }
  }

  async registrarEvento(data: RegisterEvtRequest): Promise<GlobalResponse2<RegisterEvtResponse>>{
    try {
      //respuesta enviada si la api de campaña se simular para NO afecar el flujo
      if(Config.simular.campana) { return {status: false} as GlobalResponse2<RegisterEvtResponse> }    
      
      const url = `${ Settings.api_campana.url }api/BancoChile/RegistraEvento`;
      const body = {data: this.aesService.aesEncrypt(JSON.stringify(data))}
      const response: GlobalResponse2<string> = await lastValueFrom(this.http.post<GlobalResponse2<string>>(url,body, { headers: this.headers }));
      //debo desencriptar la data
      const decrypt: RegisterEvtResponse = this.aesService.aesDecrypt(response.data) as RegisterEvtResponse;
      return { ...response, data: decrypt } as GlobalResponse2<RegisterEvtResponse>
    } catch(error) { throw(error) }

  }
}
