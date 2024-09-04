import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import * as $ from 'jquery';


@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  swalPreloader(): void {
    const html = '<div"><img class="animate__bounce" src="assets/dist/img/logo.svg" alt="AdminLTELogo" height="150" width="150"></div>';
    Swal.fire({
      html,
      position: 'center',
      showConfirmButton: false,
      background: 'bottom',
      backdrop: 'rgba(255,255,255)',
      allowOutsideClick: false,
      timer: 1500
    });
  }

  swalConfirm(title: string): Promise<any> {

    return new Promise<boolean>(async resolve => {
    Swal.fire({
      customClass: {
        title:'text-white',

        confirmButton:'swal2-confirm-button-quetion',
        cancelButton:'swal2-confirm-button-quetion'
      },
      background:'var(--color-llamado)',
      imageUrl:'assets/dist/img/alert.svg',
      imageWidth:'70px',
      title:`<h5 class="text-white">${title}</h5>`,
      confirmButtonText: 'Si',
      showCancelButton: true,
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        resolve(true);
        }else{
          resolve(false);
        }
    })

  });
  }

  swalInfoConfirm(title: string): Promise<any> {

    return new Promise<boolean>(async resolve => {
    Swal.fire({
      customClass: {
        title:'text-white',
        confirmButton:'swal2-confirm-button-quetion',
        cancelButton:'swal2-confirm-button-quetion'
      },
      background:'var(--color-llamado)',
      imageUrl:'assets/dist/img/alert.svg',
      imageWidth:'70px',
      title:`<h5 class="text-white">${title}</h5>`,
      confirmButtonText: 'Ok',
      showCancelButton: false,
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        resolve(true);
        }else{
          resolve(false);
        }
    })

  });
  }

  swalErrorLogin(title: string, subTitle: string, text: string): void {
    const html = `<div class="swa-content">
                      <div class="swa-header text-center">

                      </div>
                      <div class="swa-body pb-5">
                          <img src="assets/dist/img/alert.svg">
                          <h3 class="mt-2">${title}</h3>
                          <hr class="w-50 mx-auto">
                          <h6 class="mt-2">${subTitle}</h6>
                      </div>
                      <div class="swa-footer">
                          <div class="row mx-auto">
                              <h5 class="m-auto p-3">${text}</h5>
                          </div>
                      </div>
                    </div>`
    Swal.fire({
      width: 550,
      html,
      position: 'center',
      background: 'transparent',
      showConfirmButton: false,
      timer: 3000
    });
  }

  swalError(title: string, subTitle: string, text: string): void {
    const html = `<div class="swa-content">
                      <div class="swa-header text-center">

                      </div>
                      <div class="swa-body pb-5">
                          <img src="assets/dist/img/alert.svg">
                          <h3 class="mt-2">${title}</h3>
                          <hr class="w-50 mx-auto">
                          <h6 class="mt-2">${subTitle}</h6>
                      </div>
                      <div class="swa-footer">
                          <div class="row mx-auto">
                              <h5 class="m-auto p-3">${text}</h5>
                          </div>
                      </div>
                    </div>`
    Swal.fire({
      width: 550,
      html,
      position: 'center',
      background: 'transparent',
      showConfirmButton: false,
      timer: 3000
    });
  }
  swalInfo(title: string,text: string): void {
    const html = `<div class="swa-content">
    <div class="swa-header text-center">

    </div>
    <div class="swa-body pb-5">
        <img src="assets/dist/img/alert.svg">
        <h3 class="mt-2">${title}</h3>
    </div>
    <div class="swa-footer">
        <div class="row mx-auto">
            <h5 class="m-auto p-3">${text}</h5>
        </div>
    </div>
  </div>`
    Swal.fire({
      width: 550,
      html,
      position: 'center',
      background: 'transparent',
      showConfirmButton: false,
      timer: 3000
    });
  }

  swal500(): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'error',
      title: 'La solicitud no se ha podido completar. Intente nuevamente',
    })
  }

  toastConfirm(icon:any, title:string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: icon,
      title: title,
    })
  }

  swalClose(): void {
    Swal.close();
  }

}
