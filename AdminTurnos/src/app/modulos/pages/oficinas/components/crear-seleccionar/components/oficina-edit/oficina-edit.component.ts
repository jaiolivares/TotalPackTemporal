import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, Sanitizer, SimpleChanges, ViewChild } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { EstadoOficinasService } from 'src/app/core/services/pages/oficinas.service';
import { Subscription } from 'rxjs';
import { OficinaService } from 'src/app/core/services/http/oficina/oficina.service';
import { LocalService } from 'src/app/core/services/storage/local.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as Leaflet from 'leaflet';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { ZonasService } from 'src/app/core/services/http/general/zonas.service';
import { GeolocationService } from 'src/app/core/services/http/geolocation.service';

@Component({
  selector: 'app-oficina-edit',
  templateUrl: './oficina-edit.component.html',
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
export class OficinaEditComponent implements OnInit, OnDestroy {
  @Output() onVolver: EventEmitter<any> = new EventEmitter()
  estadoSubscription = new Subscription()
  estado: any;
  customer: any;
  form: any;
  zonas: any = [];
  map!: Leaflet.Map;
  markers: Leaflet.Marker[] = [];
  generatedAddress: any;
  isSubmitted: boolean = false;
  options = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 16,
    center: { lat: -33.46719, lng: -70.65469 }
  }

  constructor(private estadoService: EstadoOficinasService, private oficinaService: OficinaService, private localService: LocalService, private spinner: NgxSpinnerService, public formBuilder: FormBuilder,
    private sweetAlertService: SweetAlertService, private zonaService: ZonasService, private geoLocationService: GeolocationService) { }

  async ngOnInit() {
    this.customer = this.localService.getValue('customer');
    this.estadoSubscription = this.estadoService.estado$.subscribe(async (estado) => {
      this.estado = estado;
    })
    this.form = this.formBuilder.group({
      idOficina: new FormControl(this.estado.selectedOficina.idOficina, [Validators.required]),
      oficina: new FormControl(this.estado.selectedOficina.oficina, [Validators.required]),
      direccion: new FormControl(this.estado.selectedOficina.direccion, [Validators.required]),
      codOficina: new FormControl(this.estado.selectedOficina.codOficina),
      idZona: new FormControl(this.estado.selectedOficina.idZona || 'Seleccione una zona'),
      latitud: new FormControl(this.estado.selectedOficina.latitud, [Validators.required]),
      longitud: new FormControl(this.estado.selectedOficina.longitud, [Validators.required]),
    });
    console.log(this.estado.selectedOficina.idZona)
    this.options.center.lat = this.estado.selectedOficina.latitud
    this.options.center.lng = this.estado.selectedOficina.longitud
    await this.obtenerOficina()
  }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  generateDraggableMarker(data: any, index: number) {
    return Leaflet.marker(data.position, { draggable: true, icon: Leaflet.icon({ iconUrl: 'assets/dist/img/marker-icon.png', shadowUrl: 'assets/dist/img/marker-shadow.png' }) },).on('dragend', (event) => this.markerDragEnd(event, index));
  }
  onMapReady($event: Leaflet.Map) {
    this.map = $event;
    this.setNewMarker(this.estado.selectedOficina.latitud, this.estado.selectedOficina.longitud)
  }

  async obtenerOficina(traerZonas = true) {
    this.spinner.show('oficina-edit-loading')
    try {
      const resp: any = await this.oficinaService.obtenerOficina(this.customer.slug, this.estado.selectedIdOficina);
      if (resp.status) {
        this.estadoService.setValor('selectedOficina', resp.data[0])
        if (traerZonas) {
          await this.obtenerZonas()
        }

      } else {
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener la oficina');
        this.volver();
      }
    } catch (e: any) {
      this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener la oficina');
      this.volver();
    }
    this.spinner.hide('oficina-edit-loading')
  }


  async obtenerZonas() {
    (await this.zonaService.obtenerZonas(this.customer.slug))
      .subscribe((resp: any) => {
        if (resp.status) {
          this.zonas = resp.data
          console.log(this.zonas)
        } else {
          this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener la zonas');
        }
      }, error => {
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al obtener la zonas');
      });
  }
  async mapClicked($event: any) {
    this.setNewMarker($event.latlng.lat, $event.latlng.lng);
    this.form.patchValue({
      latitud: $event.latlng.lat,
      longitud: $event.latlng.lng
    });
    this.spinner.show('oficina-edit-loading')
    const resp: any = await this.geoLocationService.getGeolocation({ lat: $event.latlng.lat, lng: $event.latlng.lng })
    if (resp.code == 200) {
      this.form.patchValue({
        direccion: `${resp.address?.road ? resp.address?.road : '-----'}, ${resp.address?.county ? resp.address?.county : '-----'}, ${resp.address?.state ? resp.address?.state : '-----'}`
      })
    }
    this.spinner.hide('oficina-edit-loading')
  }

  setNewMarker(lat: any, lng: any) {
    if (this.markers.length > 0) {
      this.map.removeLayer(this.markers[0]);
    }
    this.markers = [];
    const initialMarkers = [
      {
        position: { lat: lat, lng: lng }
      },
    ];
    for (let index = 0; index < initialMarkers.length; index++) {
      const data = initialMarkers[index];
      const marker = this.generateDraggableMarker(data, index);
      marker.addTo(this.map).bindPopup(`<b>${data.position.lat},  ${data.position.lng}</b>`);
      this.map.panTo(data.position);
      this.markers.push(marker)
    }
  }
  async markerDragEnd($event: any, index: number) {
    const cords = $event.target.getLatLng()
    this.form.patchValue({
      latitud: cords.lat,
      longitud: cords.lng
    })
    this.spinner.show('oficina-edit-loading')
    const resp: any = await this.geoLocationService.getGeolocation({ lat: cords.lat, lng: cords.lng })
    if (resp.code != 400 && resp.code != 404) {
      this.form.patchValue({
        direccion: `${resp.address.road}, ${resp.address.county}, ${resp.address.state}`
      })
    }
    this.spinner.hide('oficina-edit-loading')
  }

  volver(reloadData = false) {
    this.isSubmitted = false;
    this.onVolver.emit(reloadData)
  }
async onSubmit() {
  this.isSubmitted = true;
  if (this.form.invalid) {
    this.handleErrors()
  } else {
    this.spinner.show('oficina-edit-loading')
    let idZona = this.form.get('idZona')?.value;
    if (idZona === 'Seleccione una zona') {
      idZona = null;
    }
    console.log("id zona es "+idZona);
    const data = {
      idUser: this.localService.getValue('usuario').idUsuario,
      idOficina: this.form.get('idOficina')?.value,
      oficina: this.form.get('oficina')?.value,
      direccion: this.form.get('direccion')?.value,
      codOficina: this.form.get('codOficina')?.value,
      idZona: idZona,
      latitud: this.form.get('latitud')?.value,
      longitud: this.form.get('longitud')?.value,
        data: ""
      }
      try {
        const resp: any = await this.oficinaService.editarOficina(
          this.localService.getValue('customer').slug,
          data
        );
        if (resp['status'] && resp['data'][0].codError == 0) {
          this.sweetAlertService.toastConfirm('success', 'La oficina se ha editado con éxito');
          this.volver(true);
        } else {
          this.sweetAlertService.toastConfirm('error', `Ha ocurrido un error al editar la oficina  ${resp.data?.[0]?.['msg'] ? '- ' + resp.data?.[0]?.['msg'] : ''}`);
        }
        this.spinner.hide("oficina-edit-loading");

      }
      catch (error: any) {
        this.spinner.hide("oficina-edit-loading");
        this.sweetAlertService.toastConfirm('error', 'Ha ocurrido un error al editar la oficina');

      }
    }
  }
  handleErrors() {
    let mensajeErrores: any
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          let error;
          if (keyError == 'required') {
            error = `El campo ${key} es requerido`
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`
          } else {
            mensajeErrores = `\n${error}\n`
          }
        });
      }
    });
    this.sweetAlertService.toastConfirm('error', `No se ha podido actualizar la oficina, debido a los siguientes errores:\n${mensajeErrores}`);
  }
  handleCordsChanged() {
    this.map.panTo(new Leaflet.LatLng(this.form.get('latitud')?.value, this.form.get('longitud')?.value));
    this.setNewMarker(this.form.get('latitud')?.value, this.form.get('longitud')?.value)
  }
}
