import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-motivo-card',
  templateUrl: './motivo-card.component.html',
})
export class MotivoCardComponent implements OnInit {
@Input() data:any;
@Input() hideDeleteBtn:any = false;
@Output() onDelete: EventEmitter<any> = new EventEmitter()
  constructor(
  ) {}
  async ngOnInit() {
  }

  deleteDay(value:any){
    this.onDelete.emit(value)
  }
}
