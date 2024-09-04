import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, Output, Sanitizer, SimpleChanges, ViewChild } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { Subscription } from 'rxjs';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as Leaflet from 'leaflet';
import { isEqual } from 'lodash';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
@Component({
  selector: 'app-crear-seleccionar',
  templateUrl: './crear-seleccionar.component.html',
  styleUrls: ['./crear-seleccionar.component.css'],
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
export class CrearSeleccionarComponent implements OnInit, OnDestroy {

  editar = false;
  estadoSubscription = new Subscription()
  estado:any;
  customer:any;
  permisosAdministracion:any;
  map!: Leaflet.Map;
  markers: Leaflet.Marker[] = [];
  selectedOficina = {};
  cargarMarkersIniciales=true;
  options = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 16,
    center: { lat: -33.46719, lng: -70.65469 }
  }
  constructor(private estadoService: EstadoOficinasService, private oficinaService: OficinaService, private localService: LocalService,private spinner: NgxSpinnerService, private sweetAlertService: SweetAlertService) { }

  async ngOnInit() {
    this.permisosAdministracion = this.localService.getValue('permisosAdministracion')
    this.customer = this.localService.getValue('customer');
    this.estadoSubscription = this.estadoService.estado$.subscribe(async(estado)=>{
      //Estado previo
      const prevEstado = this.estado;
      //Estado actual
      this.estado = estado;
      //console.log(estado.selectedOficina)
      //Compara si el estado previo existe, si la oficina del estado previo existe y si el estado actual existe
      const valid = prevEstado && prevEstado.selectedOficina && this.estado;
      //Para que se actualice solo cuando cambie la oficina
      if(valid && !isEqual(prevEstado.selectedOficina,this.estado.selectedOficina) ){
        if(this.map){
          this.map.panTo(new Leaflet.LatLng(this.estado.selectedOficina.latitud, this.estado.selectedOficina.longitud));
          this.setNewMarker(this.estado.selectedOficina.latitud,this.estado.selectedOficina.longitud)
        } else {
          this.options.center.lat = this.estado.selectedOficina.latitud
          this.options.center.lng = this.estado.selectedOficina.longitud
        }
      }
      //Para que se llame solo cuando la oficina cambie, de modo que si se está en editar, regrese a datos.
      if(prevEstado && prevEstado.selectedIdOficina != estado.selectedIdOficina){
        this.volverADatos();
      }
    })
  }
  initMarkers() {
    const initialMarkers = [
      {
        position: { lat: this.estado.selectedOficina.latitud, lng: this.estado.selectedOficina.longitud },
      },
    ];
    for (let index = 0; index < initialMarkers.length; index++) {
      const data = initialMarkers[index];
      const marker = this.generateMarker(data, index);
      marker.addTo(this.map).bindPopup(`<b>${data.position.lat},  ${data.position.lng}</b>`);
      this.map.panTo(data.position);
      this.markers.push(marker)
    }
  }
  generateMarker(data: any, index: number) {
    return Leaflet.marker(data.position, { draggable: false, icon:Leaflet.icon({iconUrl:'assets/dist/img/marker-icon.png', shadowUrl:'assets/dist/img/marker-shadow.png'}) })
  }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }


  onMapReady($event: Leaflet.Map) {
    this.map = $event;
    if(this.cargarMarkersIniciales){
      this.initMarkers();
      this.cargarMarkersIniciales = false;
    }
  }

  async volverADatos(reloadData:any = false){
    this.editar = false;
    if(reloadData){
      await this.obtenerOficina()
    }
  }
  irAEditar(){
    this.editar = true;
  }
  setNewMarker(lat:any,lng:any){
    if(this.markers.length >0){
      for (let index = 0; index < this.markers.length; index++) {
        this.map.removeLayer(this.markers[index]);
      }
    }
    this.markers = [];
    const initialMarkers = [
      {
        position: { lat: lat, lng: lng }
      },
    ];
    for (let index = 0; index < initialMarkers.length; index++) {
      const data = initialMarkers[index];
      const marker = this.generateMarker(data, index);
      marker.addTo(this.map).bindPopup(`<b>${data.position.lat},  ${data.position.lng}</b>`);
      this.map.panTo(data.position);
      this.markers.push(marker)
    }
  }

  async obtenerOficina(){
    this.spinner.show('obtener-data-general-spinner')
    try{
      const resp:any = await this.oficinaService.obtenerOficina(this.customer.slug,this.estado.selectedIdOficina);
    if(resp.status){
      this.estadoService.setValor('selectedOficina',resp.data[0])

    } else {
      this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener la oficina');
    }
    } catch(e:any){
      this.sweetAlertService.toastConfirm('error','Ha ocurrido un error al obtener la oficina');
    }
    this.spinner.hide('obtener-data-general-spinner')
  }



}
