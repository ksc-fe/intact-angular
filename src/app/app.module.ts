import { IntactAngularBrowserModule } from 'intact';
// import { IntactAngularBrowserModule } from '../../dist/index';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KpcModule } from './button';
import { HelloComponent } from './hello/hello.component';

@NgModule({
  declarations: [
    AppComponent, HelloComponent
  ],
  imports: [
    // BrowserModule,
    IntactAngularBrowserModule,
      AppRoutingModule,
      KpcModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule { }
