import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class RankingEjecutivoService {
  private camposFiltrados: any = {};
  private _workbook!: Workbook
  constructor() { }
  setCamposFiltrados(data: any) {
    this.camposFiltrados = data;
  }

  getCamposFiltrados() {
    return this.camposFiltrados;
  }
  async download(dataExcel: any): Promise<void> {
    // crreacion de libro
    this._workbook = new Workbook();
    //creacion de hoja
    this._workbook.creator = 'TTP';
    // creacion de hoja
    await this.createtable(dataExcel);
    // creación del libro
    this._workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Reporte Ranking Ejecutivos.xlsx');
    });
  }

  // creacion de hoja
  private async createtable(dataExcel: any) {
    const datos = this.getCamposFiltrados();
    console.log(datos);
    //creación de hoja
    const sheet = this._workbook.addWorksheet('Reporte');
    //establecer el ancho de columna
    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 20;
    sheet.getColumn(4).width = 20;
    sheet.getColumn(5).width = 30;
    sheet.getColumn(6).width = 20;
  

    // Alinear texto de las columnas
    sheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
    );
    // agregar el titulo
    sheet.mergeCells('B1:E1');
    const titleCell = sheet.getCell('B1');
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    // agregamos estilo al titulo
    titleCell.font = {
      name: 'Arial Black',
      size: 16,
      bold: true
    };
    // Nombre del titulo
    titleCell.value = 'Reporte ranking ejecutivo';

    sheet.mergeCells('A3:B3');
    const campoEntradaCell1 = sheet.getCell('A3');
    campoEntradaCell1.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    // agregamos estilo al titulo
    campoEntradaCell1.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    campoEntradaCell1.value = 'Datos de Entrada';

    //encabezados de los filtros (datos de entrada)
    const filtroCell3 = sheet.getCell('A4');
    filtroCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell3.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
   
    const filtroCell4 = sheet.getCell('B4');
    filtroCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell4.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell5 = sheet.getCell('C4');
    filtroCell5.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell5.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell6 = sheet.getCell('D4');
    filtroCell6.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell6.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell7 = sheet.getCell('E4');
    filtroCell7.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell7.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };


    filtroCell3.value = 'Oficina';
    filtroCell4.value = 'Fecha Inicio';
    filtroCell5.value = 'Fecha Fin';
    filtroCell6.value = 'Tiempo Medio [seg]';
    filtroCell7.value = 'Jornada';

    ['A4', 'B4', 'C4', 'D4', 'E4'].forEach(key => {
      const cell = sheet.getCell(key);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ADD8E6' },
        bgColor: { argb: 'ADD8E6' }
      };
      cell.border = { 
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
    );

    //valores de los filtros
    const datoFiltroCell3 = sheet.getCell('A5');
    datoFiltroCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell3.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell3.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    datoFiltroCell3.value = datos.idOficina;

    const datoFiltroCell4 = sheet.getCell('B5');
    datoFiltroCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell4.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell4.border = { 
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    datoFiltroCell4.value = datos.fechaInicio;

    const datoFiltroCell5 = sheet.getCell('C5');
    datoFiltroCell5.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell5.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell5.border = { 
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    datoFiltroCell5.value = datos.fechaFin;

    const datoFiltroCell6 = sheet.getCell('D5');
    datoFiltroCell6.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell6.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell6.border = { 
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    datoFiltroCell6.value = datos.tiempoMinimo;

    const datoFiltroCell7 = sheet.getCell('E5');
    datoFiltroCell7.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell7.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell7.border = { 
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    datoFiltroCell7.value = datos.tiempoJornada;

    sheet.mergeCells('A7:B7');
    const resultadoCell1 = sheet.getCell('A7');
    resultadoCell1.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    // agregamos estilo al titulo
    resultadoCell1.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    resultadoCell1.value = 'Resultado';

    // agregar subtitulo
    const subtitleCell1 = sheet.getCell('A8');
    subtitleCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell1.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };

    const subtitleCell2 = sheet.getCell('B8');
    subtitleCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell2.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };

    const subtitleCell3 = sheet.getCell('C8');
    subtitleCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell3.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
 
    const subtitleCell4 = sheet.getCell('D8');
    subtitleCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell4.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    
    const subtitleCell5 = sheet.getCell('E8');
    subtitleCell5.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell5.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };

    // Nombre de los subtitulos
    subtitleCell1.value = 'ranking';
    subtitleCell2.value = 'Ejecutivo';
    subtitleCell3.value = 'Atenciones';
    subtitleCell4.value = 'Tiempo Medio [seg]';
    subtitleCell5.value = '% Activo';

    // //agregar colores solo a las cabeceras
    ['A8', 'B8', 'C8', 'D8', 'E8'].forEach(key => {
      const cell = sheet.getCell(key);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ADD8E6' },
        bgColor: { argb: 'ADD8E6' }
      };
      cell.border = { 
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
    );
   

    //agregar valores a las celdas
    let cont = 9;
    dataExcel.forEach((element: any, index: number) => {
      if (element.ejecutivo === 'TOT') {
        // Modificar 'mk' a 'Totales' y dejar 'ejecutivo' vacío
        element.mk = 'Totales';
        element.ejecutivo = '';
    
        // Llenar las celdas de la fila con los valores actualizados
        const row = sheet.getRow(cont + index);
        row.values = [
          // '',
          element.mk,
          element.ejecutivo,
          element.qAte,
          element.timepoMedio,
          element.poo,
        ];
    
        // Aplicar estilo a todas las celdas de esta fila
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber > 0) { // Aplicar estilo solo a partir de la columna B
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'ADD8E6' }, // Color azul claro
              bgColor: { argb: 'ADD8E6' }
            };
            cell.border = { 
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        });
      } else {
        // Procesar y llenar las celdas de las filas que no son 'TOT'
        const row = sheet.getRow(cont + index);
        row.values = [
          // '',
          element.mk,
          element.ejecutivo,
          element.qAte,
          element.timepoMedio,
          element.poo,
        ];
    
      }
    });
  }
}
