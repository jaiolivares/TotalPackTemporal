import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//interfaces
import { CustomerData } from 'src/app/core/interfaces/customer.interface';
import { EmitterData } from 'src/app/core/interfaces/emitter.interface';
import { GlobalResponse2 } from 'src/app/core/interfaces/global.interface';
import { OfficeCodeResponse } from 'src/app/core/interfaces/office.interface';
//services
import { CustomerService } from 'src/app/core/services/http/customer.service';
import { EmitterService } from 'src/app/core/services/http/emitter.service';
import { InternetService } from 'src/app/core/utils/internet.service';
import { StorageService } from 'src/app/core/utils/storage.service';
import { SweetAlertService } from 'src/app/core/utils/sweetalert.service';

@Component({
  selector: 'app-emitter',
  templateUrl: './emitter.component.html',
  styleUrls: ['./emitter.component.css']
})
export class EmitterComponent implements OnInit  {

  //variables en cache
  emitter!: EmitterData;
  customer!: CustomerData;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private cache: StorageService,
    private customerService: CustomerService,
    private emitterService: EmitterService,
    private internetService: InternetService,
    private router: Router,
    private sweetAlertService: SweetAlertService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      this.sweetAlertService.swalLoading();
      const idEmitter: string | null = this.activatedRoute.snapshot.paramMap.get("id");
      //no hay ningun id enviado
      if(!idEmitter) { return }

      //validar conexión a internet
      const online: boolean = await this.internetService.checkApi(true);
      if(!online) { return }

      //validar si es un emisor multiple
      const splitter: string[] = idEmitter?.split('_') ?? [];

      //buscar datos del emisor
      const emitter: EmitterData[] = await this.emitterService.validateEmitter(splitter[0]);
      if(emitter.length == 0) { 
        this.sweetAlertService.swalError("No se ha podido validar el emisor ingresado");
        return; 
      }
  
      this.emitter = emitter[0];
      
      //buscar detalle del customer al que pertenece el emisor
      const customer: CustomerData[] = await this.customerService.getCustomer(this.emitter.idCustomer);
      if(customer.length == 0) { 
        //mostrara un mensaje de error
        this.sweetAlertService.swalError("No se ha podido obtener la información de customer");
        return; 
      }
  
      this.customer = customer[0];
  
      //obtener el codigo de oficina para servicio de campaña (NO OK)
      const result: GlobalResponse2<OfficeCodeResponse[]> = await this.customerService.getOfficeCode(this.customer.slug, this.emitter.idOficina);
      if (result.status && result.data.length > 0) {
        this.cache.setValue('codOficina', result.data[0].codOficina);
      }

      //GUARDAR LAS VARIABLES EN CACHE
      this.cache.setValue('emitter', this.emitter);
      this.cache.setValue('customer', this.customer);
      this.cache.setValue('id', splitter[0]);
      this.cache.setValue('multi-emitter', splitter.length <= 1 ? 1 : parseInt(splitter[1]));

      //actualizar estilos
      this.customerService.setStyles(); 
      
      //redireccionar
      this.sweetAlertService.swalClose();
      this.router.navigate(['/home']);
      
    } catch (error) {
      this.sweetAlertService.swalError(`¡Ha ocurrido un error! No se ha podido cargar el customer.`);
    }
  }
}
