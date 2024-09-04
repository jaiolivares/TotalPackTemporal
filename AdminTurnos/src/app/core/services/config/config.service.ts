import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private httpClient: HttpClient
  ) { }

  getConfig(): any {
    try {
      return this.httpClient.get('./assets/config/config.json').toPromise();
    } catch (error:any) {
      return { status: false, code: error?.status, message: 'Error al ejecutar la petición.' };
    }
  }

}
