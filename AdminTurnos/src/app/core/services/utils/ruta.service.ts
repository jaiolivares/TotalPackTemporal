import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router'
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class RutaService {

  constructor(private router: Router) { }


  rutaActiva():Observable<any>  {
   return this.router.events.pipe(
      map((evento: any) => {
        filter((evento: any) => evento instanceof NavigationStart),
        evento instanceof NavigationStart
        return evento.url;
      })
    );
  }
}
