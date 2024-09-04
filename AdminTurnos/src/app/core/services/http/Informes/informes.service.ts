import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { LocalService } from '../../storage/local.service';


@Injectable({
  providedIn: 'root',
})
export class InformesService {

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
    private localService: LocalService,
  ) {}

  async obtenerDetalleEspera(): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_informes']}/espera`;
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
    const url = `${config['endpoint_informes']}/excepcion`;
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
    const url = `${config['endpoint_informes']}/ejecutivos`;
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

  async informeEsperaAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/InformeGlobalAgrupado/resumenDeEspera`;
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

  async informeAtencionAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/InformeGlobalAgrupado/resumenDeAtenciones`;
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

  async informeEsperaNoAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/InformeGlobalNoAgrupado/ResumenDeEspera`;

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

    async informeAtencionNoAgrupado(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/InformeGlobalNoAgrupado/ResumenDeAtenciones`;
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

  async informeEstadoEjecutivo(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/InformeOficina/EstadoEjecutivo`;
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

  async informeRankingEjecutivo(data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${config['endpoint_report']}/InformeOficina/RankingEjecutivo`;
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

  async informeListaOficina(data:any): Promise<any> {
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

  // AFC
  async informeNivelServicio(data:any): Promise<any> {
    const {idUsuario, listIdOficina, fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/NivelesDeServicios?idUsuario=${idUsuario}&sidO=${listIdOficina}&sDI=${fechaInicio}&sDF=${fechaFin}`;
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

  async informeNivelServicioRegional(data:any): Promise<any> {
    const {idUsuario, listIdOficina, fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/NivelesDeServiciosRegional?idUsuario=${idUsuario}&sidO=${listIdOficina}&sDI=${fechaInicio}&sDF=${fechaFin}`;
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
  async informeAtencionesCategoria(data:any): Promise<any> {
    const {idUsuario, listIdOficina, fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/AtencionesPorCategoria??idUsuario=${idUsuario}&sidO=${listIdOficina}&sDI=${fechaInicio}&sDF=${fechaFin}`;
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
  async informePausasSucursal(data:any): Promise<any> {
    const {idUsuario, listIdOficina, fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/MotivosDePausa??idUsuario=${idUsuario}&sidO=${listIdOficina}&sDI=${fechaInicio}&sDF=${fechaFin}`;
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

  // reportes AFC batch

  async informeDWH(data:any): Promise<any> {
    const { fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/ObtenerDWH?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
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
  // https://adminv40.totalpack.cl/reporte/api/ReporteAfc/EjePau?listaOficina=1&fechaInicio=2024-01-01&fechaFin=2024-01-02

  async informeDWHPausas(data:any): Promise<any> {
    const {listIdOficina, fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/EjePau?listaOficina=${listIdOficina}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
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

  async informeDwhAtencionProveedores(data:any): Promise<any> {
    const { fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/AtePro?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
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

  async informeDwhAgendaListado(data:any): Promise<any> {
    const {listIdOficina, fechaInicio,fechaFin} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/AgeList?listaOficina=${listIdOficina}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
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
  // online
  async informeDwhOnlineZonas(data:any): Promise<any> {
    const {idUsuario, idZ} = data;
    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/OnlineZonas?idUsuario=${idUsuario}&idZ=${idZ}`;
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
  async informeDwhReporteDemanda(data:any): Promise<any> {

    const config = await this.config.getConfig();
    const url = `${config['endpoint_reportAFC']}/ReporteDeDemanda`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url,data, {
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
