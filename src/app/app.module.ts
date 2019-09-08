// import { BrowserModule } from '@angular/platform-browser';
import { IntactAngularBrowserModule } from '../../lib/module';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Button } from './button';

@NgModule({
  declarations: [
    AppComponent, Button
  ],
  imports: [
    // BrowserModule,
    IntactAngularBrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule { }
