import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { BrowserModule, ɵDomRendererFactory2 } from '@angular/platform-browser';
import { DomRendererFactory2 } from './renderer';
var IntactAngularBrowserModule = /** @class */ (function () {
    function IntactAngularBrowserModule() {
    }
    IntactAngularBrowserModule = tslib_1.__decorate([
        NgModule({
            imports: [BrowserModule],
            exports: [BrowserModule],
            providers: [{ provide: ɵDomRendererFactory2, useClass: DomRendererFactory2 }],
        })
    ], IntactAngularBrowserModule);
    return IntactAngularBrowserModule;
}());
export { IntactAngularBrowserModule };
