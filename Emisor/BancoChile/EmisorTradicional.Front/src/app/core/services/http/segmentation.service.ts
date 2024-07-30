import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//configuracion
import { Settings } from '../../config/settings';
//services
import { AesService } from './../../utils/aes.service';
import { GlobalResponse, GlobalResponse2 } from '../../interfaces/global.interface';
import { SegmentationRes } from '../../interfaces/segmentation.interface';

@Injectable({
  providedIn: 'root'
})
export class SegmentationService {

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    ApiKey: Settings.api_segmentacion.apiKey
  })

  constructor(private http: HttpClient, private aesService: AesService) { }

  async getSegmentation(rut: string): Promise<GlobalResponse2<SegmentationRes>>{
    try {
      const url = `${ Settings.api_segmentacion.url }api/Consulta/Segmento`;
      const body = { data: this.aesService.aesEncrypt(JSON.stringify({ rut }))}
      const response: GlobalResponse2<string> = await lastValueFrom(this.http.post<GlobalResponse2<string>>(url,body, { headers: this.headers }));
      //debo desencriptar la data
      const decrypt: SegmentationRes = this.aesService.aesDecrypt(response.data) as SegmentationRes;
      return { ...response, data: decrypt } as GlobalResponse2<SegmentationRes>
    } catch (error) { throw(error) }
  }
}
