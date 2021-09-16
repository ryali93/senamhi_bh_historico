import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { DatatableComponent } from './datatable/datatable.component';
/* Peticiones */
import {HttpClientModule} from '@angular/common/http';
/* Dattable */
import { DataTablesModule } from "angular-datatables";
import { BasemapComponent } from './basemap/basemap.component';
import { ListComponent } from './list/list.component';
/* Reactive forms */
import { ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LegendComponent } from './legend/legend.component';
//npm install --save @ng-bootstrap/ng-bootstrap

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SidebarComponent,
    HeaderComponent,
    DatatableComponent,
    BasemapComponent,
    ListComponent,
    LegendComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    DataTablesModule,
    ReactiveFormsModule,
    NgbModule/**/
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
