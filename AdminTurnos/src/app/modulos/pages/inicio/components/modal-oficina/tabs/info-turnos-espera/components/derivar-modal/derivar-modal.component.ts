import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { DetalleOficinasService } from 'src/app/core/services/http/inicio/detalle-oficinas.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';

@Component({
  selector: 'app-derivar-modal',
  templateUrl: './derivar-modal.component.html',
})
export class DerivarModalComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService,private detalleOficinaService: DetalleOficinasService,private localSecureService: LocalService, private sweetAlertService: SweetAlertService) { }
  ejecutivos:any = [];
  item:any;
  ejecutivoSeleccionado = new FormControl('');
  public event: EventEmitter<any> = new EventEmitter();
  public ocultarModal: EventEmitter<any> = new EventEmitter();
  isSubmitted: boolean = false;
  modalRef?: BsModalRef;
 async ngOnInit(): Promise<void> {
  }
  cerrarModal(){
    this.ocultarModal.emit()
  }


  async onSubmit(){
    this.isSubmitted = true;
    this.spinner.show('form-modal-derivar-loading')
    if(this.ejecutivoSeleccionado.value != ''){
      const customer = this.localSecureService.getValue('customer');
      const resp = await this.detalleOficinaService.derivarTurno(customer.slug,this.item.idTurno,this.ejecutivoSeleccionado.value);
      if(resp && resp['status'] != false){
        this.event.emit(true);
        this.sweetAlertService.swalInfo('Derivar turno','Se ha derivado el turno correctamente.')
      } else {
        this.sweetAlertService.swalError('Derivar turno','Ha ocurrido un error al derivar el turno',resp['message'])
      }
    }
    this.spinner.hide('form-modal-derivar-loading')
  }
}
