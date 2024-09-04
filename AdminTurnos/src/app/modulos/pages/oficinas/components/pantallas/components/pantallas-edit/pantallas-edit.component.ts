import { Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { Subscription } from 'rxjs';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { SeriesService } from 'src/app/core/services/http/general/series.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { handleTexts } from 'src/app/core/services/utils/utils';
import { cloneDeep, isEmpty, isUndefined } from 'lodash';
import { PantallasService } from 'src/app/core/services/http/oficina/pantallas.service';

@Component({
  selector: 'app-pantallas-edit',
  templateUrl: './pantallas-edit.component.html',
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: '1',
        'visibility': 'visible'
      })),
      state('closed', style({
        height: '0px',
        opacity: '0',
        'margin-bottom': '-100px',
        'visibility': 'hidden'
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ])
  ]
})
export class PantallasEditComponent implements OnInit, OnDestroy {
  @Output() onVolver:EventEmitter<any> = new EventEmitter ()
  @Input() pantalla!:any;
  estadoSubscription = new Subscription()
  estado:any;
  customer:any;
  form:any;
  seriesSelect:any = [];
  series:any = [];
  seriesAsignadas:any = [];
  seriesAsignadasOld:any = [];
  constructor(private estadoService: EstadoOficinasService,private localService: LocalService,private spinner: NgxSpinnerService,public formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService, private seriesService: SeriesService, private pantallasService: PantallasService) { }

  async ngOnInit() {
    this.customer = this.localService.getValue('customer');
    this.estadoSubscription = this.estadoService.estado$.subscribe(async(estado)=>{
      this.estado = estado;
    })
    this.form = this.formBuilder.group({
        // nombre: new FormControl('',  [Validators.required]),
      });
   await this.obtenerSeries()
   await this.obtenerSeriesPorPantalla()
  }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }
  async obtenerSeries(){
    this.spinner.show('pantalla-edit-loading')
  try{
    const resp = await this.seriesService.obtenerSeriesPorOficina(this.customer.slug,this.estado.selectedIdOficina)
    if(resp.status){
      this.series = resp.data;
      this.seriesSelect = resp.data.map((serie:any)=>{
        return {
            ...serie,
            activo:true
        }
    });
     }else{
       this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener el listado de series');
     }
  } catch(e:any){
    this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener el listado de series');
  }
     this.spinner.hide('pantalla-edit-loading')
  }
  async obtenerSeriesPorPantalla(){
    this.spinner.show('pantalla-edit-loading')
  try{
    const resp = await this.pantallasService.obtenerSeriesPorPantalla(this.pantalla.idPantallaTurno)
    if(resp.status){
        resp.data.forEach((pantallaView:any)=>{
            const selectedSerie = this.seriesSelect.find((serie:any)=>serie.id == pantallaView.idSerie)
            if(selectedSerie){
                this.seriesAsignadas.push({idSerie:pantallaView.idSerie,activo:true,serie:selectedSerie.valor,idPantallaView:pantallaView.idPantallaView,edit:true});
                this.seriesAsignadasOld.push({idSerie:pantallaView.idSerie,activo:true,serie:selectedSerie.valor,idPantallaView:pantallaView.idPantallaView,edit:true});
              selectedSerie.activo = false
            }
          })
     }else{
       this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener las series del customer');
     }
  } catch(e:any){
    console.log(e)
    this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener las series del customer');
  }
     this.spinner.hide('pantalla-edit-loading')
  }
  handleSelectSerie(e:any){
    const selectedSerie = this.seriesSelect.find((serie:any)=>serie.id == e.target.value);
    if(selectedSerie){
        this.seriesAsignadas.push({idSerie:e.target.value,activo:true,serie:selectedSerie.valor,alternado:1});
        selectedSerie.activo = false
    }
  }
  deleteSelectedSerie(id:any){
    const selectedSerie = this.seriesAsignadas.find((serie:any)=>serie.idSerie == id);
    if(selectedSerie){
        const indexSerie = this.seriesAsignadas.indexOf(selectedSerie);
        this.seriesAsignadas.splice(indexSerie,1);
        const selectedSerieToAdd = this.seriesSelect.find((serie:any)=>serie.id == id);
        selectedSerieToAdd.activo = true;
    }
  }
  handleDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.seriesAsignadas, event.previousIndex, event.currentIndex);
  }
  async limpiarSeriesAsignadas(){
    const resp = await this.sweetAlertService.swalConfirm('¿Desea limpiar las series asignadas?')
    if(resp){
        const seriesAsignadasIds:any[] = this.seriesAsignadas.map((serie:any)=>(serie.idSerie))
        this.seriesSelect = this.seriesSelect.map((serie:any)=>{
          if(!seriesAsignadasIds.includes(serie.id)){
            return {
              ...serie,
              activo:true
            }
          }
          return serie
        })
        this.seriesAsignadas = cloneDeep(this.seriesAsignadasOld);
    }
  }
  changeSelectedSerie(id:any,activar=false){
    const selectedSerie = this.seriesAsignadas.find((serie:any)=>serie.idSerie == id);
    const isNewSerie = this.seriesAsignadasOld.find((serie:any)=>serie.idSerie == id);
    if(selectedSerie && !isUndefined(isNewSerie)){
      selectedSerie.activo = activar;
    }
    if(selectedSerie && isUndefined(isNewSerie)){
      const indexSerie = this.seriesAsignadas.indexOf(selectedSerie);
      this.seriesAsignadas.splice(indexSerie,1);
      const selectedSerieToAdd = this.seriesSelect.find((serie:any)=>serie.id == id);
      selectedSerieToAdd.activo = true;
    }
  }
  renderSeriesSelect(){
    return this.seriesSelect.filter((serie:any)=>(serie.activo));
  }
  
  volver(data:any = {reloadData:false}){
    this.onVolver.emit(data)
  }
  async onSubmit(){
    if(isEmpty(this.seriesAsignadas)){
      if(isEmpty(this.seriesAsignadas)){
        this.sweetAlertService.toastConfirm('error',`Debes ingresar las series que estarán asignadas a esta pantalla`);
      }
    } else {
      this.spinner.show('pantalla-edit-loading')
   let contadorErrores = 0
      for (let index = 0; index < this.seriesAsignadas.length; index++) {
        const serie = this.seriesAsignadas[index];
        const serieModificada = this.seriesAsignadasOld.find((serieOld:any)=>serieOld.idSerie == serie.idSerie);
        if(serieModificada && !serie.activo){
            try {
                const resp: any = await this.pantallasService.desasignarSerieAPantalla(
                    serieModificada.idPantallaView,
                    1
                );
                if (!resp['status']) {
                    contadorErrores++
                }

            }
            catch (error: any) {
                contadorErrores++
            }
        }
        if(!serieModificada){
            const data = {
                idPantalla: this.pantalla.idPantallaTurno,
                serie: parseInt(serie.idSerie),
                }
            try {
                const resp: any = await this.pantallasService.asignarSerieAPantalla(
                    data,
                    1
                );
                if (!resp['status']) {
                    contadorErrores++
                }

            }
            catch (error: any) {
                contadorErrores++
            }
        }
      }
      if(contadorErrores <= 0){
        this.sweetAlertService.toastConfirm('success','La pantalla se ha actualizado con éxito');
        this.volver({reloadData:true,pantalla:this.pantalla});
      } else {
          this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al asignar las series a la pantalla');  
      }
      this.spinner.hide("pantalla-edit-loading");
    }
  }

  handleErrors(){
    let mensajeErrores:any
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          let error;
          if(keyError == 'required'){
            error = `El campo ${key} es requerido`
          }
          if(mensajeErrores){
            mensajeErrores = `${mensajeErrores}\n ${error}\n`
          } else {
            mensajeErrores = `\n${error}\n`
          }
        });
      }
    });
    this.sweetAlertService.toastConfirm('error',`No se ha podido crear la pantalla, debido a los siguientes errores:\n${mensajeErrores}`);
  }
}
