import { Injectable, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  public modalRef!: BsModalRef;
  public modalRefs: BsModalRef[] = [];
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
  };

  constructor(
    private modalService: BsModalService
  ) { }

  openModal(component: string | TemplateRef<any> | (new (...args: any[]) => any), options: any,id:any) {
    const config = { ...this.config, ...options,id:id };
    this.modalRefs.push(this.modalService.show(component, config));
  }
  closeModal(modalID?: any) {
    const currentModalRef= this.modalRefs.find((modalRef)=>modalRef.id == modalID);
    const objWithIdIndex = this.modalRefs.findIndex((modalRef) => modalRef.id === modalID);
      if(currentModalRef){
        currentModalRef?.hide();
        this.modalRefs.splice(objWithIdIndex, 1)
      }
  }
  getModalRef(modalID?: any) {
    const currentModalRef= this.modalRefs.find((modalRef)=>modalRef.id == modalID);
      return currentModalRef
  }
}
