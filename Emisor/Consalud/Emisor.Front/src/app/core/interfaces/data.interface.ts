import { ButtonData } from "./emitter.interface";
import { TurnResponse } from "./turn.interface";

export interface Data {
    CaminaContigo: boolean;
    Series: ButtonData[];
    SeriesM: ButtonData[];
    Oferta: string | null;
    Prioridad: number | null;
    Rut: string;
    Nombre: string;
    SerieSelected: ButtonData | null;
    SubSerieSelected: ButtonData | null;
    Turno: TurnResponse | null;
}