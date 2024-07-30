import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Subscription, interval, lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
//configuracion
import { Settings } from '../config/settings';
//services
import { SweetAlertService } from './sweetalert.service';
import { StorageService } from './storage.service';
import { GlobalResponse } from '../interfaces/global.interface';

@Injectable({
  providedIn: 'root',
})
export class InternetService {

    private subscription!: Subscription;
    private intervalTime: number = 5000; // Tiempo en milisegundos entre cada consulta

    headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        ApiKey: Settings.api_auxiliar.apiKey,
    }); 

    constructor(
        private router: Router,
        private httpClient: HttpClient,
        private cache: StorageService,
        private sweetAlertService: SweetAlertService
    ) {}

    startCheckingConnection(): void {        
        this.subscription = interval(this.intervalTime).subscribe(async () => {
            //limpiar consola
            console.clear();

            //ejecutar servicio
            const response: boolean = await this.checkApi(false);
            //la conexión a internet volvio
            if(response) {
                this.stopCheckingConnection();
                this.sweetAlertService.swalClose();
                this.logout();
            }
        });
    }

    stopCheckingConnection(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    async checkApi(opensweet: boolean): Promise<boolean> { 
        try {
            const url = Settings.api_auxiliar.url;
            const response: GlobalResponse = await lastValueFrom(this.httpClient.get<GlobalResponse>(url, { headers: this.headers }));
            //si llega bien al servicio entonces no se hace nada
            if(response.status) { return true; }

            if(opensweet) {
                //debo iniciar timer para validar la conexión a internet
                this.startCheckingConnection();
                //muestra sweetalert
                this.sweetAlertService.swalInternet();
            }
            return false;  
        } catch(error) {
            if(opensweet) {
                //debo iniciar timer para validar la conexión a internet
                this.startCheckingConnection();
                //muestra sweetalert
                this.sweetAlertService.swalInternet();
            }
            return false;  
        }
    }

    logout(): void {
        const id = this.cache.getValue('id') ?? '';
        const emitter: number = this.cache.getValue('multi-emitter') ?? 1;
        const param = id + "_" + emitter;
        this.router.navigate(['/', param]).then(() => {
          window.location.reload();
        });
    }
}
