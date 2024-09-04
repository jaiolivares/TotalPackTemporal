import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Oficinas } from '../../models/pages/oficinas.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoOficinasService {
  private readonly _estadoSource = new BehaviorSubject<Oficinas>({});
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
