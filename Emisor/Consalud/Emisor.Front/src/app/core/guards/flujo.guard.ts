import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { DataService } from 'src/app/core/utils/data.service';

export const flujoGuard: CanActivateFn = (route, state) => {
  const dataService = inject(DataService);
  const authService = inject(AuthService);

  const data = dataService.getData();

  if (!data.Rut || data.Rut === '') {
    // Redirige a una ruta específica si no se cumple la condición
    authService.logout();
    return false;
  }

  return true;
};
