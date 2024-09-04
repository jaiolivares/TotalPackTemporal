import { AfterViewInit, Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { UsuariosService } from 'src/app/core/services/http/general/usuarios.service';

@Component({
  selector: 'app-permmisos-oficinas',
  templateUrl: './permisos-oficinas.component.html',
})
export class PermisosOficinasComponent implements AfterViewInit {
  public oficinasSelected: any = [];
  public oficinas: any = [];
  public checkedAll:boolean = false
  constructor(
    private usuariosService: UsuariosService,
    public formBuilder: FormBuilder
  ) {}

  public formCheckOficinas = this.formBuilder.group({
    ofic: new FormArray([]),
  });

  async ngAfterViewInit() {
    await this.obtenerOficinas();
  }

  controlOnChange(e: any) {
    const posicion = this.oficinasSelected.findIndex(
      (item: any) => item == e.target.value
    );

    if (posicion === -1) {
      if (e.target.checked) {
        this.oficinasSelected.push(e.target.value);
      }
    } else {
      this.oficinasSelected.splice(posicion, 1);
    }
  }

  public userOficinas: any = [];

  initForm(userOfic: any) {
    this.oficinasSelected = [];

    // this.oficinas.forEach((oficina: any) => {
    //   this.formCheckOficinas.addControl(
    //     'check' + oficina.id,
    //     new FormControl(false)
    //   );
    // });

    // userOfic.forEach((userOficina: any) => {
    //   this.oficinasSelected.push(userOficina.toString());
    //   this.formCheckOficinas.patchValue({
    //     ['check' + userOficina]: true,
    //   });
    // });

    this.oficinas = this.oficinas.map((item: any) => {
      return { id: item['id'], nombre: item['nombre'], checked: false };
    });

    userOfic.forEach((userOficina: any) => {
      const posicion = this.oficinas.findIndex(
        (item: any) => item['id'] == userOficina
      );
      if (posicion !== -1) {
        this.oficinas[posicion]['checked'] = true;
      }
    });

    for (let ofi of this.oficinas) {
      if (ofi['checked']) {
        this.oficinasSelected.push(ofi['id']);
      }
    }

    this.userOficinas = userOfic;
  }

  private async obtenerOficinas() {
    const resp = await this.usuariosService.obtenerOficinas();

    if (!resp['status']) {
      return;
    }

    this.oficinas = resp['data'].map((item: any) => {
      return { id: item['id'], nombre: item['valor'], checked: false };
    });
  }

  public selectAll(e: any) {
    this.checkedAll = e.target.checked
    this.oficinasSelected = [];
    this.oficinas.forEach((item:any) => {
        item.checked = e.target.checked
    });
    if (e.target.checked) {
      for (let ofi of this.oficinas) {
        if (ofi['checked']) {
          this.oficinasSelected.push(ofi['id']);
        }
      }
    }
  }
}
