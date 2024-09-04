import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-permisos-administracion',
  templateUrl: './permisos-administracion.component.html',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '*',
          opacity: '1',
          visibility: 'visible',
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: '0',
          'margin-bottom': '-100px',
          visibility: 'hidden',
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
})
export class PermisosAdministracionComponent {
  public checkedAll = false
  public checkedAllAccesos = false
  private permisos: any = {
    add: false,
    update: false,
    delete: false,
  };
  permisosReporteria = false
  public permisosGlobales = [
    {
      modulo: 'Usuarios',
      prefix: 'usr',
      permisos: this.permisos,
    },
    {
      modulo: 'Ejecutivos',
      prefix: 'eje',
      permisos: this.permisos,
    },
    {
      modulo: 'Zonas',
      prefix: 'zon',
      permisos: this.permisos,
    },
    {
      modulo: 'Series',
      prefix: 'ser',
      permisos: this.permisos,
    },
    {
      modulo: 'Menús',
      prefix: 'mnu',
      permisos: this.permisos,
    },
    {
      modulo: 'Motivos de atencion',
      prefix: 'mot',
      permisos: this.permisos,
    },
    {
      modulo: 'Motivos de pausa',
      prefix: 'pau',
      permisos: this.permisos,
    },
    {
      modulo: 'Oficinas',
      prefix: 'ofi',
      permisos: this.permisos,
    },
    {
      modulo: 'Series por oficina',
      prefix: 'sxo',
      permisos: this.permisos,
    },
    {
      modulo: 'Pantallas',
      prefix: 'pan',
      permisos: this.permisos,
    },
    {
      modulo: 'Escritorios',
      prefix: 'esc',
      permisos: this.permisos,
    },
    {
      modulo: 'Botones',
      prefix: 'bot',
      permisos: this.permisos,
    },
    {
      modulo: 'Módulo Reportería',
      prefix: 'rep',
      permisos: this.permisos,
    },
    {
      modulo: 'Históricos (Reportería)',
      prefix: 'bat',
      permisos: this.permisos,
    },
    {
      modulo: 'Derivación de turnos (Reportería)',
      prefix: 'rep',
      permisos: this.permisos,
    },
    {
      modulo: 'Módulo Config. General',
      prefix: 'bat',
      permisos: this.permisos,
    },
    {
      modulo: 'Módulo Config. Oficinas',
      prefix: 'bat',
      permisos: this.permisos,
    },
   
  ];
  //Se comenta el llamado paciente, esto va arriba
  // {
  //   modulo: 'Módulo Llamado Pacientes',
  //   prefix: 'rep',
  //   permisos: this.permisos,
  // },
  constructor(private cdRef: ChangeDetectorRef) {}

  public asignarPermisos(permisosUser: any) {
    for (let per of this.permisosGlobales) {
      if(per.prefix !== 'sxo'){
        per.permisos = {
          [per.prefix + '_add']: permisosUser[per.prefix + '_add'] ?? false,
          [per.prefix + '_edit']: permisosUser[per.prefix + '_edit'] ?? false,
          [per.prefix + '_del']: permisosUser[per.prefix + '_del'] ?? false,
        };
        if(per.modulo === 'Módulo Reportería'){
          this.permisosReporteria = permisosUser[per.prefix + '_add']
        }
      } else {
        per.permisos = {
          [per.prefix + '_set']: permisosUser[per.prefix + '_set'] ?? false,
        };
      }

    }
    // this.cdRef.detectChanges();
  }
  permisosAdministracion(){
    return this.permisosGlobales.filter((row:any)=>(row.prefix !== 'rep' && row.prefix !== 'bat' && row.prefix  !== 'zon'))
  }
  permisosAcceso(){
    return this.permisosGlobales.filter((row:any)=>(row.prefix === 'rep' || row.prefix === 'bat'))
  }

  handlePermisosReporteria(value:any){
    this.permisosReporteria = value;
    if(!value){
      const permisosBatch = this.permisosGlobales.find((per:any)=>per.modulo == 'Históricos (Reportería)');
      if(permisosBatch){
        permisosBatch.permisos = {...permisosBatch.permisos, bat_add:false}
      }
      const permisosDerivacion = this.permisosGlobales.find((per:any)=>per.modulo == 'Derivación de turnos (Reportería)');
      if(permisosDerivacion){
        permisosDerivacion.permisos = {...permisosDerivacion.permisos, rep_edit:false}
      }
    }
  }

  public selectAll(e: any) {
    this.checkedAll = e.target.checked
    for (let per of this.permisosAdministracion()) {
      if (per.prefix !== 'sxo' && per.prefix !== 'zon') {
        //Solo el permiso de editar para Pantallas, Botones y Oficinas
        if (per.prefix == 'pan' || per.prefix == 'bot' || per.prefix == 'ofi') {
          per.permisos = {
            ...per.permisos,
            [per.prefix + '_edit']: e.target.checked,
          };
        } else {
          //El permiso de agregar y borrar para Series
          if (per.prefix == 'ser') {
            per.permisos = {
              ...per.permisos,
              [per.prefix + '_add']: e.target.checked,
              [per.prefix + '_edit']: e.target.checked,
            };
          } else {
            //El resto de permisos pueden tener todos los permisos
            per.permisos = {
              [per.prefix + '_add']: e.target.checked,
              [per.prefix + '_edit']: e.target.checked,
              [per.prefix + '_del']: e.target.checked,
            };
          }
        }
      } else {
        //En series por oficina solo es modificar pero el valor es difierente
        per.permisos = {
          [per.prefix + '_set']: e.target.checked,
        };
      }
    }
  }
  public selectAllAccesos(e: any) {
    this.checkedAllAccesos = e.target.checked
    for (let per of this.permisosAcceso()) {
      if(per.prefix === 'rep'){
        per.permisos = {
          ...per.permisos,
          [per.prefix + '_add']: e.target.checked,
          [per.prefix + '_edit']: e.target.checked,
        };
      } else if(per.prefix === 'bat') {
        per.permisos = {
          [per.prefix + '_add']: e.target.checked,
          [per.prefix + '_edit']: e.target.checked,
          [per.prefix + '_del']: e.target.checked,
        };
      }
    }
  }
}
