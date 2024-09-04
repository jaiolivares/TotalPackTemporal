import { LocalService } from './../../core/services/storage/local.service';
import { SweetAlertService } from './../../core/services/utils/sweet-alert.service';
import { CustomerService } from './../../core/services/http/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(

    private localSecureService: LocalService
  ) { }

  ngOnInit(): void {
    this.localSecureService.removeItem('validated');
    this.localSecureService.removeItem('login');
  }



}
