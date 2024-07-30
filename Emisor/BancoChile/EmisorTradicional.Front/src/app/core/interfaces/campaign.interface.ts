export interface CampaignRequest {
    rut: string;
    sucursal: string;
    canal: string;
}

export interface CampaignResponse {
    MuestraTelefono: boolean;
    Imprime: boolean; 
    MuestraCampana: boolean;  
    MuestraSucursal: boolean;
    MuestraMonto: boolean;
    Monto: string; 
    Segmento: string; 
    NombreEjecutivo: string;  
    NombreCliente: string;  
    Sucursal: string;  
    TextoBotonAceptar: string;  
    TextoBotonCancelar: string; 
    TextoSolicitaContacto: string; 
    CampanaImpresion: string; 
    CampanaPantalla: string;  
    TrackingCode: string;  
    SessionID: string;  
    TipoCliente: boolean;  
    Telefono: string;  
    TipoOferta: string;  
    CodigoOferta: string;  
    Canal: string;  
    NumeroTicket: string;  
    TelefonoInteract: string;  
}

export interface RegisterEvtRequest {
    sessionId: string;
    rutCliente: string;
    telefonoCliente: string;
    treatmentCode: string;
    canal: string;
    segmento: string;
    tipoVenta: string;
    evento: string;
    responseTypeCode: string;
    codigoOferta: string;
    nombreCliente: string;
    nombreOferta: string;
    montoOferta: string;
} 

export interface RegisterEvtResponse {
    statusCode: number;
    messages: any[]; //es un arreglo de tipo JToken en el api
    version: any; //es un object en la respuesta original
    SessionId: string;
}