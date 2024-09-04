import { lastValueFrom } from 'rxjs';
import { EncryptService } from './../utils/encrypt.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINT } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(
    private httpClient: HttpClient,
    private encriptado: EncryptService
  ) { }

  async getGeolocation(data:any) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.lat}&lon=${data.lng}`;

    try {
      return await lastValueFrom(
        this.httpClient.get(url, {headers: this.headers})
      );
    } catch (error:any) {
      return { status: false, code: error.status, message: error.title };
    }
  }
}
