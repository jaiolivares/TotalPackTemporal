import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Reportes } from '../../models/pages/reportes.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoReportesService {
  private readonly _estadoSource = new BehaviorSubject<Reportes>({});
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
