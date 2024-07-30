export interface SegmentationRes {
    GlosaRespuesta: string;
    CodigoRespuesta: string;
    Respuesta: ResponseDataSeg;
}

export interface ResponseDataSeg {
    Segmento: string;
    Prioridad: string;
}