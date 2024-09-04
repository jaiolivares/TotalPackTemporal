import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Generales } from '../../models/pages/generales.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoGeneralService {
  private readonly _estadoSource = new BehaviorSubject<Generales>({totalEjecutivos:0,totalMotivos:0,totalMotivosPausa:0,totalSeries:0,totalUsuarios:0,totalZonas:0,totalMenus:0});
  readonly estado$ = this._estadoSource.asObservable();
  constructor() { }
  getEstado() {
    return this._estadoSource.getValue();
  }
  private _setEstado(estadoNuevoReembolso: any): void {
    this._estadoSource.next(estadoNuevoReembolso);
  }
  setValor(nombre:string,valor:any): void {
    const estado = {...this.getEstado(), [nombre]:valor};
    this._setEstado(estado);
  }
}
