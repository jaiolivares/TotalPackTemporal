import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ModalService } from 'src/app/core/services/utils/modal.service';

@Component({
  selector: 'app-modal-codigos',
  templateUrl: './modal-codigos.component.html',
})
export class ModalCodigosComponent implements OnInit {
    @ViewChild('ticketTextArea') ticketTextArea!: ElementRef;
  constructor(
    private modalService: ModalService,
    public formBuilder: FormBuilder,
  ) {}
  data: any;
  selectedCodigo:any;
  form:any;
  public onReplaceTicketTextAreaEmitter: EventEmitter<any> = new EventEmitter();
  async ngOnInit() {
    //console.log(this.data.ticketTextArea);
    this.form = this.formBuilder.group({
        ticket: new FormControl(this.data.ticketTextArea),
      });
  }
  closeModal() {
    this.onReplaceTicketTextAreaEmitter.emit(this.form.get('ticket')?.value);
    this.modalService.closeModal('modal-codigos');
  }
  selectCodigo(value:any){
    const textAreaElement = this.ticketTextArea.nativeElement;
    const selectionStart = textAreaElement.selectionStart;
    const selectionEnd = textAreaElement.selectionEnd;
    const curPos = this.ticketTextArea.nativeElement.selectionStart;
    const currentValue = this.form.get('ticket')?.value;
    this.form.patchValue({
        ticket: currentValue.slice(0, curPos) + value + currentValue.slice(curPos)
    })
    let newSelectionStart;
    let newSelectionEnd;
    if(value == '\r\n'){
         newSelectionStart = selectionStart - 1;
         newSelectionEnd = selectionEnd - 1;
    }
   else {
     newSelectionStart = selectionStart + value.length;
     newSelectionEnd = selectionEnd + value.length;
   }
    textAreaElement.setSelectionRange(newSelectionStart, newSelectionEnd);
    textAreaElement.focus();

  }
}
