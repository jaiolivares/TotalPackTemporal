import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//interfaces
import { Images } from './core/interfaces/images.interface';
//services
import { CustomerService } from 'src/app/core/services/http/customer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'emisor-tradicional';
  images: Images = this.customerService.images.value;

  constructor(
    public router: Router,
    private customerService: CustomerService
  ) { 
    this.customerService.images.subscribe((res: Images) => this.images = res);
  }

  ngOnInit(): void {
    this.customerService.setStyles(); 
  }
}
