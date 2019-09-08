import {NgModule} from '@angular/core';
import {BrowserModule, ɵDomRendererFactory2} from '@angular/platform-browser';
import {IntactAngularRendererFactory} from './renderer';
import {DomRendererFactory2} from './renderer2';

@NgModule({
    imports: [BrowserModule],
    exports: [BrowserModule],
    providers: [{provide: ɵDomRendererFactory2, useClass: DomRendererFactory2}],
})
export class IntactAngularBrowserModule {}
