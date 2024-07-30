export interface GlobalResponse {
    code: number;
    status: boolean;
    message: string;
}


export interface GlobalResponse2<T> {
    code: number;
    status: boolean;
    message: string;
    data: T;
}