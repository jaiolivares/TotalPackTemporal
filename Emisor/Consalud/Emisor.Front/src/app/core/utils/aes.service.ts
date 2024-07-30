import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class AesService {

  private readonly key: string = "Zq4t7w!z%C*F-JaNC4F-Jzq47w!z%C*F";
  private readonly iv: string = "7E892875A52C59A3";

  aesEncrypt(data: string): string {
    const cipher = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), CryptoJS.enc.Utf8.parse(this.key), {
      iv: CryptoJS.enc.Utf8.parse(this.iv),
      mode: CryptoJS.mode.CBC,
      keySize: 256 / 32
    });

    return cipher.toString();
  }

  aesDecrypt(data: string): any {
    const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(this.key), {
      iv: CryptoJS.enc.Utf8.parse(this.iv),
      mode: CryptoJS.mode.CBC,
      keySize: 256 / 32
    });

    return JSON.parse(cipher.toString(CryptoJS.enc.Latin1));
  }
}
