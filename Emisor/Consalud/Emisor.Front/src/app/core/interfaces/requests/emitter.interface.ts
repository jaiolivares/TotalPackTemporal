export interface RequestDataAfiliado {
  rutPers: string;
}

export interface RequestMensajeAtencion {
  rutCliente: string;
  dvCliente: string;
  sucursal: string;
  idSerie: number;
}

export interface RequestCaminaContigo {
  rut: string;
}

export interface RequestAsignarNumero {
  rutCliente: string;
  dvCliente: string;
  sucursal: string;
  idSerie: number;
  numero: string;
}
