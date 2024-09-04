import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { MotivosAtencionService } from 'src/app/core/services/http/general/motivos-atencion.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';

@Component({
  selector: 'app-motivos-atencion',
  templateUrl: './motivos-atencion.component.html',
  styleUrls: ['./motivos-atencion.component.css'],
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
    trigger('abrirCerrar', [
      state('abrir', style({
        height: '*',
        opacity: '1',
        'visibility': 'visible'
      })),
      state('cerrar', style({
        height: '0px',
        opacity: '0',
        'margin-bottom': '-100px',
        'visibility': 'hidden'
      })),
      transition('abrir => cerrar', [
        animate('0.5s')
      ]),
      transition('cerrar => abrir', [
        animate('0.5s')
      ]),
    ]),
  ]
})

export class MotivosAtencionComponent implements OnInit {


  constructor(
    private localSecureService: LocalService,
    private motivosService: MotivosAtencionService,
    private SeriesService: SeriesService,
    private sweetAlertService: SweetAlertService,
    private spinner: NgxSpinnerService,
    public formBuilder: FormBuilder,
    private estadoService: EstadoGeneralService,
    private localService: LocalService
  ) { }

  motivos: any[] = [];
  motivoSeries: any[] = [];
  listaSeries: any[] = [];
  listaSerieOriginal: any[] = [];
  form!: FormGroup;
  agregar: boolean = false;
  actualizar: boolean = false;
  idMot!: number;
  nombreMot: string = "";
  series = false;
  customer: any;
  usuario: any
  permisosAdministracion: any
  isSubmitted: boolean = false;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      id: new FormControl("f", [Validators.required]),
      motivo: new FormControl("", [Validators.required]),
    });
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.usuario = this.localSecureService.getValue('usuario');
    this.customer = this.localSecureService.getValue('customer');
    this.obtenerMotivos();
  }

  async obtenerMotivos() {
    this.spinner.show("servicio-loading");
    (await this.motivosService.obtenerMotivos(this.customer.slug))
      .subscribe({
        next: async (resp: any) => {
          if (resp.status) {
            this.motivos = resp.data;
            this.estadoService.setValor('totalMotivos', resp.data.length)
            this.spinner.hide("servicio-loading");
          } else {
            this.spinner.hide("servicio-loading");
            this.sweetAlertService.toastConfirm('error', '¡Error al obtener motivos!');
          }
        }
      }), (error: any) => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', '¡Error al obtener motivos!');
      };
  }

  mostrarMotivo(motivo: any) {
    this.agregar = true;
    this.actualizar = true;
    this.idMot = motivo.id;

    this.form.patchValue({
      id: motivo.id,
      motivo: motivo.valor
    })
  }

  async mostrarSeriesMotivo(motivo: any) {
    this.series = true;
    this.nombreMot = motivo.valor;
    this.idMot = motivo.id;

    this.spinner.show("servicio-loading");
    (await this.motivosService.obtenerSeriesMotivo(this.customer.slug, motivo.id))
      .subscribe({
        next: async (resp: any) => {
          if (resp.status) {
            this.motivoSeries = resp.data;
            let ids = this.motivoSeries.map(data => data.idSerie);
            this.obtenerSeires(ids);
            this.spinner.hide("servicio-loading");
          } else {
            this.spinner.hide("servicio-loading");
            this.sweetAlertService.toastConfirm('error', '¡Error al obtener series!');
          }
        }
      }), (error: any) => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', '¡Error al obtener series!');
      };
  }

  async obtenerSeires(ids: any) {
    const resp = await this.SeriesService.obtenerSeries(this.customer.slug)
    if (resp.status) {
      this.listaSeries = await resp.data.filter((item: any) => !ids.find((id: any) => item.id == id));
      this.listaSerieOriginal = this.listaSeries;
      this.spinner.hide("servicio-loading");
    } else {
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('error', '¡Error al obtener listado de series!');
    }
  }

  async editarSeries(id: number, select: any, edit: boolean) {

    if (select) {
      let selected = this.listaSeries.filter(item => item.id == select.value);
      this.motivoSeries.push({ idOficina: 0, idMotivo: this.idMot, idSerie: selected[0].id, serie: selected[0].valor, active: true })
      this.listaSeries = this.listaSeries.filter(item => item.id != select.value);
    }

    if (id) {
      let index = this.motivoSeries.findIndex(index => index.idSerie == id);
      if (this.motivoSeries[index].desactive == true) {
        this.motivoSeries[index].desactive = false;
      } else {
        if (this.motivoSeries[index].active == true) {
          this.motivoSeries.splice(index, 1);
          let data = this.listaSerieOriginal.filter((item: any) => !this.motivoSeries.find((item2: any) => item.id == item2.idSerie));
          this.listaSeries = data;
        } else {
          this.motivoSeries[index].desactive = true;
        }
      }
    }

    let seriesId = this.motivoSeries.filter(item => item.desactive != true);
    let ids = seriesId.map(item => item.idSerie);


    if (!edit) {
      return;
    }


    this.spinner.show("servicio-loading");

    let resp = await this.motivosService.agregarSerieAMotivo(this.customer.slug, this.usuario.idUsuario, this.idMot, ids.toString());
    if (resp.status && resp.data[0].codError == 0) {
      this.sweetAlertService.toastConfirm('success', '¡Series Editadas!');
      this.listaSeries = [];
      let motivo = { valor: this.nombreMot, id: this.idMot }
      await this.mostrarSeriesMotivo(motivo);
    } else {
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('error', `¡Error al editar series!  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
    }

  }

  CerrarSeries() {
    this.series = false;
    this.motivoSeries = [];
    this.idMot = 0;
  }

  async enviarForm() {
    this.isSubmitted = true;

    if (this.form.invalid) {
      this.sweetAlertService.toastConfirm('warning', '¡Por favor ingrese los campos!');
      return;
    }

    this.spinner.show("servicio-loading");

    if (this.actualizar) {
      const resp = await this.motivosService.actualizarMotivo(this.customer.slug, this.usuario.idUsuario, this.form.value);
      if (resp.status && resp.data[0].codError == 0) {
        this.sweetAlertService.toastConfirm('success', '¡Motivo editado!');
        this.cerrarForm();
        this.obtenerMotivos();
      } else {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', `¡Error al actualizar!  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
      }
    } else {
      const resp = await this.motivosService.agregarMotivo(this.customer.slug, this.usuario.idUsuario, this.form.value);
      if (resp.status && resp.data[0].codError == 0) {
        this.sweetAlertService.toastConfirm('success', '¡Motivo agregado!');
        this.cerrarForm();
        this.obtenerMotivos();
      } else {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', `¡Error al agregar!  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
      }
    }

  }

  eliminarMotivo(motivo: any) {
    this.sweetAlertService.swalConfirm(`¿ Estás seguro que deseas eliminar el motivo "${motivo.valor}" ?`).then(async resp => {
      if (resp) {
        this.spinner.show("servicio-loading");
        const resp = await this.motivosService.eliminarMotivo(this.customer.slug, this.usuario.idUsuario, motivo.id)

        if (resp.status && resp.data[0].codError == 0) {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('success', '¡Motivo eliminado!');
          this.obtenerMotivos();
        } else {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error', `¡Error al eliminar!  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
      }
    });
  }

  cerrarForm() {
    this.isSubmitted = true;

    this.agregar = false;
    this.actualizar = false;
    this.idMot = 0;
    this.form.reset({ id: "f" });
  }

}
