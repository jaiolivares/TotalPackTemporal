import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Medicos } from '../../models/pages/medicos.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoMedicosService {

  private readonly _estadoSource = new BehaviorSubject<Medicos>({totalMedicos:0,totalPantallas:0});
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
