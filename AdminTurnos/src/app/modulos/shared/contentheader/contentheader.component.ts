import { Component, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-contentheader',
  templateUrl: './contentheader.component.html',
  styleUrls: ['./contentheader.component.css']
})
export class ContentheaderComponent implements OnInit {

  menu?:string;
  breadcrumb?:string;
  data:boolean =true;
  ruta?:string;
  oficina = false;

  constructor(private router:Router) {
    this.getDataRouter().subscribe( data => {
      this.breadcrumb = data.data['breadcrumb'];
      //this.menu = data.parent!.parent!.url![0].path;
      this.ruta = data.parent!.url[0].path;
      //console.log(this.ruta);
      if (this.ruta == 'inicio' || this.ruta == 'general' || this.ruta == 'oficinas' || this.ruta == 'pacientes' || this.ruta == 'agenda' || this.ruta == 'reportes') {
        this.oficina = false;
      } else{
        this.oficina = true;
      }
      //this.menu = data.parent!.routeConfig!.path;
    })
   }

  ngOnInit(): void {
  }

  getDataRouter(){
   return this.router.events.pipe(
      filter((evento:any) => evento instanceof ActivationEnd),
      filter((evento:ActivationEnd) => evento.snapshot.firstChild === null),
      map(( evento: ActivationEnd ) => evento.snapshot),
    )
  }



}
