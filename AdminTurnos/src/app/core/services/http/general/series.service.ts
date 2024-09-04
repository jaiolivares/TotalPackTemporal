import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { API_ENDPOINT } from 'src/app/core/config/config';
import { data } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  data: any;
  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
  ) {}
   getSerieId() {
   return this.data;
  }
  async obtenerSeries(slug:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=SER`;

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
  async obtenerSeriesPorOficina(slug:any,idOficina:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Admin/ListarDatosPorTipo?Slug=${slug}&tipo=SER&id=${idOficina}`;

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
  async obtenerSeriePorId(slug:any,idSerie:any, idOficina:any =false): Promise<any> {
    const config = await this.config.getConfig();
    let url;
    if(idOficina){
      url = `${API_ENDPOINT.apiAdmin2}/Serie/ObtenerSerie?Slug=${slug}&idSerie=${idSerie}&idOficina=${idOficina}`;
    } else {
      url = `${API_ENDPOINT.apiAdmin2}/Serie/ObtenerSerie?Slug=${slug}&idSerie=${idSerie}`;
    }
    

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
  async agregarSerie(slug:any,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Serie/AgregarSerie?Slug=${slug}`;
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
  async editarSerie(slug:any,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Serie/EditarSerie?Slug=${slug}`;
    try {
      return await lastValueFrom(
        this.httpClient.put(url,data, {
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
  async obtenerMotivosPorSerie(slug:any,idSerie:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/Motivo/ObtenerListaMotivoPorSerie?Slug=${slug}&idSerie=${idSerie}`;
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

  // Series por grupo
  async obtenerListaSerie(slug:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/SerieGrupo/ObtenerListaSerie?Slug=${slug}&idOficina=0`;
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
  async agregarSerieGrupo(slug:any,data:any): Promise<any> {
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/SerieGrupo/AgregarSerieGrupo?Slug=${slug}`;
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data,{
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
  // SerieGrupo/EliminarSerieGrupo?Slug=ttp_test&idUsuario=1&idOficina=0&idSerieMaestra=1
  async eliminarSerieGrupo(slug:any,data:any): Promise<any> {
    console.log(data);
    const{idUsuario,idOficina,idSerieMaestra} = data;
    const config = await this.config.getConfig();
    const url = `${API_ENDPOINT.apiAdmin2}/SerieGrupo/EliminarSerieGrupo?Slug=${slug}&idUsuario=${idUsuario}&idOficina=${idOficina}&idSerieMaestra=${idSerieMaestra}`;
    try {
      return await lastValueFrom(
        this.httpClient.delete(url, {
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
