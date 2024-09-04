import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class AesService {

  private readonly SecretKey = "Zq4t7w!z%C*F-JaNC4F-Jzq47w!z%C*F";
  private readonly SecretIv = "7E892875A52C59A3";

  aesEncrypt(data: string): string {
    const cipher = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), CryptoJS.enc.Utf8.parse(this.SecretKey), {
      iv: CryptoJS.enc.Utf8.parse(this.SecretIv),
      mode: CryptoJS.mode.CBC, // Asumo que estás usando CBC. Cambia si es necesario.
      keySize: 256 / 32       // Tamaño de la clave para AES-256
    });

    return cipher.toString();
  }

  aesDecrypt(data: string): any {
    const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(this.SecretKey), {
      iv: CryptoJS.enc.Utf8.parse(this.SecretIv),
      mode: CryptoJS.mode.CBC, // Asumo que estás usando CBC. Cambia si es necesario.
      keySize: 256 / 32       // Tamaño de la clave para AES-256
    });

    return JSON.parse(cipher.toString(CryptoJS.enc.Latin1));
  }
}
