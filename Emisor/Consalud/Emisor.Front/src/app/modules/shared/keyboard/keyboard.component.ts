import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent {
  
  @Output() keypressEmit = new EventEmitter<any>();
  @Output() deleteKeyEmit = new EventEmitter<any>();
  @Input() rut!: boolean;

  constructor() { }

  onKeypress(key: string) { this.keypressEmit.emit(key) }

  onDeleteKey() { this.deleteKeyEmit.emit() }
}
