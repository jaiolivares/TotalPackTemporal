import { Injectable } from "@angular/core";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { HttpHeaders, HttpClient } from "@angular/common/http";
//config app
import { Settings } from "../../config/settings";
//interfaces
import { EmitterData } from "src/app/core/interfaces/emitter.interface";
import { CustomerData, CustomerParams } from "src/app/core/interfaces/customer.interface";
import { Images } from "../../interfaces/images.interface";
//services
import { GlobalResponse2 } from "../../interfaces/global.interface";
import { OfficeCodeResponse } from "../../interfaces/office.interface";
import { StorageService } from "src/app/core/utils/storage.service";

@Injectable({
  providedIn: "root",
})
export class CustomerService {
  images: BehaviorSubject<Images> = new BehaviorSubject<Images>({ background: "", home: "", ticket: "" } as Images);

  url_turno: string = Settings.api_turno.url;
  url_auxiliar: string = Settings.api_auxiliar.url;

  headers: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json",
    ApiKey: Settings.api_turno.apiKey,
  });

  constructor(private cache: StorageService, private http: HttpClient) {}

  async getCustomer(idCustomer: string): Promise<CustomerData[]> {
    try {
      const url = `${this.url_turno}/Turno/v1/customer?id=${idCustomer}`;
      return await lastValueFrom(this.http.get<CustomerData[]>(url, { headers: this.headers }));
    } catch (error) {
      return [];
    }
  }

  async getOfficeCode(slug: string, idOffice: number): Promise<GlobalResponse2<OfficeCodeResponse[]>> {
    try {
      const url = `${this.url_auxiliar}/api/v1/Totem/ObtenerCodigoOficina?Slug=${slug}&idOficina=${idOffice}`;
      const headers = this.headers.set("ApiKey", Settings.api_auxiliar.apiKey);
      return await lastValueFrom(this.http.post<GlobalResponse2<OfficeCodeResponse[]>>(url, {}, { headers }));
    } catch (error) {
      return { status: false, data: [], code: 804, message: "Error interno" } as GlobalResponse2<OfficeCodeResponse[]>;
    }
  }

  setStyles() {
    const emitter: EmitterData = this.cache.getValue("emitter") ?? null;
    const customer: CustomerData = this.cache.getValue("customer") ?? null;
    if (!emitter || !customer) {
      return;
    }

    const params: CustomerParams = JSON.parse(customer.parametros);

    document.documentElement.style.setProperty("--fondo-pantalla", params.colorestotem.color3, "important");
    document.documentElement.style.setProperty("--franja-1", params.colorestotem.color3, "important");
    document.documentElement.style.setProperty("--color-llamado-texto", params.colorestotem.color2, "important");
    document.documentElement.style.setProperty("--color-llamado-small", params.colorestotem.color2, "important");
    document.documentElement.style.setProperty("--color-footer", params.colorestotem.color2, "important");
    document.documentElement.style.setProperty("--color-llamado", params.colorestotem.color1, "important");
    document.documentElement.style.setProperty("--color-llamado-small-texto", params.colorestotem.color1, "important");
    document.documentElement.style.setProperty("--franja-2", params.colorestotem.color1, "important");
    document.documentElement.style.setProperty("--texto-solo", params.colorestotem.color1, "important");
    document.documentElement.style.setProperty("--fondo-botones", params.colorestotem.color1, "important");

    //RESCATAR IMAGENES
    const images: Images = {
      home: "",
      background: "../../../../assets/img/logo-cliente.svg",
      ticket: "../../../../assets/img/ticket.gif",
    };

    this.images.next(images);
  }
}
