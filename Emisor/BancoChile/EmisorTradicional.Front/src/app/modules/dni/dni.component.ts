import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//configuracion
import { Config } from 'src/app/core/config/config';
//interfaces
import { ButtonData, EmitterData } from 'src/app/core/interfaces/emitter.interface';
import { CustomerData } from 'src/app/core/interfaces/customer.interface';
import { GlobalResponse2 } from 'src/app/core/interfaces/global.interface';
//services
import { DniService } from 'src/app/core/utils/dni.service';
import { EmitterService } from 'src/app/core/services/http/emitter.service';
import { InternetService } from 'src/app/core/utils/internet.service';
import { StorageService } from 'src/app/core/utils/storage.service';
import { SweetAlertService } from 'src/app/core/utils/sweetalert.service';

@Component({
  selector: 'app-dni',
  templateUrl: './dni.component.html',
  styleUrls: ['./dni.component.css']
})
export class DniComponent implements OnInit {

  //variables en cache
  emitter!: EmitterData;
  customer!: CustomerData;
  //formulario
  rut: FormControl = new FormControl('');
  isSubmitted: boolean = false;

  constructor(
    private cache: StorageService,
    private dniService: DniService,
    private emitterService: EmitterService,
    private internetService: InternetService,
    private router: Router,
    private sweetAlertService: SweetAlertService
  ) {
    this.customer = this.cache.getValue('customer') as CustomerData;
    this.emitter = this.cache.getValue('emitter') as EmitterData;
  }

  async ngOnInit(): Promise<void> {
    //actualizar validaciones al input
    this.rut.setValidators([Validators.required, this.dniService.validarRut(Config.validDni)])
    this.rut.updateValueAndValidity();
  }

  keypress(key: any) {
    if (this.rut.value.length < 12) {
      this.rut.setValue(this.dniService.formaterRut(this.rut.value + key));
    }
  }

  deleteKey() {
    let dni = this.rut.value.substr(0, this.rut.value.length - 1);
    this.rut.setValue(this.dniService.formaterRut(dni));
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;

    //valida que el rut sea valido
    if(this.rut.invalid) { return; }

    try {
      this.sweetAlertService.swalLoading();
      //validar conexión a internet
      const online: boolean = await this.internetService.checkApi(true);
      if(!online) { return }

      //ejecutar servicio para obtener series
      const idEmitter: number = this.cache.getValue('multi-emitter') ?? 1;
      const response: GlobalResponse2<ButtonData[]> = await this.emitterService.getButtons(this.customer.slug, this.emitter.idOficina, idEmitter);
      this.sweetAlertService.swalClose();
      if(!response.status) {
        this.sweetAlertService.swalError('¡No se han podido cargar las series! Por favor comunícate con un administrador.');
        return;
      }

      //extraer series que "tienen" subseries pero no poseen ninguna asignada      
      let series: ButtonData[] = response.data.filter((serie: ButtonData) => {
        // Si tieneSS es 0, incluir la serie
        if (serie.tieneSS === 0) {
          return true;
        } else if (serie.tieneSS === 1) {
          return response.data.some((subserie: ButtonData) => subserie.idSerieM === serie.idSerie);
        } else {
          return false;
        }
      });

      //valida que las series no posean una serie madre
      const seriesM: ButtonData[] = series.filter((series: ButtonData) => { return series.idSerieM == 0; });

      //guardar rut y series en cache
      this.cache.setValue('client', this.rut.value);
      this.cache.setValue('series', series);
      this.cache.setValue('seriesM', seriesM);

      //redireccionar a la siguiente vista
      this.router.navigate(['/series']);
    } catch(error) {
      this.sweetAlertService.swalClose();
      this.sweetAlertService.swalError('¡No se han podido cargar las series! Por favor comunícate con un administrador.');
    }
  }

  logout() { this.router.navigate(['/home'])}
}
