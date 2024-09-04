import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { PantallasService } from 'src/app/core/services/http/pacientes/pantallas.service';
import { EstadoMedicosService } from 'src/app/core/services/pages/medicos.service';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/core/services/utils/modal.service';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { Subject, Subscription } from 'rxjs';
@Component({
  selector: 'app-pantallas',
  templateUrl: './pantallas.component.html',
  styleUrls: ['./pantallas.component.css'],
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
    ]),
  ],
})
export class PantallasComponent implements OnInit {

  pantallas: any = [];
  pantallaViews: any = [];
  nomPantallaSelect: string = "";
  totalPantallas: number = 0;
  agregar = false;
  form!: FormGroup
  idPantallaMedico: string = "";
  modalEventSubscription: Subscription = new Subscription();
  updateLista: boolean = false;
  mostrarTodos: boolean[] = [];
  public isSubmitted = false;

  constructor(
    private spinner: NgxSpinnerService,
    private pantallasService: PantallasService,
    private estadoService: EstadoMedicosService,
    private sweetAlertService: SweetAlertService,
    public formBuilder: FormBuilder,
    private modalService: ModalService,
  ) { }


  ngOnInit(): void {

    this.form = this.formBuilder.group({
      box: ['', [Validators.required, Validators.maxLength(3)]],
      piso: ['', [Validators.required, Validators.maxLength(3)]],
    });

    this.obtenerPantallas();
  }

  async obtenerPantallas() {
    this.spinner.show("servicio-loading");
    (await this.pantallasService.obtenerPantallas())
      .subscribe({
        next: async (resp: any) => {
          if (resp.status) {
            this.totalPantallas = resp['data'].length
            this.estadoService.setValor('totalMedicos', this.totalPantallas)

            if (this.totalPantallas > 0) {
              resp['data'].map((data: any) => {

                data.listaPantallaMedico_view.sort((a: any, b: any) => {
                  const pisoA = a.piso;
                  const pisoB = b.piso;
                  const boxA = parseInt(a.box);
                  const boxB = parseInt(b.box);

                  // Ordenar por "piso"
                  if (pisoA < pisoB) return -1;
                  if (pisoA > pisoB) return 1;

                  // Ordenar por "box" si "piso" es el mismo
                  if (boxA < boxB) return -1;
                  if (boxA > boxB) return 1;

                  return 0;
                });
              })


              this.pantallas = resp['data'];

              console.log(this.pantallas);


              if (this.updateLista) {
                this.selectPantalla(this.idPantallaMedico);
                this.updateLista = false;
              }
            }


            this.spinner.hide("servicio-loading");
          } else {
            this.spinner.hide("servicio-loading");
            this.sweetAlertService.toastConfirm('error', '¡Error al obtener pantallas!');
          }
        }
      }), (error: any) => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error', '¡Error al obtener pantallas!');
      }
  }

  toggleMostrarTodos(indice: number) {
    this.mostrarTodos[indice] = !this.mostrarTodos[indice];
  }

  selectPantalla(IdPantalla: any) {
    this.idPantallaMedico = IdPantalla;
    let pantallaViews = this.pantallas.filter((pantallas: any) => pantallas.idPantallaMedico == IdPantalla);
    this.nomPantallaSelect = pantallaViews[0].nombreOficina;
    this.pantallaViews = pantallaViews[0].listaPantallaMedico_view;

    this.agregar = true;
  }

  modalEditar(medicoView: any) {
    const options = {
      id: 1,
      class: 'modal-lg modal-dialog-centered modal-info-oficinas modal-vista-previa-ticket',
      centered: true,
      ignoreBackdropClick: true,
      initialState: { data: { idPantallaMedico: this.idPantallaMedico, box: medicoView.box, piso: medicoView.piso, idPantallaMedicoView: medicoView.idPantallaMedicoView, } },
      animated: true,
    };
    this.modalService.openModal(
      ModalEditComponent,
      options,
      'app-modal-edit'
    );
    this.modalEventSubscription = this.modalService.getModalRef('app-modal-edit')?.onHidden?.subscribe(() => {
      this.obtenerPantallas();
      this.updateLista = true;
    }) || new Subscription();

  }

  async AgregarPantalla() {
    this.isSubmitted = true;

    if (this.form.invalid) {
      this.handleErrors()
      return;
    }

    this.spinner.show("servicio-loading");
    const resp = await this.pantallasService.agregarPantalla(this.idPantallaMedico, this.form.value);

    if (resp.status) {
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('success', 'Box Agregado!');
      this.form.reset();
      this.obtenerPantallas()
      this.updateLista = true;
    } else {
      this.spinner.hide("servicio-loading");
      this.sweetAlertService.toastConfirm('error', `¡Error al agregar box! \n\n${resp.message} \n`);
    }
  }

  async borrarPantalla(medicoView: any) {
    this.sweetAlertService.swalConfirm(`¿ Estás seguro que deseas eliminar el box "${medicoView.box}" ?`).then(async resp => {
      if (resp) {
        this.spinner.show("servicio-loading");
        const resp = await this.pantallasService.eliminarPantalla(medicoView.idPantallaMedicoView)

        if (resp.status) {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('success', 'Box eliminado!');
          this.obtenerPantallas();
          this.updateLista = true;
        } else {
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error', `¡Error al eliminar!`);
        }
      }
    });
  }

  cancelarAgregarPantalla() {
    this.isSubmitted = false;
    this.agregar = !this.agregar;
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

}
