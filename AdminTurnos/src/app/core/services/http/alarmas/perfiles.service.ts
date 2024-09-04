import { API_ENDPOINT } from "src/app/core/config/config";
import { ConfigService } from "../../config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LocalService } from "../../storage/local.service";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PerfilesService {
  constructor(private config: ConfigService, private httpClient: HttpClient, private localService: LocalService) {}

  async obtenerPerfiles(): Promise<any> {
    const config = await this.config.getConfig();
    const customerSlug = this.localService.getValue("customer").slug;
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${customerSlug}&tipo=ALA&id=0`;
    try {
      return await lastValueFrom(this.httpClient.get(url, { headers: { "Content-Type": "application/json", ApiKey: config["ApiKey"] } }));
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async obtenerPerfilDetalle(idPerfil: number): Promise<any> {
    const config = await this.config.getConfig();
    const customerSlug = this.localService.getValue("customer").slug;
    const url = `${API_ENDPOINT.apiAdmin2}/Alarma/ObtenerAlarma?Slug=${customerSlug}&idAlarma=${idPerfil}`;
    try {
      return await lastValueFrom(this.httpClient.get(url, { headers: { "Content-Type": "application/json", ApiKey: config["ApiKey"] } }));
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async agregarPerfil(data: any): Promise<any> {
    const config = await this.config.getConfig();
    const customerSlug = this.localService.getValue("customer").slug;
    const url = `${API_ENDPOINT.apiAdmin2}/Alarma/AddAlarma?Slug=${customerSlug}`;
    try {
      return await lastValueFrom(this.httpClient.post(url, data, { headers: { "Content-Type": "application/json", ApiKey: config["ApiKey"] } }));
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async actualizarPerfil(data: any): Promise<any> {
    const config = await this.config.getConfig();
    const customerSlug = this.localService.getValue("customer").slug;
    const url = `${API_ENDPOINT.apiAdmin2}/Alarma/EditAlarma?Slug=${customerSlug}`;
    try {
      return await lastValueFrom(this.httpClient.put(url, data, { headers: { "Content-Type": "application/json", ApiKey: config["ApiKey"] } }));
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async eliminarPerfil(idPerfil: number): Promise<any> {
    const config = await this.config.getConfig();
    const customerSlug = this.localService.getValue("customer").slug;
    const idUsuario = parseInt(this.localService.getValue("usuario").idUsuario);
    const url = `${API_ENDPOINT.apiAdmin2}/Alarma/DeleteAlarma?Slug=${customerSlug}&idUsuario=${idUsuario}&idAlarma=${idPerfil}`;
    try {
      return await lastValueFrom(this.httpClient.delete(url, { headers: { "Content-Type": "application/json", ApiKey: config["ApiKey"] } }));
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
}
