import { lastValueFrom } from 'rxjs';
import { API_ENDPOINT } from './../../../config/config';
import { LocalService } from './../../storage/local.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { stringToSeconds } from '../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ResumenOficinasService {

  constructor(
    private httpClient: HttpClient,
    private localSecureService: LocalService
  ) { }

  async resumen(slug: string, idUsuario: string) {
    const url = `${API_ENDPOINT.apiAdmin}/Reportes/ResumenDeOficinas?Slug=${slug}&idUsuario=${idUsuario}`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'ApiKey': 'Q3VzdG9tZXJzVFRQ'
    });
    try {
      return await lastValueFrom(
        this.httpClient.get(url, { headers: headers })
      );
    } catch (error: any) {
      return { status: error.status, code: error.code, message: error.message };
    }
  }

  async obtenerData(){
    const customer = this.localSecureService.getValue('customer');
    const usuario = this.localSecureService.getValue('usuario');
    let resumenOfi:any = [];
    let resumenOfiGral:any = [];
    let resumenOfiDet:any = [];
    try{
      const dataOficinas:any = await this.resumen(customer.slug, usuario.idUsuario)
    if (dataOficinas['status']) {
      resumenOfi = dataOficinas['data'];
      resumenOfi.forEach((series:any) =>series.serie == ''? resumenOfiGral.push(series): resumenOfiDet.push(series));
      const personasEnFila =  resumenOfiGral.reduce((acc: any, item: any) => {
        return acc + item['turnosEnEspera'];
      }, 0);
      const finalizados =  resumenOfiGral.reduce((acc: any, item: any) => {
        return acc + item['finalizadosNormal'] + item['finalizadosUrgencia'];
      }, 0);
      const emitidos =  resumenOfiGral.reduce((acc: any, item: any) => {
        return acc + item['emitidosNormal'] + item['emitidosUrgencia'];
      }, 0);
      const anulados =  resumenOfiGral.reduce((acc: any, item: any) => {
        return acc + item['anulados'];
      }, 0);
      const atendiendo =  resumenOfiGral.reduce((acc: any, item: any) => {
        return acc + item['enAtencionNormal'] + item['enAtencionUrgencia'];
      }, 0);
      const escritorios =  resumenOfiGral.reduce((acc: any, item: any) => {
        return acc + item['ejecutivosActivos'] + item['ejecutivosEnPausa'];
      }, 0);
      const maxTpoOrdenado = resumenOfiGral.reduce((a: any, b: any) => (stringToSeconds(a.tiempoMaximoEspera) > stringToSeconds(b.tiempoMaximoEspera) ? a : b));
      const maxTpo = maxTpoOrdenado.tiempoMaximoEspera;
      const ofiMaxTpo = maxTpoOrdenado.oficina;
      return {
        resumenOfi,
        resumenOfiGral,
        resumenOfiDet,
        personasEnFila,
        finalizados,
        emitidos,
        anulados,
        atendiendo,
        escritorios,
        maxTpo,
        ofiMaxTpo,
        error:false
      }
    }
    else{
      return {
        resumenOfi,
        resumenOfiGral,
        resumenOfiDet,
        personasEnFila:0,
        finalizados:0,
        emitidos:0,
        anulados:0,
        atendiendo:0,
        escritorios:0,
        maxTpo:0,
        ofiMaxTpo:0,
        error:true
      }
    }
    } catch(e:any){
      console.log(e)
        return {
          resumenOfi,
          resumenOfiGral,
          resumenOfiDet,
          personasEnFila:0,
          finalizados:0,
          emitidos:0,
          anulados:0,
          atendiendo:0,
          escritorios:0,
          maxTpo:0,
          ofiMaxTpo:0,
          error:true
        }
    }
  }
  async obtenerDataSeparada(){
    const customer = this.localSecureService.getValue('customer');
    const usuario = this.localSecureService.getValue('usuario');
    let resumenOfi:any = [];
    let resumenOfiGral:any = [];
    let resumenOfiDet:any = [];
    const dataOficinas:any = await this.resumen(customer.slug, usuario.idUsuario)
    if (dataOficinas['status']) {
      resumenOfi = dataOficinas['data'];
      resumenOfi.forEach((series:any) =>series.serie == ''? resumenOfiGral.push(series): resumenOfiDet.push(series));
    };
    return {
      resumenOfiGral,
      resumenOfiDet,
    }
  }
  async obtenerDataByIdOficina(idOficina:any){
    const customer = this.localSecureService.getValue('customer');
    const usuario = this.localSecureService.getValue('usuario');
    let resumenOfi:any = [];
    const dataOficinas:any = await this.resumen(customer.slug, usuario.idUsuario)
    if (dataOficinas['status']) {
      resumenOfi = dataOficinas['data'];
    };
    const oficina = resumenOfi.find((oficina:any)=>oficina.idOficina == idOficina && oficina.serie == "")
    return oficina
  }
}
