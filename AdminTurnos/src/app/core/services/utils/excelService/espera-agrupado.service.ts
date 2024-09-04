import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';


@Injectable({
  providedIn: 'root'
})
export class EsperaAgrupadoService {
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
      fs.saveAs(blob, 'Reporte Espera Agrupado.xlsx');
    });
  }

  // creacion de hoja
  private async createtable(dataExcel: any) {
    const datos = this.getCamposFiltrados();
    //creación de hoja y nombre de la hoja
    const sheet = this._workbook.addWorksheet('Reporte');
    //establecer el ancho de columna
    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 15;
    sheet.getColumn(4).width = 15;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 15;
    sheet.getColumn(7).width = 15;
    sheet.getColumn(8).width = 15;
    sheet.getColumn(9).width = 15;
    sheet.getColumn(10).width = 20;
    sheet.getColumn(11).width = 15;
    sheet.getColumn(12).width = 20;
    sheet.getColumn(13).width = 20;
    sheet.getRow(5).height = 50;
    // Alinear texto de las columnas
    sheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
    );
    sheet.mergeCells('A3:B3');
    const campoEntradaCell1 = sheet.getCell('A3');
    campoEntradaCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    campoEntradaCell1.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    campoEntradaCell1.value = 'Datos de Entrada';

    sheet.mergeCells('A6:B6');
    const resultadoCell1 = sheet.getCell('A6');
    resultadoCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
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
    sheet.mergeCells('C4:D4');
    const filtroCell2 = sheet.getCell('C4');
    filtroCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell2.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    const filtroCell3 = sheet.getCell('E4');
    filtroCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell3.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
   
    const filtroCell4 = sheet.getCell('F4');
    filtroCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell4.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell5 = sheet.getCell('G4');
    filtroCell5.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell5.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell6 = sheet.getCell('H4');
    filtroCell6.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell6.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };

    const filtroCell7 = sheet.getCell('I4');
    filtroCell7.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    filtroCell7.font = {
      name: 'Arial Black',
      size: 11,
      bold: true
    };
    const filtroCell8 = sheet.getCell('J4');
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

    ['A4','B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4'].forEach(key => {
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
    datoFiltroCell1.value = datos.listIdOficina;

    sheet.mergeCells('C5:D5');
    const datoFiltroCell2 = sheet.getCell('C5');
    datoFiltroCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell2.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell2.value = datos.listIdSerie;

    const datoFiltroCell3 = sheet.getCell('E5');
    datoFiltroCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell3.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell3.value = datos.fechaInicio;

    const datoFiltroCell4 = sheet.getCell('F5');
    datoFiltroCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell4.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell4.value = datos.fechaFin;

    const datoFiltroCell5 = sheet.getCell('G5');
    datoFiltroCell5.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell5.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell5.value = datos.horaInicio;

    const datoFiltroCell6 = sheet.getCell('H5');
    datoFiltroCell6.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell6.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell6.value = datos.horaFin;

    const datoFiltroCell7 = sheet.getCell('I5');
    datoFiltroCell7.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell7.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell7.value = datos.intervalo;

    const datoFiltroCell8 = sheet.getCell('J5');
    datoFiltroCell8.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    datoFiltroCell8.font = {
      name: 'Arial',
      size: 10,
      bold: true
    };
    datoFiltroCell8.value = datos.limite;
    ['A5','B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5'].forEach(key => {
      const cell = sheet.getCell(key);
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
    titleCell.value = 'Reporte de Espera (Agrupado)';

    // agregar subtitulo
    const subtitleCell1 = sheet.getCell('A7');
    subtitleCell1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell1.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    sheet.mergeCells('B7:E7');
    const subtitleCell2 = sheet.getCell('B7');
    subtitleCell2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell2.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    sheet.mergeCells('F7:G7');
    const subtitleCell3 = sheet.getCell('F7');
    subtitleCell3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell3.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    sheet.mergeCells('H7:I7');
    const subtitleCell4 = sheet.getCell('H7');
    subtitleCell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell4.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    const subtitleCell5 = sheet.getCell('J7');
    subtitleCell5.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // agregamos estilo al titulo
    subtitleCell5.font = {
      name: 'Arial Black',
      size: 14,
      bold: true
    };
    // const subtitleCell6 = sheet.getCell('M4');
    // subtitleCell6.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // // agregamos estilo al titulo
    // subtitleCell6.font = {
    //   name: 'Arial Black',
    //   size: 14,
    //   bold: true
    // };

    // Nombre de los subtitulos
    subtitleCell1.value = 'Rango Espera';
    subtitleCell2.value = 'Clientes Atendidos';
    subtitleCell3.value = 'Clientes Perdidos';
    subtitleCell4.value = 'Total';
    subtitleCell5.value = 'Tiempo Espera Acumulado';
    // subtitleCell6.value = 'Delta tiempo espera acumulado';


    // titulos de las columnas
    const cabeceras = sheet.getRow(8);
    // insertar los titulos
    cabeceras.values = [ 'Minutos', 'Normal', 'Especial', 'Total', '%', '#', '%', 'Rango', 'Acumulado', ''];
    cabeceras.font = {
      name: 'Arial',
      size: 12,
      bold: true
    };

    //agregar colores solo a las cabeceras
    ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7', 'J7'].forEach(key => {
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
    ['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8', 'J8'].forEach(key => {
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
    dataExcel.forEach((element: any) => {
      if (element.rngtxt === 'SERIE') {
        //si la serie es igual a serie se agrega el estilo
        sheet.mergeCells(`A${cont}:J${cont}`);
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
        element.qPer,
        element.pPer,
        element.pRan,
        element.pAcu,
        element.tEspA,
        // element.tEspDA,
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
