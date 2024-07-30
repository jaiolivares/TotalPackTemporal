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
    idOficina: number;
    idSerie: number;
    letra: string;
    turno: number;
    ticket: string;
    fechaEmision: string; // formato "2024-06-13 13:31"
    fInfo: number;
    infoMsg: string;
    tEspE: number;
    idTurno: string; //GUID
    u1Letra: string;
    u1Turno: number;
    agenda: string | null;
    priorizado: boolean;
    codError: number;
    msg: string;
}