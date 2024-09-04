import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { AES } from '../../models/aes.model';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {
  key = 'Zq4t7w!z%C*F-JaN'; //length 32

  constructor() { }
  aesEncrypt(data: string) {
    let guid = this.getGUID();
    let cipher = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), CryptoJS.enc.Utf8.parse(this.key), {
      iv: CryptoJS.enc.Utf8.parse(guid),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      keySize: 128 / 8,
    });
    let response: AES = new AES;
    response.iv = guid;
    response.value = cipher.toString();
    return btoa(JSON.stringify(response));
  }

  getGUID() {
    return 'xxxxxxxxxxxx4xxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}
