import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidaRutService {

  constructor() { }

  /* Validador de RUT */
  validarRut(rutCompleto: any): boolean {
    let digv    = rutCompleto.substr(rutCompleto.length - 1);
    let rut     = rutCompleto.slice(0, - 1);
    digv = (digv == 'K') ? 'k' : digv;

    let M = 0;
    let S = 1;
    for (; rut; rut = Math.floor(rut / 10)) {
      S = (S + rut % 10 * (9 - M++ % 6)) % 11;
    }

    const digito = S ? S - 1 : 'k';

    const regex = /^([0-9])\1{8}$/;
    const invalidRut = regex.test(rutCompleto);

    // if (digito == digv && !invalidRut && rutCompleto.length > 7) {
    if (digito == digv && !invalidRut && rutCompleto.length >= 7) {
      return true;
    } else {
      return false;
    }
  }

  /* Formato de RUT */
  formatearRut(rut: any): string {
    const actual = rut.toString().replace(/^0+/, '');
    let rutPuntos = '';

    if (actual != '' && actual.length > 0) {
      const sinPuntos = actual.replace(/\./g, '');
      const actualLimpio = sinPuntos.replace(/-/g, '');
      const inicio = actualLimpio.substring(0, actualLimpio.length - 1);
      let i = 0;
      let j = 1;
      for (i = inicio.length - 1; i >= 0; i--) {
        const letra = inicio.charAt(i);
        rutPuntos = letra + rutPuntos;
        if (j % 3 == 0 && j <= inicio.length - 1) {
          rutPuntos = '.' + rutPuntos;
        }
        j++;
      }

      const dv = actualLimpio.substring(actualLimpio.length - 1);
      rutPuntos = rutPuntos + '-' + dv;
    }
    return rutPuntos;
  }

  /* Cálculo de dígito verificador */
  obtenerDigitoVerificador(rut: any) {
    let M = 0;
    let S = 1;

	  for(; rut; rut = Math.floor(rut / 10)) {
      S = (S + rut % 10 * (9 - M++ % 6)) % 11;
    }

	  return S ? S - 1 : 'K';
      // alert(S?S-1:'k');
  }
}
