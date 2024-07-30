import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
//services
import { StorageService } from 'src/app/core/utils/storage.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor(
    private router: Router,
    private cache: StorageService
  ) { }

  swalLoading(): void {
    const html = '<div><div class="pulse1"></div><div class="pulse2"></div><div class="pulse3"></div><div class="pulse4"></div></div>';
    Swal.fire({
      html,
      position: 'center',
      showConfirmButton: false,
      background: 'bottom',
      backdrop: 'rgba(255,255,255,0.8)',
      allowOutsideClick: false
    });
  }

  async swalErrorEmitter(): Promise<any> {
    let coloresTotem;
    try{
      const parametrosJson = JSON.parse(this.cache.getValue('customer').parametros);
      coloresTotem = parametrosJson.colorestotem;
    }
    catch(e){}
    let response = false;

    await Swal.fire({
      // icon: 'error',
      imageUrl: 'assets/img/alert.png',
      title: '¡Algo salió mal!',
      text: '¡Ha ocurrido un error! No se ha podido cargar la información del emisor.',
      showConfirmButton: true,
      confirmButtonText: 'Reintentar',
      confirmButtonColor: coloresTotem ? coloresTotem?.color1 : 'rgba(1, 28, 77, 1)',
      allowOutsideClick: false,

    }).then((result: any) => {
      response = result.isConfirmed;
    });

    return response;
  }

  async swalError(message: string, msgButton: string = 'Ok'): Promise<any> {
    let coloresTotem;
    
    try{
      const parametrosJson = JSON.parse(this.cache.getValue('customer').parametros);
      coloresTotem = parametrosJson.colorestotem;
    }
    catch(e){}
    let response = false;

    await Swal.fire({
      // icon: 'error',
      imageUrl: 'assets/img/alert.png',
      title: '¡Algo salió mal!',
      text: message,
      showConfirmButton: true,
      confirmButtonText: msgButton,
      confirmButtonColor: coloresTotem ? coloresTotem?.color1 : 'rgba(1, 28, 77, 1)',
      timer: 5000,
      allowOutsideClick: false,

    }).then((result: any) => {
      response = result.isConfirmed;
    });

    return response;
  }

  async swalInternet() {
    const html = `<div class="modal-content">
                      <div class="modal-body pb-5">
                          <img src="">
                          <h3 class="mt-2 h3-modal">¡Lo sentimos!</h3>
                          <hr class="w-50 mx-auto">
                          <h6 class="mt-2 h6-modal">¡Sin conexión a internet!</h6>
                      </div>
                      <div class="modal-footer">
                          <div class="row mx-auto">
                              <h5 class="h5-modal">El equipo se encuentra sin conexión a internet, por favor espere a que la conexión se restablezca para emitir turnos.</h5>
                          </div>
                      </div>
                    </div>`;
   await Swal.fire({
      width: 550,
      html,
      position: 'center',
      background: 'transparent',
      showConfirmButton: false,
      allowOutsideClick: false,
      showCancelButton: false,
    }).then(() => {
      // this.authService.logout();
    });

  }

  async swalNoImprime(): Promise<any> {
    let coloresTotem;
    try{
      const parametrosJson = JSON.parse(this.cache.getValue('customer').parametros);
      coloresTotem = parametrosJson.colorestotem;
    }
    catch(e){}

    let response = false;

    await Swal.fire({
      // icon: 'error',
      imageUrl: 'assets/img/alert.png',
      title: '¡Algo salió mal!',
      text: '¡Ha ocurrido un error con la impresora! Por favor revisar el estado físico de la misma.',
      showConfirmButton: true,
      confirmButtonText: 'Ok',
      confirmButtonColor: coloresTotem ? coloresTotem?.color1 : 'rgba(1, 28, 77, 1)',
      allowOutsideClick: false,
    }).then((result: any) => {
      response = result.isConfirmed;
    });

    return response;
  }

  swalClose(): void {
    Swal.close();
  }

  logout(): void {
    const id = this.cache.getValue('id') ?? '';
    const emitter: number = this.cache.getValue('multi-emitter') ?? 1;
    const param = id + "_" + emitter;
    this.router.navigate(['/', param]).then(() => {
      window.location.reload();
    });
  }
}
