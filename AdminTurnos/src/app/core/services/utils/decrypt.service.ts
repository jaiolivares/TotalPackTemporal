import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class DecryptService {
  key = 'Zq4t7w!z%C*F-JaN';

  constructor() { }

  getDataForDecrypt(data: string) {
    let response: any;
    let json: any;
    json = JSON.parse(atob(data));
    response = this.aesDecrypt(json['value'], json['iv']);
    return response;
  }

  private aesDecrypt(data: string, iv: string) {
    let cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(this.key), {
      iv: CryptoJS.enc.Base64.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      keySize: 128 / 8
    });
    return cipher.toString(CryptoJS.enc.Utf8);
  }
}
