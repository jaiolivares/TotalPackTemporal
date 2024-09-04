import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.css'],
})
export class DayCardComponent implements OnInit {
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
