import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'buscador'
})
export class BuscadorPipe implements PipeTransform {

  transform(lista: any[], texto: string,keys:any[] = []): any[] {
    if(!texto) return lista;
    return lista.filter(value => {
      let contador = 0;
      keys.forEach((key)=>{
        if(key === 'letra-turno'){
          const turno  = value['letra']+value['turno'];
          if(turno.toString().toUpperCase().includes(texto.toUpperCase())){
            contador++;
          }
        } else {
          if(value[key] && value[key] != null && value[key].toString().toUpperCase().includes(texto.toUpperCase())){
            contador++;
          }
        } 
        
      })
      return contador > 0;
    });
  }

}
