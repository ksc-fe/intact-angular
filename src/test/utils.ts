import {IntactAngular as Intact} from '../../lib/intact-angular';
import {Component, NO_ERRORS_SCHEMA, Type} from '@angular/core';
import {async, ComponentFixture, TestBed, ComponentFixtureAutoDetect} from '@angular/core/testing';
import {IntactAngularBrowserModule} from '../../lib/module';

export function createIntactComponent(template, methods?) {
    class Component extends Intact {
        get template() { return template; }
    }
    if (methods) {
        Object.assign(Component.prototype, methods);
    }

    return Component;
}

export function createAppComponent(template) {
    @Component({
        selector: 'app-root',
        template, 
    })
    class AppComponent {};

    return AppComponent;
}

export function createIntactAngularComponent(template, selector, methods?, blocks?) {
    const IntactComponent = createIntactComponent(template, methods);

    return Intact.decorate(IntactComponent, selector, blocks);
}

export function getFixture<T>(components: Array<any>): ComponentFixture<T> {
    TestBed.configureTestingModule({
        declarations: components, 
        providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
        imports: [
            IntactAngularBrowserModule,
        ],
        schemas: [NO_ERRORS_SCHEMA],
    });

    return TestBed.createComponent(components[0]);
}
