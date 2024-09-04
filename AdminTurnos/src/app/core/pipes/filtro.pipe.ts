import { Pipe, PipeTransform } from '@angular/core';
import { isEmpty } from 'lodash';
import { GroupBy, OrderBy } from '../models/filtros.model';
@Pipe({
  name: 'filtro',
})
export class FiltroPipe implements PipeTransform {
  transform(list: any[], groupBy: GroupBy, orderBy?: OrderBy): any[] {

    if(groupBy.value == true || groupBy.value == false){
      list = list.filter((value) => value[groupBy.key!] == groupBy.value);
    }
        
    if (!isEmpty(groupBy) && (groupBy.key != "" && groupBy.value != "")) {
      list = list.filter((value) => value[groupBy.key!] == groupBy.value);
    }
    if (!isEmpty(orderBy) && (orderBy.key != "" && orderBy.type != "")) {
      list = list.sort((a: any, b: any) => {
        if(orderBy.key === 'letra-turno'){
          if(orderBy.type == 'D'){
            return a['letra']+a['turno'] > b['letra']+b['turno'] ? -1 : 1;
          } else {
            return a['letra']+a['turno'] < b['letra']+b['turno'] ? -1 : 1;
          }
        }
        if (orderBy.type == 'D') {
          return a[orderBy.key!] > b[orderBy.key!] ? -1 : 1;
        }
        if (orderBy.type == 'A') {
          return a[orderBy.key!] < b[orderBy.key!] ? -1 : 1;
        }
        return 0;
      });
    }
    return list;
  }
}
