import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserIdleService } from 'angular-user-idle';
import { Router } from '@angular/router';
import { StorageService } from './../../utils/storage.service';
import { EmitService } from './../../utils/emit.service';
import { InternetService } from './../../utils/internet.service'

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private subscriptions: Subscription[] = [];
  
  constructor(
    private userIdle: UserIdleService, 
    private router:Router, 
    private cache: StorageService, 
    private emitService: EmitService,
    private internetService: InternetService
  ) {}

  idleUser(): void {
    this.userIdle.startWatching();

    this.subscriptions.push(this.userIdle.onTimerStart().subscribe(() => {
      const eventList = [
        'click', 'mouseover', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'keyup'
      ];
      eventList.forEach(event => {
        document.body.addEventListener(event, () => this.userIdle.resetTimer());
      });
    }));

    this.subscriptions.push(this.userIdle.onTimeout().subscribe(async () => {
      //validar si existe conexión a internet
      const response: boolean = await this.internetService.checkApi(true);
      if(!response) { 
        this.stopIdleUser();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        return 
      }

      //continua con lo que quiera
      if (this.router.url !== '/home' && this.router.url !== '/ticket' && this.router.url !== '/informative-ticket') {
        //si se encuentra en sub serie, se rediva a series y se reinicia el timer
        const subserie: boolean = this.emitService.getSubSerie();
        if(subserie) {
          this.restartWatching();
          this.emitService.setToSeries();
        } else {
          this.stopIdleUser();
          this.subscriptions.forEach(subscription => subscription.unsubscribe());
          this.logout();
        }
      }
    }));
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  restartWatching() {
    this.userIdle.resetTimer();
    this.userIdle.startWatching();
  }

  stopIdleUser(): void {
    this.userIdle.resetTimer();
    this.userIdle.stopTimer();
    this.userIdle.stopWatching();
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
