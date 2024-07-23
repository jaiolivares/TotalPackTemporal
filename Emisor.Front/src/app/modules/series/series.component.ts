import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
//interfaces
import { ButtonData } from 'src/app/core/interfaces/emitter.interface';
import { CustomerData } from 'src/app/core/interfaces/customer.interface';
//services
import { EmitService } from 'src/app/core/utils/emit.service';
import { InternetService } from 'src/app/core/utils/internet.service';
import { StorageService } from 'src/app/core/utils/storage.service';

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit, OnDestroy {

  //variables de sesión
  customer!: CustomerData;
  seriesMData!: ButtonData[];
  seriesData!: ButtonData[];
  //
  subSeriesData!: ButtonData[];
  selectedSerie!: ButtonData;
  selectedSubserie!: ButtonData;
  showSubSeries: boolean = false;
  seriesCargadas: boolean = false;
  isButtonDisabled: boolean = false;
  //emitido de eventos
  subscription: Subscription = new Subscription();

  constructor(
    private cache: StorageService,
    private emitService: EmitService,
    private internetService: InternetService,
    private router: Router
  ) {
    this.customer = this.cache.getValue('customer') as CustomerData;
    this.seriesMData = this.cache.getValue('seriesM') as ButtonData[];
    this.seriesData = this.cache.getValue('series') as ButtonData[];
    this.seriesCargadas = true;
  }

  ngOnInit(): void {
   //evalua el paso de la serie
   this.subscription = this.emitService.setToSerie.subscribe((setToSerie: boolean) => {
    this.regresarASeries();
  });
  }
  
  regresarASeries() {
    this.showSubSeries = false;
    this.emitService.setSubSerie(false);
  }
 
  async selectSubserie(serie: ButtonData): Promise<void> {
    //deshabilitar botones
    this.isButtonDisabled = true;

    //validar la conexión a internet antes de ir a buscar cualquier cosa
    const response: boolean = await this.internetService.checkApi(true);
    if(!response) { return; }

    this.selectedSubserie = serie;
    this.cache.setValue('serie-selected', this.selectedSerie);
    this.cache.setValue('subserie-selected', this.selectedSubserie);
    this.router.navigate(['/ticket']);
    this.isButtonDisabled = false;
  }

  async selectSerie(serie: ButtonData): Promise<void> {
    this.isButtonDisabled = true; //deshabilita todos los botones para no ser seleccionados 2 veces
    this.selectedSerie = serie;
    //la serie madre seleccionada no posee subseries
    if(this.selectedSerie.tieneSS == 0) {
      //validar conexión a internet
      const online: boolean = await this.internetService.checkApi(true);
      if(!online) { return }

      this.emitService.setSubSerie(false); //variable para ver hacia que parte redireccionar si finaliza por inactividad
      this.cache.setValue('serie-selected', this.selectedSerie); //guarda localmente la variable en la sesión
      this.cache.removeItem('subserie-selected') //se elimina esta variable por si poseia un valor anterior
      this.router.navigate(['/ticket']);
      return;
    }
      

    //si llega aqui es porque la serie seleccionada posee subseries
    this.emitService.setSubSerie(true);
    this.subSeriesData = this.seriesData.filter((serie: ButtonData) => (serie.idSerieM == this.selectedSerie.idSerie));
    this.showSubSeries = true;
    this.isButtonDisabled = false;
  }

  regresar(): void {
    this.router.navigate(['/dni']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.emitService.setSubSerie(false);
  }
}
