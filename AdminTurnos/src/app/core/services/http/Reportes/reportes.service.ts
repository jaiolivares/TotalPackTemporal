import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { LocalService } from '../../storage/local.service';
import { data } from 'jquery';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
    private localService: LocalService,
  ) {}

  async obtenerDetalleEspera(): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportes']}/espera`;
    try {
      return await lastValueFrom(
        this.httpClient.get(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async derivarTurno(idTurno:any,idEsc:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportes']}/excepcion`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url,{idTurno:idTurno, idEsc:idEsc}, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
  async obtenerEjecutivos(): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportes']}/ejecutivos`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async reporteEsperaAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/ReporteGlobalAgrupado/resumenDeEspera`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async reporteAtencionAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/ReporteGlobalAgrupado/resumenDeAtenciones`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async reporteEsperaNoAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/ReporteGlobalNoAgrupado/ResumenDeEspera`;
    
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
        );
      } catch (error: any) {
        return { status: false, code: error?.code, message: error?.message };
      }
    }
    
    async reporteAtencionNoAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/ReporteGlobalNoAgrupado/ResumenDeAtenciones`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async reporteEstadoEjecutivo(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/ReporteOficina/EstadoEjecutivo`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async reporteRankingEjecutivo(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/ReporteOficina/RankingEjecutivo`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }

  async reporteListaOficina(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/Auxiliar/ListaDeOficinas?Slug=${data}`;
    try {
      return await lastValueFrom(
        this.httpClient.get(url, {
          headers: {
            'Content-Type': 'application/json',
            ApiKey: config['ApiKey'],
          },
        })
      );
    } catch (error: any) {
      return { status: false, code: error?.code, message: error?.message };
    }
  }
}
