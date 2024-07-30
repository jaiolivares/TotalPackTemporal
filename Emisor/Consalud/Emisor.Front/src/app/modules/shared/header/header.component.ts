import { Component } from '@angular/core';
import { Images } from 'src/app/core/interfaces/images.interface';
import { CustomerService } from 'src/app/core/services/http/customer.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  images: Images = this.customerService.images.value;

  constructor(
    private customerService: CustomerService
  ) {
    this.customerService.images.subscribe((res: Images) => this.images = res);
  }
}
