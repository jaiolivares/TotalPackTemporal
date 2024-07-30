import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//interfaces
import { EmitterData } from 'src/app/core/interfaces/emitter.interface'; 
import { CustomerData } from 'src/app/core/interfaces/customer.interface';
import { GlobalResponse } from 'src/app/core/interfaces/global.interface';
import { Images } from 'src/app/core/interfaces/images.interface';
//services
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CustomerService } from 'src/app/core/services/http/customer.service';
import { InternetService } from 'src/app/core/utils/internet.service';
import { PrinterService } from 'src/app/core/services/http/printer.service';
import { StorageService } from 'src/app/core/utils/storage.service';
import { SweetAlertService } from 'src/app/core/utils/sweetalert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  //variables en cache
  emitter!: EmitterData;
  customer!: CustomerData;
  //otras
  cargandoEstadoImpresora: boolean = false;
  images: Images = this.customerService.images.value;

  constructor(
    private authService: AuthService,
    private cache: StorageService,
    private customerService: CustomerService,
    private internetService: InternetService,
    private printerService: PrinterService,
    private router: Router,
    private sweetAlertService: SweetAlertService
  ) {
    this.emitter = this.cache.getValue('emitter') as EmitterData;
    this.customer = this.cache.getValue('customer') as CustomerData;
    //actualización de imagenes
    this.customerService.images.subscribe((res: Images) => this.images = res);
   }

  ngOnInit(): void { this.authService.stopWatching(); }

  async probarImpresora() {    
    //marca el cargando estado impresora para habilitar pestaña de carga
    this.cargandoEstadoImpresora = true;
    
    //validar conexión a internet
    const online: boolean = await this.internetService.checkApi(true);
    if(!online) { return }


    //ejecutar servicio de impresora
    const response: GlobalResponse = await this.printerService.printerStatus();
    this.cargandoEstadoImpresora = false;

    if(!response.status) {
      this.sweetAlertService.swalNoImprime();
      return;
    }      

    //si la impresora esta operativa, redirecciono a la pestaña de rut
    this.authService.idleUser(); // inicia el timer de inactividad
    this.router.navigate(['/dni']);
  }
}
