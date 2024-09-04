import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';
import { data } from 'jquery';
import { filter } from 'rxjs/operators';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: '1',
        'visibility': 'visible'
      })),
      state('closed', style({
        height: '0px',
        opacity: '0',
        'margin-bottom': '-100px',
        'visibility': 'hidden'
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ]
})
export class ServiciosComponent implements OnInit {


  constructor(
    private seriesService: SeriesService,
    public formBuilder: FormBuilder,
    private localService: LocalService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private estadoService: EstadoGeneralService
  ) { }

  agregar = false;
  editar = false;
  detalle = false;
  agrupar = false;
  error = false;
  isLoading = false;
  errorMsg = "";
  form!: FormGroup;
  series: any;
  permisosAdministracion: any;
  selectedSerie: any;

  async ngOnInit() {
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    await this.obtenerSeries();
  }

  async obtenerSeries() {
    this.error = false;
    this.isLoading = true;
    this.spinner.show("servicio-get-series-loading");
    try {
      let resp = await this.seriesService.obtenerListaSerie(this.localService.getValue('customer').slug);
      if (resp['status'] == true) {
        this.estadoService.setValor('totalSeries', resp.data.length)
        if (resp.data.length > 0) {
          this.series = resp.data; //.filter((element:any) => element.idGrupoG === null);

        } else {
          this.error = true;
          this.errorMsg = 'No se han encontrado series'
        }

      } else {
        this.error = true;
        this.errorMsg = 'Ha ocurrido un error al obtener las series'
      }
    } catch (e: any) {
      this.error = true;
      this.errorMsg = 'Ha ocurrido un error al obtener las series'
    }
    this.spinner.hide("servicio-get-series-loading");
    this.isLoading = false;
    return;
  }

  enviarForm() {
    this.agregar = false;
  }
  async recargarSeries() {
    await this.obtenerSeries();
  }
  volverADatos() {
    this.agregar = false;
    this.editar = false;
    this.detalle = false;
    this.agrupar = false;
    this.selectedSerie = "";
    this.recargarSeries();
  }
  irAEditar(data: any) {
    const dato = {
      id: data.idSerie, valor: data.serie
    }
    this.agregar = false;
    this.editar = true;
    this.agrupar = false;
    this.selectedSerie = dato;

  }
  irADetalle(data: any) {
    const dato = {
      id: data.idSerie, valor: data.serie
    }
    this.agregar = false;
    this.editar = false;
    this.detalle = true;
    this.agrupar = false;
    this.selectedSerie = dato;

  }
  irAgrupar(data: any) {
    this.agregar = false;
    this.editar = false;
    this.detalle = false;
    this.agrupar = true;
    this.selectedSerie = data;
    this.seriesService.data = data;
  }

  listadoSeriesAgrupadas(serieData: any) {
    const seriesAgrupadas = this.series
    .filter((s: any) => s.fGrupo === false && s.idGrupoG !== null)
    .map((s: any) => ({ serie: s.serie, idGrupoG: s.idGrupoG }))
    .filter((s: any) => serieData.idSerie === s.idGrupoG) // Filtrar por idSerie
  return seriesAgrupadas.map((s: any) => `${s.serie}`).join(' - ');
  }

  nombreSeriePorId(idGrupoG: number): string | null {
    const serieEncontrada = this.series.find((serie: any) => serie.idSerie === idGrupoG);
    // Si se encuentra la serie, se devuelve su nombre, de lo contrario, se devuelve null
    return serieEncontrada ? serieEncontrada.serie : null;
  }
  
  mensaje(dato: any) {
    //series devuelve solo las series que  no pertenecen a un grupo porque idGrupoG es null
    const series = this.series.filter((element: any) => element.idGrupoG === null);
    //si la serie no esta en la lista de series significa que pertenece a un grupo
    const serie = series.some((element: any) => element.idSerie === dato.idSerie);
    if (!serie) {
      this.sweetAlertService.toastConfirm('warning', `Serie N°${dato.idSerie} - ${dato.serieBoton}, pertenece al grupo ${dato.idGrupoG}`);
    }
    return;
  }

}
