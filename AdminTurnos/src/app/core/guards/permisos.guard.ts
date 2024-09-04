import { LocalService } from './../services/storage/local.service';
import { AuthService } from './../services/auth/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SweetAlertService } from '../services/utils/sweet-alert.service';

@Injectable({
  providedIn: 'root'
})

export class PermisosGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private localSecureService: LocalService,
    private sweetAlertService: SweetAlertService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
      const permisosAdministracion = this.localSecureService.getValue('permisosAdministracion');

        //Cuando se navega a la ruta de pacientes, si tiene permisos pasa, si no se redirecciona a inicio para poder asignarle una pagina de inicio de acuerdo a los permisos
        if(route.routeConfig?.path === 'pacientes' && permisosAdministracion){
        if (permisosAdministracion.includes('rep_del')
        ) {
          return true
        } else {
          this.router.navigate(['admin/inicio']);
          return false;
        }
      }

      //Cuando se navega a la ruta de general, si tiene permisos pasa, si no se redirecciona a inicio para poder asignarle una pagina de inicio de acuerdo a los permisos
      if(route.routeConfig?.path === 'general' && permisosAdministracion){
        if (permisosAdministracion.includes('bat_edit')
        ) {
          return true
        } else {
          this.router.navigate(['admin/inicio']);
          return false;
        }
      }
      //Es el mismo procedimiento que en general
      if(route.routeConfig?.path === 'oficinas' && permisosAdministracion){
        if(permisosAdministracion.includes('bat_del')){
          return true;

        } else {
          this.router.navigate(['admin/inicio']);
          return false;
        }
      }
      //Si no tiene el permiso de reportería, asigna de acuerdo a los permisos que tenga, la pantalla de inicio, si lo tiene, entra a reporteria como inicio
      if(route.routeConfig?.path === 'inicio' && permisosAdministracion){
        if(permisosAdministracion.includes('rep_add')) {
          return true
        } else if (
          permisosAdministracion.includes('bat_edit')
        ) {
          this.router.navigate(['admin/general']);
          return false;
          
        } else if(permisosAdministracion.includes('bat_del')){
          this.router.navigate(['admin/oficinas']);
            return false;
        }
      }

      if(permisosAdministracion){
        this.sweetAlertService.toastConfirm('error','No se encontraron permisos de acceso')
      } else {
        this.sweetAlertService.toastConfirm('error','Se ha cerrado la sesión por inactividad (En alguna de las pestañas abiertas)')
      }
        this.router.navigate(['login']);
        return false;
  }

  

}
