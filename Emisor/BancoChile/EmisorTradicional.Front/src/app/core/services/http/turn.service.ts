import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
//interfaces
import { GlobalResponse2 } from '../../interfaces/global.interface';
import { TurnRequest, TurnResponse } from '../../interfaces/turn.interface';
//configuracion
import { Settings } from '../../config/settings';

@Injectable({
  providedIn: 'root'
})
export class TurnService {

  headers: HttpHeaders =  new HttpHeaders({
    'Content-Type': 'application/json',
    ApiKey: Settings.api_auxiliar.apiKey
  });

  constructor(private http: HttpClient) { }

  async newTurn(body: TurnRequest, customerSlug: string): Promise<GlobalResponse2<TurnResponse[]>> {    
    try {
      const url = `${Settings.api_auxiliar.url}api/v1/Turno/NuevoTurno?Slug=${customerSlug}`;
      return await lastValueFrom(this.http.post<GlobalResponse2<TurnResponse[]>>(url, body, {headers: this.headers }));
    } catch (error) { return { status: false } as GlobalResponse2<TurnResponse[]> }
  }
}
