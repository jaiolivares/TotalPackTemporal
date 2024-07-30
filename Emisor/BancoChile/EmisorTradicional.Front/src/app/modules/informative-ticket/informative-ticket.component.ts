import { Component, OnDestroy, OnInit } from '@angular/core';
//interfaces
import { ButtonData } from 'src/app/core/interfaces/emitter.interface';
import { TurnResponse } from 'src/app/core/interfaces/turn.interface';
//services
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { StorageService } from 'src/app/core/utils/storage.service';

@Component({
  selector: 'app-informative-ticket',
  templateUrl: './informative-ticket.component.html',
  styleUrls: ['./informative-ticket.component.css']
})
export class InformativeTicketComponent implements OnInit, OnDestroy {

  //variables en cache
  turn!: TurnResponse;
  selectedSerie!: ButtonData;
  //others
  timeoutVolver:any;

  constructor(
    private authService: AuthService,
    private cache: StorageService
  ) { }

  ngOnInit(): void {
    this.turn = this.cache.getValue('turn');
    this.selectedSerie = this.cache.getValue('serie-selected') as ButtonData;
    this.timeoutVolver = setTimeout(()=>{ this.regresar() },10000)
  }

  regresar(){
    clearTimeout(this.timeoutVolver);
    this.authService.logout();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutVolver);
  }
}
