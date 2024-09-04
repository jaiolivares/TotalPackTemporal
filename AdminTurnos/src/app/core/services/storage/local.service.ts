import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  constructor(
    private storageService: StorageService
  ) { }

    // Agregar valor a localStorage (Puede ser un string, int, boolean, objeto o array)
    setValue(key: string, value: any): any {
      this.storageService.localSecureStorage.setItem(key, value);
    }

    // Obtener valor de localstorage según su llave (Puede ser un string, int, boolean, objeto o array)
    getValue(key: string): any {
      return this.storageService.localSecureStorage.getItem(key);
    }

    // Limpiar todo el localStorage  ----> Importante saber que no es necesario usar este, ya que localStorage.clear() elimina todo igual
    clearToken(): any {
      return this.storageService.localSecureStorage.clear();
    }

    // Remueve de localStorage el dato que se indique
    removeItem(key: string): any {
      return this.storageService.localSecureStorage.removeItem(key);
    }

}
