import { Injectable } from '@angular/core';
import { IPermisos } from 'src/app/core/models/ipermisos.interface';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  getPermiso = false;
  iOpe:any = '';
  aiOfi:any = '';
  listadoPermisos =  new Array<IPermisos>();
  isShownNew = false;
  isShownUpd = false;
  isShownDel = false;
  arrayPermNew:string[]=[];
  arrayPermUpd:string[]=[];
  arrayPermDel:string[]=[];

  constructor() {
    this.listadoPermisos.push({valor:32767,descripcion:"PER_ALL", glosa:"Todos", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: false });
    this.listadoPermisos.push({valor:16384,descripcion:"PER_ENC", glosa:"Encuestas", desplegar:false, New:false, Update:false, Delete:false, desbloquear: false, mostrar: false });
    this.listadoPermisos.push({valor:8192,descripcion:"PER_ALA", glosa:"Alarma", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:4096,descripcion:"PER_ESC", glosa:"Escritorios", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:2048,descripcion:"PER_PAN", glosa:"Pantallas", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:1024,descripcion:"PER_BOT", glosa:"Botones", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:512,descripcion:"PER_EMI", glosa:"Emisores", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:256,descripcion:"PER_SSE", glosa:"Sub Servicios", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:128,descripcion:"PER_SER", glosa:"Servicios", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:64,descripcion:"PER_OPE", glosa:"Operación", desplegar:false, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:32,descripcion:"PER_OFI", glosa:"Oficinas", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:16,descripcion:"PER_PAU", glosa:"Motivos de Pausa", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:8,descripcion:"PER_ATE", glosa:"Motivos de Atención", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:4,descripcion:"PER_EJE", glosa:"Ejecutivos", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:2,descripcion:"PER_USR", glosa:"Usuarios", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
    this.listadoPermisos.push({valor:1,descripcion:"PER_LOG", glosa:"Archivo Log", desplegar:true, New:false, Update:false, Delete:false, desbloquear: false, mostrar: true });
  }

  obtenerPermisos(permisos : number){
    let permisosDisponibles = '';

    for(let index in this.listadoPermisos){
      if(permisos >= this.listadoPermisos[index].valor){
        permisosDisponibles += this.listadoPermisos[index].descripcion;
        permisos -= this.listadoPermisos[index].valor;
        if(permisos > 0){
          permisosDisponibles += "~";
        }
      }
    }
    return permisosDisponibles;
  }
  retornarPermisos(){
    return this.listadoPermisos;
  }

  verificar(coincidencia: string, arrayPermNew:any,arrayPermUpd:any,arrayPermDel:any) {

    arrayPermNew=arrayPermNew.split('~');
    arrayPermUpd=arrayPermUpd.split('~');
    arrayPermDel=arrayPermDel.split('~');

    if(this.arrayPermNew.some(x => x === coincidencia)) {
      this.isShownNew = true;
    }

    else {
      this.isShownNew = false;
    }

    if(this.arrayPermUpd.some(x => x === coincidencia)) {
      this.isShownUpd = true;
    }

    else {
      this.isShownUpd = false;
    }

    if(this.arrayPermDel.some(x => x === coincidencia)) {
      this.isShownDel = true;
    }

    else {
      this.isShownDel = false;
    }

    let permisos = this.isShownNew + '~' + this.isShownUpd + '~' + this.isShownDel;

    return permisos;
  }
}
