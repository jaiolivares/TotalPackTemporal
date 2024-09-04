import { Injectable, Output, EventEmitter } from '@angular/core';
import { LocalService } from '../storage/local.service';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  @Output() refreshEmit = new EventEmitter();
  timer:any
  constructor(private localService: LocalService) { }
  emitRefresh(){
    this.refreshEmit.emit()
  }
  initTimer(){
    const intervalConfig = this.localService.getValue('timerInterval') || 60000;
    this.timer = setInterval(()=>{
     this.emitRefresh();
    },intervalConfig)
  }
  stopTimer(){
    clearInterval(this.timer);
  }
}
