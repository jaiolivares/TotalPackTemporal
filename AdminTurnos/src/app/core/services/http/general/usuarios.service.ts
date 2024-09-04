import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

import { API_ENDPOINT } from '../../../config/config';
import { LocalService } from '../../storage/local.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(
    private httpClient: HttpClient,
    private localService: LocalService
  ) {}

  private headers: HttpHeaders = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    ApiKey: API_ENDPOINT.ApiKey,
  });

  async obtenerUsuarios(p: any): Promise<any> {
    const customer = this.localService.getValue('customer');
    const url = `${API_ENDPOINT.apiAdmin2}/Usuario/ListarUsuarios?Slug=${customer.slug}`;

    try {
      return await lastValueFrom(
        this.httpClient.get(url, { headers: this.headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async obtenerUsuario(idUsuario: number): Promise<any> {
    const customer = this.localService.getValue('customer');
    const url = `${API_ENDPOINT.apiAdmin2}/Usuario/ObtenerUsuario?Slug=${customer.slug}&idUsuario=${idUsuario}`;

    try {
      return await lastValueFrom(
        this.httpClient.get(url, { headers: this.headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async obtenerOficinas() {
    const customer = this.localService.getValue('customer');
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${customer.slug}&tipo=OFI`;

    try {
      return await lastValueFrom(
        this.httpClient.get(url, { headers: this.headers })
      );
    } catch (error: any) {
      return error;
    }
  }

  async agregarUsuario(data: any): Promise<any> {
    const usuario = this.localService.getValue('usuario');
    const customer = this.localService.getValue('customer');

    const url = `${API_ENDPOINT.apiAdmin2}/Usuario/AgregarUsuario?Slug=${customer.slug}&idUsuario=${usuario.idUsuario}`;

    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, { headers: this.headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async editarUsuario(idUsuario: number, data: any): Promise<any> {
    const customer = this.localService.getValue('customer');
    const url = `${API_ENDPOINT.apiAdmin2}/Usuario/EditarUsuario?Slug=${customer.slug}&idUsuario=${idUsuario}`;

    try {
      return await lastValueFrom(
        this.httpClient.put(url, data, { headers: this.headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async eliminarUsuario(idUsuarioDelete: number): Promise<any> {
    const usuario = this.localService.getValue('usuario');
    const customer = this.localService.getValue('customer');
    const url = `${API_ENDPOINT.apiAdmin2}/Usuario/EliminarUsuario?Slug=${customer.slug}&idUsuario=${usuario.idUsuario}&idUsuarioDelete=${idUsuarioDelete}`;

    try {
      return await lastValueFrom(
        this.httpClient.delete(url, { headers: this.headers })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
}
