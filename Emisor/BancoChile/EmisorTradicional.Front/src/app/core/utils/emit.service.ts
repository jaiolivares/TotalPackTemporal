import { Injectable, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmitService {
  //evaluar si debo volver a las serie o logout
  @Output() setToSerie = new EventEmitter();
  inSubserie = new BehaviorSubject<boolean>(false);

  constructor() { }

  getSubSerie() {
    return this.inSubserie.value;
  }

  setSubSerie (selected: boolean) { this.inSubserie.next(selected); }

  setToSeries() {
    this.setToSerie.emit(true);
  }
}
