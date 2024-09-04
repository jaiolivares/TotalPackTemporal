import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-day-card-simple",
  templateUrl: "./day-card-simple.component.html",
  styleUrls: ["./day-card-simple.component.css"],
})
export class DayCardSimpleComponent implements OnInit {
  @Input() data: any;
  @Input() hideDeleteBtn: any = false;
  @Output() onDelete: EventEmitter<any> = new EventEmitter();
  constructor() {}
  async ngOnInit() {}

  deleteDay(value: any) {
    this.onDelete.emit(value);
  }
}
