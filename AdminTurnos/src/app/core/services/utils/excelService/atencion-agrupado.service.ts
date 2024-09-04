import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class AtencionAgrupadoService {
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
      fs.saveAs(blob, 'Reporte Atención agrupado.xlsx');
    });
  }

  // creacion de hoja
  private async createtable(dataExcel: any) {
    const datos = this.getCamposFiltrados();
    //creación de hoja
    const sheet = this._workbook.addWorksheet('Reporte');
    //establecer el ancho de columna
    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 15;
    sheet.getColumn(4).width = 15;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 15;
    sheet.getColumn(7).width = 15;
    sheet.getColumn(8).width = 20;
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
    sheet.mergeCells('B4:D4');
    const filtroCell1 = sheet.getCell('B4');
    filtroCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell1.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    sheet.mergeCells('E4:G4');
    const filtroCell2 = sheet.getCell('E4');
    filtroCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell2.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    const filtroCell3 = sheet.getCell('B6');
    filtroCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell3.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
   
    const filtroCell4 = sheet.getCell('C6');
    filtroCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell4.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell5 = sheet.getCell('D6');
    filtroCell5.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell5.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell6 = sheet.getCell('E6');
    filtroCell6.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell6.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell7 = sheet.getCell('F6');
    filtroCell7.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell7.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    const filtroCell8 = sheet.getCell('G6');
    filtroCell8.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell8.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    filtroCell1.value = 'Oficina';
    filtroCell2.value = 'Serie';
    filtroCell3.value = 'Fecha Inicio';
    filtroCell4.value = 'Fecha Fin';
    filtroCell5.value = 'Hora Inicio';
    filtroCell6.value = 'Hora Fin';
    filtroCell7.value = 'Intervalo';
    filtroCell8.value = 'Límite';

    ['B4', 'C4', 'D4', 'E4', 'F4', 'G4'].forEach(key => {
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

    sheet.mergeCells('B5:D5');
    const datoFiltroCell1 = sheet.getCell('B5');
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

    sheet.mergeCells('E5:G5');
    const datoFiltroCell2 = sheet.getCell('E5');
    datoFiltroCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell2.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell2.border = { 
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    datoFiltroCell2.value = datos.listIdSerie;

    const datoFiltroCell3 = sheet.getCell('B7');
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

    const datoFiltroCell4 = sheet.getCell('C7');
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

    const datoFiltroCell5 = sheet.getCell('D7');
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
    datoFiltroCell5.value = datos.horaInicio;

    const datoFiltroCell6 = sheet.getCell('E7');
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
    datoFiltroCell6.value = datos.horaFin;

    const datoFiltroCell7 = sheet.getCell('F7');
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
    datoFiltroCell7.value = datos.intervalo;

    const datoFiltroCell8 = sheet.getCell('G7');
    datoFiltroCell8.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell8.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell8.border = { 
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    datoFiltroCell8.value = datos.limite;

    ['B6', 'C6', 'D6', 'E6', 'F6', 'G6'].forEach(key => {
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
    titleCell.value = 'Reporte de atención (agrupado)';

    // agregar subtitulo
    const subtitleCell1 = sheet.getCell('A9');
    subtitleCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell1.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    sheet.mergeCells('B9:E9');
    const subtitleCell2 = sheet.getCell('E9');
    subtitleCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell2.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    sheet.mergeCells('F9:G9');
    const subtitleCell3 = sheet.getCell('F9');
    subtitleCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell3.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
 
    const subtitleCell4 = sheet.getCell('H9');
    subtitleCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell4.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    
    

    // Nombre de los subtitulos
    subtitleCell1.value = 'Rango Atención';
    subtitleCell2.value = 'Clientes Atendidos';
    subtitleCell3.value = 'Acumulados';
    subtitleCell4.value = 'Atención Acumulado';
  
    


    // titulos de las columnas
    const cabeceras = sheet.getRow(10);
    // insertar los titulos
    cabeceras.values = [ 'Minutos', 'Normal', 'Especial', 'Total', '%', '#', '%', ''];
    cabeceras.font = {
      name: 'Arial',
      size: 12,
      bold: true
    };

    //agregar colores solo a las cabeceras
    ['A9','B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9'].forEach(key => {
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
    ['A10','B10', 'C10', 'D10', 'E10', 'F10', 'G10', 'H10'].forEach(key => {
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
    let cont = 11;
    dataExcel.forEach((element: any) => {
      if (element.rngtxt === 'SERIE') {
        
        sheet.mergeCells(`A${cont}:H${cont}`);
        const cell = sheet.getCell(`A${cont}`);
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
        cell.font = {
          name: 'Arial',
          size: 12,
          bold: true
        };
        cell.value = element.rngtxt;
        cont++;
      }
      
      const row = sheet.getRow(cont);
      row.values = [
        // '',
        element.rngtxt,
        element.qAteNOfi,
        // element.qAteTOL,
        element.qAteE,
        element.qAteT,
        element.pAte,
        element.qTotA,
        element.pAcu,
        element.tAteA,
      ];
      if (element.rngtxt === 'TOT') {
        const totalCell = sheet.getCell(`A${cont}`);
        totalCell.value = 'Total General';
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber > 0) { // Aplicar estilo solo a partir de la columna B
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
            // cell.font = {
            //   color: { argb: 'FFFFFFFF' }, // Texto blanco
            //   bold: true,
            // };
          }
        });
      }
      cont++;
    });
    
  }
}
