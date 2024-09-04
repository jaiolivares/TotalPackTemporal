import { API_ENDPOINT } from "src/app/core/config/config";
import { ConfigService } from "../../config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LocalService } from "../../storage/local.service";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SeriesAlarmaService {
  constructor(private config: ConfigService, private httpClient: HttpClient, private localService: LocalService) {}

  async obteneSeriesAsignadas(idAlarma: number, idOficina: number): Promise<any> {
    const config = await this.config.getConfig();
    const customerSlug = this.localService.getValue("customer").slug;
    const url = `${API_ENDPOINT.apiAdmin2}/Alarma/ObtenerAlarmaSerie?Slug=${customerSlug}&idAlarma=${idAlarma}&idOficina=${idOficina}`;
    try {
      return await lastValueFrom(this.httpClient.get(url, { headers: { "Content-Type": "application/json", ApiKey: config["ApiKey"] } }));
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async actualizarAlarmaSeries(data: any): Promise<any> {
    const config = await this.config.getConfig();
    const customerSlug = this.localService.getValue("customer").slug;
    const url = `${API_ENDPOINT.apiAdmin2}/Alarma/SetAlarmaSerie?Slug=${customerSlug}`;
    try {
      return await lastValueFrom(this.httpClient.post(url, data, { headers: { "Content-Type": "application/json", ApiKey: config["ApiKey"] } }));
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
}
