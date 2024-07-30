export interface DataAfiliado {
  data: string | null;
  errorDetails: string | null;
  errorMessage: string | null;
  errorType: string | null;
  messages: string | null;
}

export interface DataMensajeAtencion {
  data: {
    esAfiliado: string | null;
    mensaje: string | null;
    prioridad: number;
    tieneMensaje: string | null;
  };
  errorDetails: number | null;
  errorMessage: string | null;
  errorType: number | null;
  messages: string | null;
}

export interface DataCaminaContigo {
  data: {
    beneficiarioAnfitrion: {
      aMaterno: string | null;
      aPaterno: string | null;
      carga: number | null;
      clave: string | null;
      color: string | null;
      dv: string | null;
      email: string | null;
      folio: number | null;
      grupoPrioritario: string | null;
      movil: string | null;
      nombres: string | null;
      rut: number | null;
      vigente: string | null;
    };
  };
  errorDetails: number | null;
  errorMessage: string | null;
  errorType: number | null;
  messages: string | null;
}
