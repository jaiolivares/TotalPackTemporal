import { Injectable } from "@angular/core";
import { AbstractControl, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class DniService {
  constructor() {}

  // VALIDADOR DE RUT
  validarRut(dniValids: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const rutCompleto = control.value;

      //validar si pertenece a los ruts que deben pasar
      const valids: boolean = dniValids.includes(rutCompleto);
      if (valids || !rutCompleto) {
        return null;
      }

      //separar dv de dni
      const tmp = rutCompleto.split("-");
      let digv = tmp[1];
      const mantisa = tmp[0].replace(/\./g, "");

      //LO ANTIGUO, NO BORRAR: const regex = /^([0-9])\1{8}$/;
      const regex = /^(\d)\1{8}$/;
      const invalidRut = regex.test(mantisa + digv);

      // Transformar "k" minúscula a "K" mayúscula
      if (digv === "k") {
        digv = "K";
      }

      return this.digv(mantisa) == digv && !invalidRut && rutCompleto.length > 9 ? null : { rutInvalid: true };
    };
  }

  digv(T: any): number | "K" {
    let M = 0;
    let S = 1;
    for (; T; T = Math.floor(T / 10)) {
      S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
    }
    return S ? S - 1 : "K";
  }

  /* Formato de Rut */
  formaterRut(rut: string): string {
    if (rut.length > 1) {
      const actual = rut.replace(/^0+/, "");
      let rutPuntos = "";
      if (actual != "" && actual.length > 0) {
        const sinPuntos = actual.replace(/\./g, "");
        const actualLimpio = sinPuntos.replace(/-/g, "");
        const inicio = actualLimpio.substring(0, actualLimpio.length - 1);
        let i = 0;
        let j = 1;
        for (i = inicio.length - 1; i >= 0; i--) {
          const letra = inicio.charAt(i);
          rutPuntos = letra + rutPuntos;
          if (j % 3 == 0 && j <= inicio.length - 1) {
            rutPuntos = "." + rutPuntos;
          }
          j++;
        }
        const dv = actualLimpio.substring(actualLimpio.length - 1);
        rutPuntos = rutPuntos + "-" + dv;
      }
      return rutPuntos;
    } else {
      return rut;
    }
  }
}
