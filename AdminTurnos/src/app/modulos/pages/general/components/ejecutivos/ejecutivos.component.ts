import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { EjecutivosService } from 'src/app/core/services/http/general/ejecutivos.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { GroupBy, OrderBy } from 'src/app/core/models/filtros.model';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';
import { BuscadorPipe } from 'src/app/core/pipes/buscador.pipe';
import * as XLSX from "xlsx";
import { FiltroPipe } from 'src/app/core/pipes/filtro.pipe';


@Component({
  selector: 'app-ejecutivos',
  templateUrl: './ejecutivos.component.html',
  styleUrls: ['./ejecutivos.component.css'],
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
export class EjecutivosComponent implements OnInit {

  constructor(
    private ejecutivosService: EjecutivosService,
    private localSecureService: LocalService,
    private spinner: NgxSpinnerService,
    public formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private estadoService: EstadoGeneralService,
    private localService: LocalService,
    private buscadorPipe: BuscadorPipe,
    private filtroPipe: FiltroPipe
  ) { }

  form!: FormGroup
  agregar = false;
  actualizar = false;
  idEje: number = 0;
  ejecutivos: any[] = [];
  totalEjecutivos: number = 0;
  page = 1;
  customer: any;
  usuario: any;
  permisosAdministracion: any

  searchText: string = '';
  mostrar = 'Todos';
  activeGroupBy: string = '';
  groupBy: GroupBy = {};

  isSubmitted: boolean = false;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      id: new FormControl('f', [Validators.required, Validators.min(1), Validators.max(100000000)]),
      usuario: ['', [Validators.required, Validators.pattern('^[.a-zA-Z0-9_-]*$'), Validators.maxLength(15), Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      habilitado: new FormControl(false),
      password: new FormControl("", [Validators.required, Validators.pattern('^\\S*$'), Validators.maxLength(15), Validators.minLength(3)]),
      validatePassword: new FormControl("", [Validators.required, Validators.pattern('^\\S*$'), Validators.maxLength(15), Validators.minLength(3)]),
      // validatePassword: new FormControl([""])
    });

    this.customer = this.localSecureService.getValue('customer');
    this.usuario = this.localSecureService.getValue('usuario');
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.obtenerEjecutivos();
  }

  async obtenerEjecutivos() {
    this.spinner.show("servicio-loading");
    (await this.ejecutivosService.obtenerEjecutivos(this.customer.slug))
      .subscribe(resp => {
        if (resp.status) {
          this.totalEjecutivos = resp['data'].length
          this.estadoService.setValor('totalEjecutivos', this.totalEjecutivos)
          this.ejecutivos = resp['data'];
          this.spinner.hide("servicio-loading");
        } else {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error', '¡Error al obtener ejecutivos!');
        }
      }, error => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', 'Error al obtener ejecutivos!');
      })
  }

  async tecleado(event: any) {
    this.searchText = event.value;
  }

  async onPageChange(page: number) {
    this.page = page;
  }


  agrupar(key: string, value: any) {
    if (key === '' || value === '') {
      this.groupBy = {};
      this.activeGroupBy = '';
      this.mostrar = 'Todos';
    } else {
      this.groupBy.key = key;
      this.groupBy.value = value;
      this.activeGroupBy = `${key}-${value}`;
      this.mostrar = value == true ? 'Activos' : 'Inactivos'
    }
    console.log(this.groupBy);
  }

  async selectEjecutivo(ejeId: any) {
    this.spinner.show("servicio-loading");
    this.agregar = true;
    this.actualizar = true
    const resp = await this.ejecutivosService.obtenerUnEjecutivo(this.customer.slug, ejeId);

    if (resp.status) {
      let ejecutivo = resp.data[0];
      this.idEje = ejecutivo.idEje;

      this.form.patchValue({
        id: ejecutivo.idEje,
        usuario: ejecutivo.username,
        nombre: ejecutivo.ejecutivo,
        password: ejecutivo.pass,
        validatePassword: ejecutivo.pass,
        habilitado: ejecutivo.fgok
      });

      this.spinner.hide("servicio-loading");
    } else {
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('error', '¡Error al obtener ejecutivo!');
    }
  }

  async enviarForm() {

    console.log(this.form);
    console.log(this.form.get('nombre')?.errors);

    this.isSubmitted = true;

    if (this.form.invalid) {
      this.handleErrors()
      return;
    } else if (this.form.value.password != this.form.value.validatePassword) {
      this.sweetAlertService.toastConfirm('warning', '¡Las claves deben coincidir!');
      return;
    }

    this.spinner.show("servicio-loading");
    if (this.actualizar) {
      const resp = await this.ejecutivosService.actualizarEjecutivo(this.customer.slug, this.usuario.idUsuario, this.form.value);

      if (resp.status && resp.data[0].codError == 0) {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('success', '¡Ejecutivo editado!');
        this.cerrarForm();
        this.obtenerEjecutivos();
      } else {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', `¡Error al actualizar! ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
      }
    } else {
      this.spinner.show("servicio-loading");
      const resp = await this.ejecutivosService.agregarEjecutivo(this.customer.slug, this.usuario.idUsuario, this.form.value);
      if (resp.status && resp.data[0].codError == 0) {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('success', '¡Ejecutivo agregado!');
        this.cerrarForm();
        this.obtenerEjecutivos();
      } else {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', `¡Error al agregar ejecutivo! ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
      }
    }

  }

  async borrarEjecutivo(idEje: number, ejeUser: string) {

    this.sweetAlertService.swalConfirm(`¿ Estás seguro que deseas eliminar al ejecutivo "${ejeUser}" ?`).then(async resp => {
      if (resp) {
        this.spinner.show("servicio-loading");
        const resp = await this.ejecutivosService.eliminarEjecutivo(this.customer.slug, this.usuario.idUsuario, idEje)

        if (resp.status && resp.data[0].codError == 0) {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('success', '¡Ejecutivo eliminado!');
          this.obtenerEjecutivos();
        } else {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error', `¡Error al eliminar! ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
      }
    });

  }

  cerrarForm() {
    this.isSubmitted = false;
    this.agregar = false;
    this.actualizar = false;
    this.idEje = 0;
    this.form.reset({ id: "f", habilitado: false });
  }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (keyError == 'required') {
            error = `El campo ${key} es requerido`;
          }
          if (key == 'usuario' && keyError == 'pattern') {
            error = `El campo usuario es inválido, de carácteres especiales solo se permite guión,guión bajo y punto, además no se permiten espacios.`;
          }
          if (key == 'password' && keyError == 'pattern') {
            error = `El campo clave no admite espacios en blanco`;
          }
          if (key == 'password' && keyError == 'maxlength') {
            error = `El campo clave admite máximo 15 caracteres`;
          }
          if (key == 'password' && keyError == 'minlength') {
            error = `El campo clave admite mínimo 3 caracteres`;
          }
          if (key == 'usuario' && keyError == 'maxlength') {
            error = `El campo usuario admite máximo 15 caracteres`;
          }
          if (key == 'usuario' && keyError == 'minlength') {
            error = `El campo usuario admite mínimo 3 caracteres`;
          }
          if (key == 'nombre' && keyError == 'maxlength') {
            error = `El campo nombre admite máximo 50 caracteres`;
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`;
          } else {
            mensajeErrores = `\n${error}\n`;
          }
        });
      }
    });
    this.sweetAlertService.toastConfirm(
      'error',
      `Error al registrar datos, debido a los siguientes errores:\n${mensajeErrores}`
    );
  }

  exportarDataExcel() {
    const dataFiltradaPorBusqueda = this.buscadorPipe.transform(this.ejecutivos, this.searchText, ['idEjecutivo', 'userName', 'ejecutivo']);
    const dataAgrupada = this.filtroPipe.transform(dataFiltradaPorBusqueda, this.groupBy);
    console.log(dataAgrupada.length);
    if (dataAgrupada.length > 0) {
      const binaryWS = XLSX.utils.json_to_sheet(dataAgrupada);
      // Create a new Workbook
      var wb = XLSX.utils.book_new()
      // Name your sheet
      XLSX.utils.book_append_sheet(wb, binaryWS, `Ejecutivos`)

      // export your excel
      XLSX.writeFile(wb, `Ejecutivos.xlsx`);
    }
  }

}
