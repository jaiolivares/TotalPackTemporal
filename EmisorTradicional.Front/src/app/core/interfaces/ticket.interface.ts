export interface TicketRequest {
    letra: string;
    turno: number;
    fecha: string; // format "2021-12-14 18:22"
    oferta: string;
    banco: string;
    ancho: string;
    alto: string;
    urlQR: string;
    serie: string;
    mensajeOpcional: string;
}

export interface TicketResponse {
    base64: string;
    status: boolean;
    code: number;
    message: string;
}