import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AlarmasComponent } from "./alarmas.component";

const routes: Routes = [{ path: "", component: AlarmasComponent, data: { breadcrumb: "Alarmas" } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlarmasRoutingModule {}
