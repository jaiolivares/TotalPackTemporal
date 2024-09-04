import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsuariosService } from 'src/app/core/services/http/general/usuarios.service';
import { PermisosAdministracionComponent } from './components/permisos-administracion/permisos-administracion.component';

import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { PermisosOficinasComponent } from './components/permisos-oficinas/permisos-oficinas.component';
import { EstadoGeneralService } from 'src/app/core/services/pages/generales.service';
import { GroupBy } from 'src/app/core/models/filtros.model';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { EjecutivosService } from 'src/app/core/services/http/general/ejecutivos.service';
import { BuscadorPipe } from 'src/app/core/pipes/buscador.pipe';
import { FiltroPipe } from 'src/app/core/pipes/filtro.pipe';
import * as XLSX from "xlsx";

import { PerfilesService } from 'src/app/core/services/http/alarmas/perfiles.service';

@Component({
  selector: "app-usuarios",
  templateUrl: "./usuarios.component.html",
  styleUrls: ["./usuarios.component.css"],
  animations: [
    trigger("openClose", [
      state(
        "open",
        style({
          height: "*",
          opacity: "1",
          visibility: "visible",
        })
      ),
      state(
        "closed",
        style({
          height: "0px",
          opacity: "0",
          "margin-bottom": "-100px",
          visibility: "hidden",
        })
      ),
      transition("open => closed", [animate("0.5s")]),
      transition("closed => open", [animate("0.5s")]),
    ]),
  ],
})
export class UsuariosComponent implements OnInit {
  usuarios: any = [];
  customer: any;
  usuario: any;
  permisosAdministracion: any;
  totalUsuarios: any = 0;
  usuarioSeleccionado: any;
  p = 1;
  order = "";
  searchText: string = "";
  mostrar = "Todos";
  activeGroupBy: string = "";
  groupBy: GroupBy = {};
  @ViewChild(PermisosAdministracionComponent)
  permisosAdministrador!: PermisosAdministracionComponent;

  @ViewChild(PermisosOficinasComponent)
  permisosOficinasAdministrador!: PermisosOficinasComponent;

  public isSubmitted = false;
  agregar = false;
  editar = false;

  usaAlarmas: boolean = false;
  listaAlarmas: any;

  constructor(
    private usuariosService: UsuariosService,
    private spinner: NgxSpinnerService,
    private sweetAlertService: SweetAlertService,
    private formBuilder: FormBuilder,
    private estadoService: EstadoGeneralService,
    private localService: LocalService,
    private ejecutivosService: EjecutivosService,
    private buscadorPipe: BuscadorPipe,
    private filtroPipe: FiltroPipe,
    private alarmaService: PerfilesService
  ) {}

  public form = this.formBuilder.group({
    id: ["", [Validators.required, Validators.min(1), Validators.max(100000000)]],
    usuario: ["", [Validators.required, Validators.pattern("^[.a-zA-Z0-9_-]*$"), Validators.maxLength(15), Validators.minLength(3)]],
    nombre: ["", [Validators.required, Validators.maxLength(50)]],
    email: ["", [Validators.required]],
    usuarioClave: ["", [Validators.required, Validators.pattern("^\\S*$"), Validators.maxLength(15), Validators.minLength(3)]],
    validarPass: ["", [Validators.required, Validators.pattern("^\\S*$"), Validators.maxLength(15), Validators.minLength(3)]],
    // validarPass: ['', []],
    activo: [true],
    crearEjecutivo: [false],
    alarma: "",
  });

  ngOnInit() {
    this.permisosAdministracion = this.localService.getValue("permisosAdministracion");
    this.usuario = this.localService.getValue("usuario");
    this.customer = this.localService.getValue("customer");
    this.obtenerUsuarios();
    this.usaAlarmas = this.usaPropiedadAlarmas();
    if (this.usaAlarmas) {
      this.obtenerAlarmas();
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (keyError == "required") {
            error = `El campo ${key} es requerido`;
          }
          if (key == "usuario" && keyError == "pattern") {
            error = `El campo usuario es inválido, de carácteres especiales solo se permite guión, guión bajo y punto, además no se permiten espacios.`;
          }
          if (key == "usuarioClave" && keyError == "pattern") {
            error = `El campo clave no admite espacios en blanco`;
          }
          if (key == "usuarioClave" && keyError == "maxlength") {
            error = `El campo clave admite máximo 15 caracteres`;
          }
          if (key == "usuarioClave" && keyError == "minlength") {
            error = `El campo clave admite mínimo 3 caracteres`;
          }
          if (key == "usuario" && keyError == "maxlength") {
            error = `El campo usuario admite máximo 15 caracteres`;
          }
          if (key == "usuario" && keyError == "minlength") {
            error = `El campo usuario admite mínimo 3 caracteres`;
          }
          if (key == "nombre" && keyError == "maxlength") {
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
    this.sweetAlertService.toastConfirm("error", `Error al registrar datos, debido a los siguientes errores:\n${mensajeErrores}`);
  }

  async obtenerUsuarios(p = 1) {
    this.spinner.show("servicio-loading");
    const resp = await this.usuariosService.obtenerUsuarios(p);
    this.spinner.hide("servicio-loading");

    if (!resp["status"]) {
      this.usuarios = [];
      return;
    }

    this.usuarios = resp["data"].map((item: any) => {
      return {
        id: item["idUsuario"],
        usuario: item["userName"],
        nombre: item["usuario"],
        activo: item["fgOk"] ? 1 : 0,
        email: "",
      };
    });
    this.usuarios = this.usuarios.filter((usuario: any) => usuario.id !== 1);
    // this.usuarios = usuarioTEMP.filter((usuario: any) =>
    //   usuario.nombre.toUpperCase().includes(this.searchText.toUpperCase())
    // );

    this.totalUsuarios = this.usuarios.length;
    this.estadoService.setValor("totalUsuarios", resp.data.length);
    // this.p = 1;
  }

  usaPropiedadAlarmas() {
    const parametros = JSON.parse(this.customer.parametros);
    return parametros.fAlarma === undefined ? false : parametros.fAlarma;
  }

  async obtenerAlarmas() {
    this.spinner.show("servicio-loading");
    const resp = await this.alarmaService.obtenerPerfiles();
    if (resp["status"]) {
      this.listaAlarmas = resp.data;
    }
    this.spinner.hide("servicio-loading");
  }

  async onPageChange(p: any) {
    await this.obtenerUsuarios(p);
  }

  async tecleado(event: any) {
    this.searchText = event.value;
    this.p = 1;
    // await this.obtenerUsuarios();
  }

  async selectUsuario(usuario: any) {
    this.agregar = false;

    this.spinner.show("servicio-loading");
    let resp = await this.usuariosService.obtenerUsuario(usuario.id);
    this.spinner.hide("servicio-loading");

    if (!resp["status"]) {
      this.agregar = false;
      this.editar = false;
      return;
    }

    //console.log(resp['data']);

    let officinasUserTEMP = [];
    let permisossUserTEMP = [];

    let usuarioTEMP = resp["data"][0];

    this.form.patchValue({
      usuario: usuarioTEMP["userName"],
      nombre: usuarioTEMP["usuario"],
      usuarioClave: usuarioTEMP["pass"],
      validarPass: usuarioTEMP["pass"],
      email: usuarioTEMP["mail"],
      id: usuarioTEMP["idUsuario"],
      activo: usuarioTEMP["fgOk"],
      alarma: usuarioTEMP["idAlarma"] === null ? 0 : usuarioTEMP["idAlarma"],
    });

    if (usuarioTEMP["jsonOficinas"]) {
      let oficinasTEMP = JSON.parse(usuarioTEMP["jsonOficinas"]);
      if (oficinasTEMP.length > 0) {
        officinasUserTEMP = oficinasTEMP.map((item: any) => item["IdOfi"]);
      }
    }

    if (usuarioTEMP["jsonPermisos"]) {
      let permisosTEMP = JSON.parse(usuarioTEMP["jsonPermisos"]);
      permisossUserTEMP = permisosTEMP;
    } else {
      const permisosEjemplo: any = {
        IdUsr: usuarioTEMP["idUsuario"],
        eje_add: false,
        eje_edit: false,
        eje_del: false,
        zon_add: false,
        zon_edit: false,
        zon_del: false,
        ofi_add: false,
        ofi_edit: false,
        ofi_del: false,
        ser_add: false,
        ser_edit: false,
        ser_del: false,
        mnu_add: false,
        mnu_edit: false,
        mnu_del: false,
        mot_add: false,
        mot_edit: true,
        mot_del: false,
        pau_add: false,
        pau_edit: false,
        pau_del: false,
        esc_add: false,
        esc_edit: false,
        esc_del: false,
        bot_add: false,
        bot_edit: false,
        bot_del: false,
        pan_add: false,
        pan_edit: false,
        pan_del: false,
        rep_add: false,
        rep_edit: false,
        rep_del: false,
        bat_add: false,
        bat_edit: false,
        bat_del: false,
        usr_add: false,
        usr_edit: false,
        usr_del: true,
        sxo_set: true,
      };

      delete permisosEjemplo.IdUsr;

      permisossUserTEMP = permisosEjemplo;
    }

    this.usuarioSeleccionado = usuarioTEMP;
    this.permisosOficinasAdministrador.initForm(officinasUserTEMP);
    this.permisosAdministrador.checkedAll = false;
    this.permisosAdministrador.checkedAllAccesos = false;
    this.permisosOficinasAdministrador.checkedAll = false;
    this.permisosAdministrador.asignarPermisos(permisossUserTEMP);
    this.editar = true;
  }

  public cancelarSaveUsuario() {
    this.isSubmitted = false;
    this.agregar = false;
    this.editar = false;
  }

  public async saveUsuario() {
    try {
      this.isSubmitted = true;

      if (this.editar) {
        this.form.get("id")?.setValidators([Validators.required, Validators.min(1), Validators.max(100000000)]);
        // this.form.get('usuarioClave')?.clearValidators();
        this.form.get("id")?.updateValueAndValidity();
        // this.form.get('usuarioClave')?.updateValueAndValidity();
      } else {
        this.form.get("id")?.clearValidators();
        // this.form.get('usuarioClave')?.setValidators([Validators.required,Validators.pattern('^\\S*$'),Validators.maxLength(15)]);
        this.form.get("id")?.updateValueAndValidity();
        // this.form.get('usuarioClave')?.updateValueAndValidity();
      }

      if (this.form.invalid) {
        this.handleErrors();
        return;
      }

      if (this.form.get("usuarioClave")?.value !== this.form.get("validarPass")?.value) {
        this.sweetAlertService.toastConfirm("error", `Error al registrar datos, debido a los siguientes errores:\n Las claves deben ser iguales`);
        return;
      }
      this.spinner.show("servicio-loading");
      let permisosEditarUsuario: any = {};
      this.permisosAdministrador.permisosGlobales.forEach((item: any) => {
        switch (item.modulo) {
          case "Módulo Reportería":
            permisosEditarUsuario = { ...permisosEditarUsuario, rep_add: item.permisos.rep_add, rep_del: false };
            break;
          case "Derivación de turnos (Reportería)":
            permisosEditarUsuario = { ...permisosEditarUsuario, rep_edit: item.permisos.rep_edit, rep_del: false };
            break;
          case "Históricos (Reportería)":
            permisosEditarUsuario = { ...permisosEditarUsuario, bat_add: item.permisos.bat_add };
            break;
          case "Módulo Config. General":
            permisosEditarUsuario = { ...permisosEditarUsuario, bat_edit: item.permisos.bat_edit };
            break;
          case "Módulo Config. Oficinas":
            permisosEditarUsuario = { ...permisosEditarUsuario, bat_del: item.permisos.bat_del };
            break;
          case "Módulo Medicos":
            permisosEditarUsuario = { ...permisosEditarUsuario, rep_del: item.permisos.rep_del };
            break;
          default:
            permisosEditarUsuario = { ...permisosEditarUsuario, ...item.permisos };
            break;
        }
        // if(item.modulo == 'General'){
        //   permisosEditarUsuario = { ...permisosEditarUsuario, rep_add:item.permisos.rep_add,rep_del:false };
        // } else if (item.modulo === 'Derivación de turnos'){
        //   permisosEditarUsuario = { ...permisosEditarUsuario, rep_edit:item.permisos.rep_edit,rep_del:false };
        // } else {
        //   permisosEditarUsuario = { ...permisosEditarUsuario, ...item.permisos };
        // }
      });
      let permisosOficinas: any = this.permisosOficinasAdministrador.oficinasSelected.map((item: any) => {
        return { IdOfi: item };
      });

      let dataForm: any = {
        usuario: this.form.get("nombre")?.value,
        userName: this.form.get("usuario")?.value,
        mail: this.form.get("email")?.value,
        jsonPermisos: JSON.stringify(permisosEditarUsuario),
        jsonOficinas: JSON.stringify(permisosOficinas),
        fgOk: this.form.get("activo")?.value ?? false,
        idUsuarioEdit: parseInt(this.form.get("id")?.value),
        idAlarma: this.form.get("alarma")?.value ?? 0,
      };

      if (this.editar) {
        permisosEditarUsuario["IdUsr"] = this.form.get("id")?.value;
        dataForm["pass"] = this.form.get("usuarioClave")?.value && this.form.get("usuarioClave")?.value !== "" ? this.form.get("usuarioClave")?.value : this.usuarioSeleccionado["pass"];
      } else {
        dataForm["pass"] = this.form.get("usuarioClave")?.value;
      }

      let resp: any;
      let respEjecutivo: any;

      if (this.editar) {
        resp = await this.usuariosService.editarUsuario(this.form.get("id")?.value, dataForm);
      } else {
        resp = await this.usuariosService.agregarUsuario(dataForm);
      }
      if (resp.status && resp.data[0].codError == 0) {
        if (this.editar) {
          this.sweetAlertService.toastConfirm("success", "El usuario se ha actualizado con éxito");
        } else {
          if (this.form.get("crearEjecutivo")?.value) {
            let ejecutivosForm = {
              Ejecutivo: dataForm.usuario,
              userName: dataForm.userName,
              pass: dataForm.pass,
              fgok: dataForm.fgOk,
              idUser: this.usuario.idUsuario,
              Data: "",
            };
            respEjecutivo = await this.ejecutivosService.agregarEjecutivoDesdeUsuarios(this.customer.slug, ejecutivosForm);
            if (respEjecutivo.status && respEjecutivo.data[0].codError == 0) {
              this.sweetAlertService.toastConfirm("success", "El usuario y el ejecutivo se han agregado con éxito");
            } else {
              this.sweetAlertService.toastConfirm("success", `El usuario se ha creado con éxito pero el ejecutivo no, debido al siguiente error:\n ${respEjecutivo.data?.[0]?.["msg"] ? "- " + respEjecutivo.data?.[0]?.["msg"] : ""}`);
            }
          } else {
            this.sweetAlertService.toastConfirm("success", "El usuario se ha agregado con éxito");
          }
        }
        this.agregar = false;
        this.editar = false;
        this.spinner.hide("servicio-loading");
        this.obtenerUsuarios();
      } else {
        this.sweetAlertService.toastConfirm("error", `Error al registrar datos  ${resp.data?.[0]?.["msg"] ? "- " + resp.data?.[0]?.["msg"] : ""}`);
      }
      this.spinner.hide("servicio-loading");
    } catch (e) {
      console.log(e);
      this.sweetAlertService.toastConfirm("error", `Error al registrar datos`);
      this.spinner.hide("servicio-loading");
    }
  }

  public nuevoUsuario() {
    this.agregar = true;
    this.editar = false;
    this.usuarioSeleccionado = {};
    this.permisosOficinasAdministrador.initForm([]);
    this.permisosAdministrador.checkedAll = false;
    this.permisosAdministrador.checkedAllAccesos = false;
    this.permisosOficinasAdministrador.checkedAll = false;
    this.permisosAdministrador.asignarPermisos({});
    this.form.reset();
    this.form.patchValue({ activo: false, alarma: 0 });
  }

  public async eliminarUsuario(usuario: any) {
    const resp = await this.sweetAlertService.swalConfirm(`¿Estás seguro de eliminar al usuario "${usuario["nombre"]}"?`);
    if (resp) {
      const resp = await this.usuariosService.eliminarUsuario(usuario["id"]);
      if (resp.status && resp.data[0].codError == 0) {
        this.sweetAlertService.toastConfirm("success", "El usuario se ha eliminado con éxito");
        this.obtenerUsuarios();
      } else {
        this.sweetAlertService.toastConfirm("error", `Error al eliminar usuario  ${resp.data?.[0]?.["msg"] ? "- " + resp.data?.[0]?.["msg"] : ""}`);
      }
    }
  }

  ordenar(order: string) {
    switch (order) {
      case "activo":
        this.usuarios = this.usuarios.sort((a: any, b: any) => (a.activo > b.activo ? -1 : 1));

        break;
      case "inactivo":
        this.usuarios = this.usuarios.sort((a: any, b: any) => (a.activo < b.activo ? -1 : 1));
        break;
    }
  }

  agrupar(key: string, value: any) {
    if (key === "" || value === "") {
      this.groupBy = {};
      this.activeGroupBy = "";
      this.mostrar = "Todos";
    } else {
      this.groupBy.key = key;
      this.groupBy.value = value;
      this.activeGroupBy = `${key}-${value}`;
      this.mostrar = value == true ? "Activos" : "Inactivos";
    }
  }

  exportarDataExcel() {
    const dataFiltradaPorBusqueda = this.buscadorPipe.transform(this.usuarios, this.searchText, ["nombre", "usuario"]);
    const dataAgrupada = this.filtroPipe.transform(dataFiltradaPorBusqueda, this.groupBy);
    console.log(dataAgrupada.length);
    if (dataAgrupada.length > 0) {
      const binaryWS = XLSX.utils.json_to_sheet(dataAgrupada);
      // Create a new Workbook
      var wb = XLSX.utils.book_new();
      // Name your sheet
      XLSX.utils.book_append_sheet(wb, binaryWS, `Usuarios`);

      // export your excel
      XLSX.writeFile(wb, `Usuarios.xlsx`);
    }
  }
}
