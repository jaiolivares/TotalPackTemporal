import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PantallasService } from 'src/app/core/services/http/pacientes/pantallas.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-modal-edit',
  templateUrl: './modal-edit.component.html',
  styleUrls: ['./modal-edit.component.css']
})
export class ModalEditComponent implements OnInit {

  data:any;
  form!:FormGroup

  constructor(
    private modalService: ModalService,
    public formBuilder: FormBuilder,
    private pantallasService: PantallasService,
    private sweetAlertService: SweetAlertService,
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit(): void {

    this.form = this.formBuilder.group({
      box: ['', [Validators.required, Validators.maxLength(3)]],
      piso:  ['', [Validators.required, Validators.maxLength(3)]],
   });

   this.form.patchValue({
    box:this.data.box,
    piso:this.data.piso
  });
   
  }

  async editarBox(){
    if(this.form.invalid){
      this.handleErrors()
       return;
     }
     
    this.spinner.show("servicio-loading");
    const resp = await this.pantallasService.actualizarPantalla(this.data.idPantallaMedico, this.data.idPantallaMedicoView, this.form.value);
    if(resp.status){
      this.spinner.hide("servicio-loading");
      this.closeModal();
      this.sweetAlertService.toastConfirm('success','Box Actualizado!');
    }else{
      this.spinner.hide("servicio-loading");
      this.closeModal();
      this.sweetAlertService.toastConfirm('error',`¡Error al actualizar box! \n\n${resp.message} \n`);
    }
  }

  handleErrors() {
    let mensajeErrores: any;
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (keyError == 'required') {
            error = `El campo ${key} es requerido`;
          }
          if (key == 'box' && keyError == 'maxlength') {
            error = `El campo box admite máximo 3 caracteres`;
          }
          if (key == 'piso' && keyError == 'maxlength') {
            error = `El campo piso admite máximo 3 caracteres`;
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`;
          } else {
            mensajeErrores = `\n${error}\n`;
          }
        });
      }
    });
    this.sweetAlertService.toastConfirm(
      'error',
      `Error al registrar datos, debido a los siguientes errores:\n${mensajeErrores}`
    );
  }

  closeModal() {
    this.modalService.closeModal('app-modal-edit');
  }

}
