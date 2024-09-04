import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EstadoModalOficinaService } from 'src/app/core/services/pages/modal-oficina.service';

@Component({
  selector: 'app-estado-oficina',
  templateUrl: './estado-oficina.component.html',
  styles:['']
})
export class EstadoOficinaComponent implements OnInit {

  estado:any;
  estadoSubscription:Subscription = new Subscription()

  constructor(
    private estadoService:EstadoModalOficinaService
    ) { }

  ngOnInit(): void {
    this.estadoSubscription = this.estadoService.estado$.subscribe((estado:any)=>{
      this.estado = estado;
    })
  }

}
