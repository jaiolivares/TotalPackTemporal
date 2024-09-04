export interface IPermisos{
  valor           : number;
  descripcion     : string;
  glosa           : string;
  desplegar       : boolean;
  seleccionado?   : boolean;
  New?            : boolean;
  Update?         : boolean;
  Delete?         : boolean;
  desbloquear?    : boolean;
  mostrar?        : boolean;
}
