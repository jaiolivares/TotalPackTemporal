import { SweetAlertService } from './../core/services/utils/sweet-alert.service';
import { CustomerService } from './../core/services/http/customer.service';
import { LocalService } from './../core/services/storage/local.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DEFAULT_INTERVAL_TIME } from '../core/constants/config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  //customer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private sweetAlertService: SweetAlertService,
    private localSecureService: LocalService
  ) { }

  ngOnInit(): void {
    this.localSecureService.removeItem('validated');
    const guId = this.route.snapshot.paramMap.get("id");
    if (guId) {
      this.getCustomer(guId);
      /* console.log('aaa');
      this.router.navigate(['login']); */
    } else{
      this.router.navigate(['index']);
    }
  }

  async getCustomer(id: any) {
    const customer: any = await this.customerService.obtenerCustomer();
    //this.customer = await this.customerService.getCustomer(id);
    if (customer) {
      const existe = customer.data.find((y: any) => y.slug.toLowerCase() == `ttp_${id}`);
      if (existe) {
        this.localSecureService.setValue('validated', true);
        this.localSecureService.setValue('customer', existe);
        if(!this.localSecureService.getValue('timerInterval')){
          this.localSecureService.setValue('timerInterval',DEFAULT_INTERVAL_TIME);
        }
        this.router.navigate(['/login']);
      } else {
        this.sweetAlertService.swalErrorLogin(
          '¡Lo sentimos!',
          'Acceso no permitido',
          'Intente nuevamente...');
          this.router.navigate(['index']);
      }
    } else{
      this.sweetAlertService.swal500();
      this.router.navigate(['index']);
    }
  }

}
