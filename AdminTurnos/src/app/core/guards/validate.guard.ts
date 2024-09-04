import { AuthService } from './../services/auth/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValidateGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isValid()) {
       this.router.navigate(['index']);
       localStorage.clear();
       return false;
     }
    return true;
  }

}
