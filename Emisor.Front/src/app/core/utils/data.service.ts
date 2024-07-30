import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Data } from 'src/app/core/interfaces/data.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private dataSubject = new BehaviorSubject<Data>({
    CaminaContigo: false,
    Rut: '',
    Nombre: '',
    Oferta: null,
    Prioridad: null,
    Series: [],
    SeriesM: [],
    SerieSelected: null,
    SubSerieSelected: null,
    Turno: null
  });
  data$ = this.dataSubject.asObservable();

  setData(newData: Data): void {
    this.dataSubject.next(newData);
  }

  setValue(property: string ,value: any): void {
    const currentData = this.dataSubject.value;
    this.setData({ ...currentData, [property]: value });
  }

  getData(): Data {
    return this.dataSubject.value;
  }
}
