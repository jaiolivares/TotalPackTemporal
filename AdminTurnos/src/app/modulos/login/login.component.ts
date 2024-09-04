import { AuthService } from './../../core/services/auth/auth.service';
import { LocalService } from './../../core/services/storage/local.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SweetAlertService } from '../../core/services/utils/sweet-alert.service';
import { CustomerService } from 'src/app/core/services/http/customer.service';
import { AesService } from 'src/app/core/services/utils/aes.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  slug: any;
  loginForm!: FormGroup;
  isSubmitted = false;
  dataLogin = {};

  formLogin = new FormGroup({
    usuairo: new FormControl('', Validators.required),
    contrasena: new FormControl('', Validators.required),
  });

  submit:boolean = false;

  constructor(
    private sweetAlertService: SweetAlertService,
    private router:Router,
    private localSecureService: LocalService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private customerService: CustomerService,
    private aesService: AesService
  ) { }

  ngOnInit(): void {
    this.localSecureService.setValue('login', false);
    const customer = this.localSecureService.getValue('customer');
    this.slug = customer.slug;
    this.customerService.setColores();
    this.setForm();
  }

  setForm() {
    this.loginForm = this.formBuilder.group({
      usuario: ['', [
        Validators.required,
        Validators.pattern('^[.a-zA-Z0-9_-]*$'),Validators.maxLength(15),Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(1)
      ]],
    });
  }

  onSubmit() {
     this.isSubmitted = true;

    if (this.loginForm.invalid) {
      return;
    }
    this.ingresar();
  }

  async ingresar(){
    try{
      this.dataLogin = {
        "userName": this.loginForm.value.usuario,
        "pass": this.loginForm.value.password,
      }

      let resp: any = this.slug === 'ttp_bchile' 
      ?  await this.authService.loginCl(this.dataLogin)
      : await this.authService.login(this.slug, this.dataLogin)

      resp.data =  this.slug === 'ttp_bchile' 
      ? this.aesService.aesDecrypt(resp.data)
      : resp.data;
      
      if (resp.status && resp['data'][0].codError === 0) {
        this.autenticar(resp);
      } else {
        this.sweetAlertService.swalErrorLogin(
          '¡Lo sentimos!',
          'Ha ocurrido un error de autenticación',
          'Intente nuevamente...');
      }
    } catch(e){
      this.sweetAlertService.swalErrorLogin(
        '¡Lo sentimos!',
        'Ha ocurrido un error',
        'Intente nuevamente...');
    }
  }

  autenticar(resp:any) {
    this.localSecureService.setValue('login', true);
    const usuario = resp.data[0];
    this.localSecureService.setValue('username', this.loginForm.value.usuario);
    this.localSecureService.setValue('userpass', this.loginForm.value.password);
    this.localSecureService.setValue('jsonPermisos', JSON.parse(usuario.jsonPermisos));
    this.localSecureService.setValue('jsonOficinas', JSON.parse(usuario.jsonOficinas));
    //Set los permisos de administracion / acceso
    const permisos = JSON.parse(usuario.jsonPermisos);
    const permisosArray = [];
    for (const key in permisos) {
      if (Object.prototype.hasOwnProperty.call(permisos, key)) {
        const permiso = permisos[key];
        if(key != "IdUsr"){
          if(permiso === true){
            permisosArray.push(key)
          }
        }
      }
    }
    //Set los ids de las oficinas en el array
    const permisosOficinas = JSON.parse(usuario.jsonOficinas);
    const permisosOficinasArray = [];
    for (const key in permisosOficinas) {
      if (Object.prototype.hasOwnProperty.call(permisosOficinas, key)) {
        const oficina = permisosOficinas[key];
        permisosOficinasArray.push(oficina.IdOfi)
      }
    }
    this.localSecureService.setValue('permisosOficinas', permisosOficinasArray);
    this.localSecureService.setValue('permisosAdministracion', permisosArray);
    this.localSecureService.setValue('usuario', usuario);
    this.router.navigate(['admin/inicio']);
    /* this.sweetAlertService.swalClose(); */
  }
}
