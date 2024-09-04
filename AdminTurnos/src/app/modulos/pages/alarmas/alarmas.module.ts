import { AlarmasComponent } from "./alarmas.component";
import { AlarmasRoutingModule } from "./alarmas-routing.module";
import { CommonModule } from "@angular/common";
import { CreateEditPerfilComponent } from "./components/perfiles/components/create-edit-perfil/create-edit-perfil.component";
import { CreateEditSerieComponent } from "./components/series/components/create-edit-serie/create-edit-serie.component";
import { DayCardSimpleComponent } from "./components/day-card-simple/day-card-simple.component";
import { DetallePerfilComponent } from "./components/perfiles/components/detalle-perfil/detalle-perfil.component";
import { DetalleSerieComponent } from "./components/series/components/detalle-serie/detalle-serie.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FormsModule } from "@angular/forms";
import { GeneralModule } from "../general/general.module";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { NgModule } from "@angular/core";
import { NgxMaskModule } from "ngx-mask";
import { NgxPaginationModule } from "ngx-pagination";
import { NgxSpinnerModule } from "ngx-spinner";
import { PerfilesComponent } from "./components/perfiles/perfiles.component";
import { PipesModule } from "src/app/core/pipes/pipes.module";
import { ReactiveFormsModule } from "@angular/forms";
import { SeriesComponent } from "./components/series/series.component";
import { TimepickerModule } from "ngx-bootstrap/timepicker";

@NgModule({
  declarations: [AlarmasComponent, CreateEditPerfilComponent, CreateEditSerieComponent, DayCardSimpleComponent, DetallePerfilComponent, DetalleSerieComponent, PerfilesComponent, SeriesComponent],
  imports: [AlarmasRoutingModule, CommonModule, DragDropModule, FormsModule, GeneralModule, MatIconModule, MatTabsModule, NgxMaskModule.forRoot(), NgxPaginationModule, NgxSpinnerModule, PipesModule, ReactiveFormsModule, TimepickerModule],
  exports: [],
})
export class AlarmasModule {}
