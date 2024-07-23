import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UserIdleModule } from "angular-user-idle";
import { DatePipe } from "@angular/common";
//modules
import { AppRoutingModule } from "./app-routing.module";
import { SharedModule } from "./modules/shared/shared.module";
//components
import { AppComponent } from "./app.component";
import { DniComponent } from "./modules/dni/dni.component";
import { EmitterComponent } from "./modules/emitter/emitter.component";
import { SeriesComponent } from "./modules/series/series.component";
import { TicketComponent } from "./modules/ticket/ticket.component";
import { InformativeTicketComponent } from "./modules/informative-ticket/informative-ticket.component";

@NgModule({
  declarations: [AppComponent,
    EmitterComponent,
    DniComponent,
    SeriesComponent,
    TicketComponent,
    InformativeTicketComponent],
  imports: [BrowserModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    UserIdleModule.forRoot({ idle: 10, timeout: 1 })],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
