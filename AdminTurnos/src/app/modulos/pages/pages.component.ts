import { Component, OnInit } from '@angular/core';
import { CustomerService } from 'src/app/core/services/http/customer.service';
import { TimerService } from 'src/app/core/services/misc/refresh-timer.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],

})
export class PagesComponent implements OnInit {

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.customerService.setColores();
  }

}
