import { Router } from '@angular/router';
import { LocalService } from './../../../core/services/storage/local.service';
import { Component, OnInit } from '@angular/core';
import { RutaService } from 'src/app/core/services/utils/ruta.service';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  rutaRes!:string;
  ruta!:string;
  customer: any;
  usuario: any;
  timerConfig:any;
  constructor(
    private rutaService: RutaService,
    private localSecureService: LocalService,
    private router: Router,
    private timerService: TimerService,
    private authService: AuthService,
    private sweetAlertService: SweetAlertService
    ) {
    this.rutaService.rutaActiva().subscribe(res => {
      this.rutaRes = res;
      if(this.rutaRes){
        const rutaRes = this.rutaRes.split('/');
        this.ruta = rutaRes[rutaRes.length - 1];
      }
    })
  }

  ngOnInit(): void {
    this.timerConfig = this.localSecureService.getValue('timerInterval');
    const rutaRes = this.rutaRes.split('/');
    this.ruta = rutaRes[rutaRes.length - 1];
    this.customer = this.localSecureService.getValue('customer');
    this.usuario = this.localSecureService.getValue('usuario');
  }
  actualizarTimerConfig(){
    this.localSecureService.setValue('timerInterval',parseInt(this.timerConfig));
    this.timerService.stopTimer();
    this.timerService.initTimer();
  }

  async refrescarUsuario(){
    const username = this.localSecureService.getValue('username');
    const userPass = this.localSecureService.getValue('userpass');
    const customer = this.localSecureService.getValue('customer');
    const slug = customer.slug;
    try{
      const dataLogin = {
        "userName": username,
        "pass": userPass,
      }
      const resp:any = await this.authService.login(slug, dataLogin)
      if (resp.status && resp['data'][0].codError === 0) {
        this.autenticar(resp);
      } else {
        this.sweetAlertService.swalErrorLogin(
          '¡Lo sentimos!',
          'Ha ocurrido un error al refrescar el usuario',
          'Intente nuevamente...');
      }
    } catch(e){
      console.log(e)
      this.sweetAlertService.swalErrorLogin(
        '¡Lo sentimos!',
        'Ha ocurrido un error al refrescar el usuario',
        'Intente nuevamente...');
    }
  }

  autenticar(resp:any) {
    const usuario = resp.data[0];
    this.localSecureService.setValue('jsonPermisos', JSON.parse(usuario.jsonPermisos));
    this.localSecureService.setValue('jsonOficinas', JSON.parse(usuario.jsonOficinas));
    //Set los permisos de administracion / acceso
    const permisos = JSON.parse(usuario.jsonPermisos);
    const permisosArray = [];
    for (const key in permisos) {
      if (Object.prototype.hasOwnProperty.call(permisos, key)) {
        const permiso = permisos[key];
        if(key != "IdUsr"){
          if(permiso === true){
            permisosArray.push(key)
          }
        }
      }
    }
    //Set los ids de las oficinas en el array
    const permisosOficinas = JSON.parse(usuario.jsonOficinas);
    const permisosOficinasArray = [];
    for (const key in permisosOficinas) {
      if (Object.prototype.hasOwnProperty.call(permisosOficinas, key)) {
        const oficina = permisosOficinas[key];
        permisosOficinasArray.push(oficina.IdOfi)
      }
    }
    this.localSecureService.setValue('permisosOficinas', permisosOficinasArray);
    this.localSecureService.setValue('permisosAdministracion', permisosArray);
    this.localSecureService.setValue('usuario', usuario);
    location.reload()
  }

  logout(){
    this.authService.logout();
  }
}
