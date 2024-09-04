import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger} from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetAlertService } from 'src/app/core/services/utils/sweet-alert.service';
import { MedicosService } from 'src/app/core/services/http/pacientes/medicos.service';
import { EstadoMedicosService } from 'src/app/core/services/pages/medicos.service';
import { GroupBy } from 'src/app/core/models/filtros.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidaRutService } from 'src/app/core/services/misc/valida-rut.service';
@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styleUrls: ['./medicos.component.css'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '*',
          opacity: '1',
          visibility: 'visible',
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: '0',
          'margin-bottom': '-100px',
          visibility: 'hidden',
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
})
export class MedicosComponent implements OnInit {

  medicos: any = [];
  totalMedicos:number = 0;
  idMedic:number = 0;
  page = 1;
  order = '';
  searchText: string = '';
  mostrar = 'Todos';
  activeGroupBy: string = '';
  groupBy: GroupBy = {};
  agregar = false;
  actualizar = false;
  form!:FormGroup
  validatedRut: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private medicosService: MedicosService,
    private estadoService:EstadoMedicosService,
    private sweetAlertService: SweetAlertService,
    public formBuilder: FormBuilder,
    private validaRutService: ValidaRutService,
    ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      rut: ['', [Validators.required]],
      nombre:  ['', [Validators.required, Validators.maxLength(20)]],
      apellidoPaterno: ['', [Validators.maxLength(20)]],
      apellidoMaterno: ['', [Validators.maxLength(20)]],
      box: new FormControl("", [Validators.maxLength(3)]),
    });

    this.obtenerMedicos()
  }


  async obtenerMedicos(){
    this.spinner.show("servicio-loading");
    (await this.medicosService.obtenerMedicos())
      .subscribe((resp:any) => {
        if(resp.status){
          this.totalMedicos = resp['data'].length
          this.estadoService.setValor('totalMedicos',this.totalMedicos)
          this.medicos = resp['data'];
          this.spinner.hide("servicio-loading");
         }else{
           this.spinner.hide("servicio-loading");
           this.sweetAlertService.toastConfirm('error','¡Error al obtener medicos!');
         }
      },(error:any) => {
        this.spinner.hide("servicio-loading");
        this.sweetAlertService.toastConfirm('error','Error al obtener Medicos!');
      })
   }

   async enviarForm(){

    if(this.form.invalid || !this.validatedRut){
     this.handleErrors()
      return;
    }
    
    this.form.value.rut = this.form.value.rut?.replace(/\./g, "").replace(".", "");

    let listaRuts = this.medicos.map((data:any) => {
      return data.rut
    })

   let rutDuplicado = listaRuts.filter((item: any) => item === this.form.value.rut);

   if(this.form.value.apellidoPaterno.trim() === '' &&  this.form.value.apellidoMaterno.trim() === ''){
        this.notifiError(`\n Debes agregar al menos un apellido.`);
       return;
    }
    
    if(this.actualizar){

      if(rutDuplicado.length > 1){
        this.notifiError(`\n ¡Este RUT ya existe! \n`)
        return;
      }
      this.spinner.show("servicio-loading");
      const resp = await this.medicosService.actualizarMedico(this.idMedic, this.form.value);
        if(resp.status){
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('success','Medico editado!');
          this.cerrarForm();
          this.obtenerMedicos();
        }else{
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error',`¡Error al actualizar! ${resp.data?.[0]?.['msg'] ? '- '+resp.data?.[0]?.['msg'] : ''}`);
        }
      }else{

        if(rutDuplicado.length > 0){
          this.notifiError(`\n¡Este RUT ya existe! \n`)
          return;
        }
        this.spinner.show("servicio-loading");
        const resp = await this.medicosService.agregarMedico(this.form.value);
  
        if(resp.status){
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('success','Medico agregado!');
          this.cerrarForm();
          this.obtenerMedicos();
        }else{
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error',`¡Error al agregar Medico! \n\n${resp.message} \n`);
        }
      }
  }

  async borrarMedico(medico:any){
    this.sweetAlertService.swalConfirm(`¿ Estás seguro que deseas eliminar al medico "${medico.nombre} ${medico.paterno}" ?`).then(async resp => {
      if (resp) {
        this.spinner.show("servicio-loading");
        const resp = await this.medicosService.eliminarMedico(medico.idMedico)

        if(resp.status){
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('success','Medico eliminado!');
          this.obtenerMedicos();
        }else{
          this.spinner.hide("servicio-loading");
          this.sweetAlertService.toastConfirm('error',`¡Error al eliminar!`);
        }
      }
    });
  }

    selectMedico(medico:any){
      this.agregar = true;
      this.actualizar = true
      this.idMedic = medico.idMedico;
     
      this.form.patchValue({
        rut:medico.rut,
        nombre:medico.nombre,
        apellidoPaterno:medico.paterno,
        apellidoMaterno:medico.materno,
        box:medico.box
      });

      this.formatRut();
    }
  

  async tecleado(event: any) {
    this.searchText = event.value;
  }

   async onPageChange(page:number) {
     this.page = page;
   }



  formatRut() {
    this.validatedRut = this.validateRut();
    this.form.patchValue({
      rut: this.validaRutService.formatearRut(this.form.value.rut)
    });
  }

  private validateRut() {
    const userRut = this.limpiarRut();
    return this.validaRutService.validarRut(userRut);
  }

  private limpiarRut() {
    return this.form.value.rut?.replace(/\./g, "").replace("-", "");
  }

  cerrarForm(){
    this.agregar = false;
    this.actualizar = false;
    this.idMedic = 0;
    this.form.reset({id:"f", habilitado:false});
  }


  handleErrors() {
    let mensajeErrores: any;

    if(!this.validatedRut){
      mensajeErrores = `\n El campo RUT no es valido.\n`;
    }

    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors: any = this.form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          let error;
          if (key == 'rut' && keyError == 'required') {
            error = `El campo RUT es requerido`;
          }
          if (key == 'nombre' && keyError == 'required') {
            error = `El campo Nombre es requerido`;
          }
          if (key == 'nombre' && keyError == 'maxlength') {
            error = `El campo Nombre admite máximo 20 caracteres`;
          }
          if (key == 'apellidoPaterno' && keyError == 'maxlength') {
            error = `El campo Apellido paterno admite máximo 20 caracteres`;
          }
          if (key == 'apellidoMaterno' && keyError == 'maxlength') {
            error = `El campo Apellido materno admite máximo 20 caracteres`;
          }
          if (key == 'box' && keyError == 'maxlength') {
            error = `El campo box admite máximo 3 caracteres`;
          }
          if (mensajeErrores) {
            mensajeErrores = `${mensajeErrores}\n ${error}\n`;
          } else {
            mensajeErrores = `\n${error}\n`;
          }
        });
      }
    });
    this.notifiError(mensajeErrores);
  }

  notifiError(mensajeErrores:any){
    this.sweetAlertService.toastConfirm(
      'error',
      `Error al registrar datos, debido a los siguientes errores:\n${mensajeErrores}`
    );
  }
  

}
