import { LocalService } from './../services/storage/local.service';
import { AuthService } from './../services/auth/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private localSecureService: LocalService
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      const customer = this.localSecureService.getValue('customer');
       this.router.navigate(['login']);
       //localStorage.clear();
       return false;
     }
    return true;
  }

}
