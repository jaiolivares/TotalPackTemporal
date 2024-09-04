
import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { MotivosPausaService } from 'src/app/core/services/http/general/motivos-pausa.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';

@Component({
  selector: 'app-motivos-pausa',
  templateUrl: './motivos-pausa.component.html',
  styleUrls: ['./motivos-pausa.component.css'],
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
export class MotivosPausaComponent implements OnInit {

  constructor(
    private localSecureService: LocalService,
    private motivosService: MotivosPausaService,
    private sweetAlertService: SweetAlertService,
    private spinner: NgxSpinnerService,
    public formBuilder: FormBuilder,
    private estadoService: EstadoGeneralService,
    private localService: LocalService
  ) { }

  agregar = false;
  actualizar: boolean = false;
  idMot!: number;
  motivos: any[] = [];
  motivosDeshabilitados: any[] = [];
  form!: FormGroup;
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
            this.estadoService.setValor('totalMotivosPausa', resp.data.length);
            this.spinner.hide("servicio-loading");
          } else {
            this.spinner.hide("servicio-loading");
            this.sweetAlertService.toastConfirm('error', 'Error al obtener motivos!');
          }
        }
      }), (error: any) => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', 'Error al obtener motivos!');
      };
  }

  async mostrarMotivo(motivo: any) {
    this.agregar = true;
    this.actualizar = true;

    this.spinner.show("servicio-loading");
    const resp = await this.motivosService.obtenerMotivoId(this.customer.slug, motivo.id)

    if (resp.status) {
      this.idMot = motivo.id;
      this.form.patchValue({
        id: resp.data[0].idPausa,
        motivo: resp.data[0].pausa
      })
      this.spinner.hide("servicio-loading");
    } else {
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('error', 'Error al obtener motivo!');
    }
  }

  cerrarForm() {
    this.isSubmitted = false;
    this.agregar = false;
    this.actualizar = false;
    this.idMot = 0;
    this.form.reset({ id: "f" });
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

}


