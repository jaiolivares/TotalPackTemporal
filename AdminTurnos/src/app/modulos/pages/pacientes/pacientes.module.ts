import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientesRoutingModule } from './pacientes-routing.module';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule} from '@angular/material/icon';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from 'src/app/core/pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';


import { PacientesComponent } from './pacientes.component';
import { MedicosComponent } from './components/medicos/medicos.component';
import { PantallasComponent } from './components/pantallas/pantallas.component';
import { ModalEditComponent } from './components/pantallas/modal-edit/modal-edit.component';

@NgModule({
  declarations: [
    PacientesComponent,
    MedicosComponent,
    PantallasComponent,
    ModalEditComponent,
  ],
  imports: [
    CommonModule,
    PacientesRoutingModule,
    MatTabsModule,
    MatIconModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    PipesModule,
    ReactiveFormsModule,
  ]
})
export class PacientesModule { }
