import { Component, OnDestroy, OnInit } from '@angular/core';
//interfaces
import { ButtonData } from 'src/app/core/interfaces/emitter.interface';
import { TurnResponse } from 'src/app/core/interfaces/turn.interface';
//services
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { DataService } from 'src/app/core/utils/data.service';

@Component({
  selector: 'app-informative-ticket',
  templateUrl: './informative-ticket.component.html',
  styleUrls: ['./informative-ticket.component.css']
})
export class InformativeTicketComponent implements OnInit, OnDestroy {

  //variables en cache
  turn!: TurnResponse | null;
  selectedSerie!: ButtonData | null;
  //others
  timeoutVolver:any;

  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.turn = this.dataService.getData().Turno;
    this.selectedSerie = this.dataService.getData().SerieSelected;
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
