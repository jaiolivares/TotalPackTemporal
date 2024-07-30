export interface CustomerData {
    app: number;
    idCustomer: string; //GUID
    idEmpresa: 401;
    name: string;
    parametros: string; //FORMATO JSON EN STRING
    slug: string;
    tiporut: number;
}

export interface CustomerParams {
    TAnulacion: number;
    colorespantalla: ColoresPantalla;
    colorestotem: ColoresTotem;
    oficinas: DataOficina[];
    pantallas: DataPantalla[];
}

export interface ColoresPantalla {
    color1: string;
    color2: string;
    color3: string;
    theme: string;
}

export interface ColoresTotem {
    color1: string;
    color2: string;
    color3: string;
    theme: number;
}

export interface DataOficina {
    anulacion: number;
    banco: string;
    id: number;
}

export interface DataPantalla {
    banco: string;
    idPantalla: string; //GUID
    boxes: Boxes;
}

export interface Boxes {
    cantidad: number;
    filas: FilaData[];
}

export interface FilaData {
    series: string;
}