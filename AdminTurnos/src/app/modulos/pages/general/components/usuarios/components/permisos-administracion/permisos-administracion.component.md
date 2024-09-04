 Pasos para agregar un nuevo módulo derivado de un módulo (Caso prefijo rep) para permisos de acceso
 #1 Agregar a this.permisosGlobales el permiso en cuestión siguiendo esta nomemclatura
 {
   modulo: 'Nombre de módulo',
   prefix: 'prefijo de módulo',
   permisos: this.permisos,   //Estos permisos son los base por así decirlo.
 },
 #2 En el HTML en el área de permisos, agregar el siguiente código:
 <ng-container *ngIf="row.prefix === 'rep' && row['modulo'] == 'Módulo Medicos'">
   <td><input type="checkbox" [checked]="row.permisos[row.prefix+'_del']" (change)="row.permisos[row.prefix+'_del']=!row.permisos[row.prefix+'_del']"></td>
  </ng-container>
 Adaptarlo al módulo en cuestión, usando el nombre del módulo y comprobando el prefijo. También agregar el permiso del módulo derivado (En el ejemplo es rep_del)
 #3 En usuarios.component.ts en el método saveUsuario agregar en el switch que alimenta a permisosEditarUsuario
 case 'Módulo Medicos':
 permisosEditarUsuario = { ...permisosEditarUsuario, rep_del:item.permisos.rep_del};
 break; 
 En este caso, se colocan los permisos previos a ese punto (el ...permisosEditarUsuario) y se coloca el permiso correspondiente a ese módulo derivado, en este caso rep_del, de esta forma se edita el permiso en cuestión.


 Módulos derivados usados actualmente:
 Para el permiso rep:
 rep_add = Módulo de reportería
 rep_edit = Derivación de turnos (Reportería)
 rep_del = Módulo de médicos

 Para el permiso bat:
 bat_add = Históricos (Reportería) 
 bat_edit = Módulo Config. General
 bat_del = Módulo Config. Oficinas