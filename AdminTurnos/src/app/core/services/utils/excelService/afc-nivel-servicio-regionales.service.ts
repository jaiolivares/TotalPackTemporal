import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class AFCNivelServicioRegionalesService {
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
      fs.saveAs(blob, 'Reporte Nivel de Servicio Regional.xlsx');
    });
  }

  // creacion de hoja
  private async createtable(dataExcel: any) {
    const datos = this.getCamposFiltrados();
    //creación de hoja
    const sheet = this._workbook.addWorksheet('Reporte');
    //establecer el ancho de columna
    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 30;
    sheet.getColumn(3).width = 45;
    sheet.getColumn(4).width = 45;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 15;
    sheet.getColumn(7).width = 60;
    sheet.getColumn(8).width = 30;
    sheet.getColumn(9).width = 15;
    sheet.getColumn(10).width = 25;
    sheet.getRow(5).height = 50;

    // Alinear texto de las columnas
    sheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
    );

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

    sheet.mergeCells('A8:B8');
    const resultadoCell1 = sheet.getCell('A8');
    resultadoCell1.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    // agregamos estilo al titulo
    resultadoCell1.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    resultadoCell1.value = 'Resultado';


    //campos filtrados
    sheet.mergeCells('A4:B4');
    const filtroCell1 = sheet.getCell('A4');
    filtroCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell1.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell3 = sheet.getCell('C4');
    filtroCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell3.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
   
    const filtroCell4 = sheet.getCell('D4');
    filtroCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell4.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    filtroCell1.value = 'Oficina';
    // filtroCell2.value = 'Serie';
    filtroCell3.value = 'Fecha Inicio';
    filtroCell4.value = 'Fecha Fin';

    ['B4', 'C4', 'D4'].forEach(key => {
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
   

    //datos de los campos filtrados

    sheet.mergeCells('A5:B5');
    const datoFiltroCell1 = sheet.getCell('A5');
    datoFiltroCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell1.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell1.border = { 
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    datoFiltroCell1.value = datos.listIdOficina;

    const datoFiltroCell3 = sheet.getCell('C5');
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
    datoFiltroCell3.value = datos.fechaInicio;

    const datoFiltroCell4 = sheet.getCell('D5');
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
    datoFiltroCell4.value = datos.fechaFin;
    
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
    titleCell.value = 'Reporte Nivel de Servicio Regional';

    // agregar subtitulo
    const subtitleCell1 = sheet.getCell('A9');
    subtitleCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell1.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    // sheet.mergeCells('B9:D9');
    const subtitleCell2 = sheet.getCell('B9');
    subtitleCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell2.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    // sheet.mergeCells('E9:F9');
    const subtitleCell3 = sheet.getCell('C9');
    subtitleCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell3.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
 
    
    const subtitleCell4 = sheet.getCell('D9');
    subtitleCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell4.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    
    

    // Nombre de los subtitulos
    subtitleCell1.value = 'N°';
    subtitleCell2.value = 'Oficinas';
    subtitleCell3.value = `SLA ${datoFiltroCell3.value} a ${datoFiltroCell4.value}`;
    subtitleCell4.value = 'Números (Emitidos Tótem y Especiales)';


    //agregar colores solo a las cabeceras
    ['A9','B9', 'C9', 'D9'].forEach(key => {
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
    let cont = 10;
    dataExcel.forEach((element: any) => {
      const row = sheet.getRow(cont);
      row.values = [
        element.idX,
        element.oficina,
        element.nSer,
        element.qEmi,
      ];
      row.font = {
        name: 'Arial',
        size: 10,
        bold: false
      };
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber > 0) { // Aplicar estilo solo a partir de la columna B
          cell.border = { 
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (element.oficina === 'TOTAL AFC') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'B0E0E6' }, // Color azul claro
              bgColor: { argb: 'B0E0E6' }
            };
          }
          // if (element.oficina === 'Otras Sucursales') {
          //   cell.fill = {
          //     type: 'pattern',
          //     pattern: 'solid',
          //     fgColor: { argb: 'B0E0E6' }, // Color azul claro
          //     bgColor: { argb: 'B0E0E6' }
          //   };
          // }
        }
      });
      cont++;
    });
    
  }
}
