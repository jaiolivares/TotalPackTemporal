import { ImagesService } from './../../../core/services/misc/images.service';
import { LocalService } from './../../../core/services/storage/local.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  customer: any;
  logo: string = "";
  permisosAdministracion: any;
  usaAlarmas: boolean = false;
  constructor(private localSecureService: LocalService, private imagenes: ImagesService) {}

  ngOnInit(): void {
    this.customer = this.localSecureService.getValue("customer");
    this.permisosAdministracion = this.localSecureService.getValue("permisosAdministracion");
    this.usaAlarmas = this.usaPropiedadAlarmas();
    this.obtenerLogo(this.customer.slug);
  }

  async obtenerLogo(slug: string) {
    this.logo = await this.imagenes.getLogo(slug);
  }

  handleLogoError() {
    this.logo = "assets/dist/img/logottp.png";
  }

  usaPropiedadAlarmas() {
    const parametros = JSON.parse(this.customer.parametros);
    return parametros.fAlarma === undefined ? false : parametros.fAlarma;
  }
}
