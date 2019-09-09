import { IntactAngularBrowserModule } from '../../lib/module';
// import { IntactAngularBrowserModule } from '../../dist/index';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Button } from './button';
import { HelloComponent } from './hello/hello.component';

@NgModule({
  declarations: [
    AppComponent, Button, HelloComponent
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
