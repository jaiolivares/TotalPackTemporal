import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Alarma } from "../../models/pages/alarma.model";

@Injectable({
  providedIn: "root",
})
export class EstadoAlarmasService {
  private readonly _estadoSource = new BehaviorSubject<Alarma>({});
  readonly estado$ = this._estadoSource.asObservable();

  constructor() {}

  getEstado() {
    return this._estadoSource.getValue();
  }

  private _setEstado(estadoNuevoReembolso: any): void {
    this._estadoSource.next(estadoNuevoReembolso);
  }

  setValor(nombre: string, valor: any): void {
    const estado = { ...this.getEstado(), [nombre]: valor };
    this._setEstado(estado);
  }

  limpiarEstado() {
    this._setEstado({});
  }
}
