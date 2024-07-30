export interface TurnRequest {
  idOficina: number;
  idSerie: number;
  idMenu: number;
  rut: string;
  cliente: string;
  data: string; //SE ENVIA UN JSON PARSEADO A STRING
  fono: string;
  origen: number;
  fechaAgenda: string;
  priorizado: boolean;
}

export interface TurnResponse {
  codError: number;
  fInfo: number;
  fhEmi: string; // formato "2024-06-13 13:31"
  idOficina: number;
  idSerie: number;
  idTurno: string; //GUID
  infoMsg: string;
  letra: string;
  msg: string;
  priorizado: boolean;
  qEspOfi: number;
  qEspSer: number; //cantidad de espera por serie
  tEspe: number;
  ticket: string;
  turno: number;
  ulLetra: string;
  ulTurno: number;
}