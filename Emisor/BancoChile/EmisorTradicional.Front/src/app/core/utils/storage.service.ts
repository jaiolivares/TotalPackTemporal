import { Injectable } from '@angular/core';
import { CryptoBrowserStorageService } from 'crypto-browser-storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private cache: CryptoBrowserStorageService) { }

  // Agregar valor a localStorage (Puede ser un string, int, boolean, objeto o array)
  setValue(key: string, value: any): any {
    this.cache.setCache(key, value);
  }

  // Obtener valor de localstorage según su llave (Puede ser un string, int, boolean, objeto o array)
  getValue(key: string): any {
    return this.cache.getCache(key);
  }

  // Limpiar el localStorage  ----> Importante saber que no es necesario usar este, ya que localStorage.clear()
  clearToken(): any {
    return this.cache.clearAllCache();
  }

  // Remueve de localStorage el dato que se indique
  removeItem(key: string): any {
    return this.cache.removeCacheByKey(key);
  }
}
