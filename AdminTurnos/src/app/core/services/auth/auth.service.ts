import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom, Subscription } from 'rxjs';
import { API_ENDPOINT } from './../../config/config';
import { LocalService } from './../storage/local.service';
import { Injectable } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { Router } from '@angular/router';
import { USER_IDLE_CONFIG } from '../../constants/config';
import { ConfigService } from './../config/config.service';
import { AesService } from './../utils/aes.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private subscriptions: Subscription[] = [];
  constructor(
    private localSecureService: LocalService,
    private httpClient: HttpClient,
    private userIdle: UserIdleService,
    private router: Router,
    private configService: ConfigService,
    private aesService: AesService
  ) { }

  isValid(): boolean {
    if (this.localSecureService.getValue('validated')) {
      return true;
    } else {
      return false;
    }
  }

  async login(slug: string, data:any) {
    const url = `${API_ENDPOINT.apiAdmin2}/Usuario/LoginUsuario?Slug=${slug}`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'ApiKey': 'Q3VzdG9tZXJzVFRQ',
      'Content-Type': 'application/json'
    });
    try {
      return await lastValueFrom(
        this.httpClient.post(url, data, { headers: headers })
      );
    } catch (error: any) {
      return { status: error.status, code: error.code, message: error.message };
    }
  }

  async loginCl(data:any) {
    const config = await this.configService.getConfig();
    const url = `${config.endpoint_cl}/Login/LoginAdmin`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'ApiKey': 'c58aaa5a-a026-4fe8-8ef3-1bcec32e2bd9',
      'Content-Type': 'application/json'
    });
    try {
      return await lastValueFrom(this.httpClient.post(url, {data: this.aesService.aesEncrypt(JSON.stringify(data))}, { headers: headers }));
    } catch (error: any) {
      return { status: error.status, code: error.code, message: error.message };
    }
  }

  isAuthenticated(): boolean {
    if (this.localSecureService.getValue('login')) {
      return true;
    } else {
      return false;
    }
  }

  async logout() {
    this.localSecureService.removeItem('login');
    this.localSecureService.removeItem('usuario');
    this.localSecureService.removeItem('username');
    this.localSecureService.removeItem('userpass');
    this.localSecureService.removeItem('jsonPermisos');
    this.localSecureService.removeItem('jsonOficinas');
    this.localSecureService.removeItem('permisosOficinas');
    this.localSecureService.removeItem('permisosAdministracion');
    window.location.replace(
      window.location.origin + '/login'
    );
  }


  idleUser(): void {
    this.userIdle.resetTimer();
    this.userIdle.stopTimer();
    this.userIdle.stopWatching();
    this.userIdle.setConfigValues(USER_IDLE_CONFIG);
    this.userIdle.startWatching();

    this.subscriptions.push(
      this.userIdle.onTimerStart().subscribe(() => {
        const eventList = [
          'click',
          'mouseover',
          'keydown',
          'DOMMouseScroll',
          'mousewheel',
          'mousedown',
          'touchstart',
          'touchmove',
          'scroll',
          'keyup',
        ];
        eventList.forEach((event) => {
          document.body.addEventListener(event, () =>
            this.userIdle.resetTimer()
          );
        });
      })
    );

    this.subscriptions.push(
      this.userIdle.onTimeout().subscribe(async () => {
        if (this.router.url !== '/') {
          this.userIdle.resetTimer();
          this.userIdle.stopTimer();
          this.userIdle.stopWatching();
          this.subscriptions.forEach((subscription) =>
            subscription.unsubscribe()
          );
          this.logout();
        } else {
          this.logout();
        }
      })
    );
  }

}
