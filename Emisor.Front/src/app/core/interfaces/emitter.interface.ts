export interface EmitterData {
    idCustomer: string; //GUID
    idCustomerOficina: string; //GUID
    idOficina: number;
    rut: number;
}

export interface ButtonData {
    idOficina: number;
    idBot: number;
    idSerie: number;
    idSerieM: number;
    serieBoton: string;
    exigeID: number;
    activo: number;
    tieneSS: number;
    idSS: number;
    tipo: number;
}