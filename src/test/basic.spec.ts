import {async, ComponentFixture, TestBed, ComponentFixtureAutoDetect} from '@angular/core/testing';
import {Component, ContentChild, NO_ERRORS_SCHEMA, TemplateRef} from '@angular/core';
import {IntactAngular as Intact} from '../../lib/intact-angular';
import {createIntactAngularComponent, createIntactComponent, createAppComponent, getFixture} from './utils';
import {IntactAngularBrowserModule} from '../../lib/module';

const IntactChildrenComponent = createIntactAngularComponent(`<div>{self.get('children')}</div>`, 'k-children');

describe('Basic test', () => {
    function expect(input) {
        if (typeof input === 'string') {
            input = input.replace(/<!--[.\s\S]*?-->/g, '');
        }
        return (<any>window).expect(input);
    }

    it('should render children', () => {
        const AppComponent = createAppComponent(`<k-children>test</k-children>`);

        const fixture = getFixture([AppComponent, IntactChildrenComponent]) ;
        const element = fixture.nativeElement;

        expect(element.innerHTML).toBe('<div>test</div>');
    });

    it('should update children', () => {
        @Component({
            selector: 'app-root',
            template: `<k-children>
                <span *ngIf="show">show</span>
                <b>hidden</b>
            </k-children>`,
        })
        class AppComponent {
            show = true;
        }

        const fixture = getFixture<AppComponent>([AppComponent, IntactChildrenComponent]) ;
        const element = fixture.nativeElement;
        const component = fixture.componentInstance;
        expect(element.innerHTML).toBe('<div><span>show</span><b>hidden</b></div>');

        component.show = false;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div><b>hidden</b></div>');
    });

    it('should remove component', () => {
        @Component({
            selector: 'app-root',
            template: `<k-children *ngIf="show">show</k-children>`,
        })
        class AppComponent {
            show = true;
        }

        const fixture = getFixture<AppComponent>([AppComponent, IntactChildrenComponent]) ;
        const element = fixture.nativeElement;
        const component = fixture.componentInstance;
        expect(element.innerHTML).toBe('<div>show</div>');

        component.show = false;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('');

        component.show = true;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div>show</div>');
    });

    it('should render props', () => {
        const TestComponent = createIntactAngularComponent(`<div>{self.get('children')} {self.get('type')}</div>`, 'k-test');
        const AppComponent = createAppComponent(`<k-test type="test">test</k-test>`);

        const fixture = getFixture([AppComponent, TestComponent]);
        const element = fixture.nativeElement;

        expect(element.innerHTML).toBe('<div>test test</div>');
    });

    it('should update props', () => {
        const TestComponent = createIntactAngularComponent(`<div>{self.get('type')}</div>`, 'k-test');
        @Component({
            selector: 'app-root',
            template: `<k-test [type]="type"></k-test>`,
        })
        class AppComponent {
            type = 'primary';
        }

        const fixture = getFixture<AppComponent>([AppComponent, TestComponent]);
        const element = fixture.nativeElement;
        const component = fixture.componentInstance;
        expect(element.innerHTML).toBe('<div>primary</div>');

        component.type = 'danger';
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div>danger</div>');
    });

    it('should bind event', () => {
        const onClick = jasmine.createSpy();
        const TestComponent = createIntactAngularComponent(
            `<div ev-click={self.onClick}>click</div>`,
            `k-test`,
            {onClick: function() {
                this.trigger('click', 'test');
            }}
        );
        @Component({
            selector: 'app-root',
            template: `<k-test (click)="onClick($event)"></k-test>`,
        })
        class AppComponent {
            onClick = onClick; 
        }

        const element = getFixture([AppComponent, TestComponent]).nativeElement;
        element.firstChild.click();
        expect(onClick).toHaveBeenCalled();
        expect(onClick.calls.count()).toEqual(1);
        expect(onClick).toHaveBeenCalledWith('test')
    });

    it('should render blocks', () => {
        const TestComponent = createIntactAngularComponent(
            `<div>
                <b:prefix>prefix</b:prefix>
                {self.get('children')}
                <div><b:suffix/></div>
            </div>`,
            `k-test`,
            null,
            ['prefix', 'suffix']
        );

        @Component({
            selector: `app-root`,
            template: `<k-test>
                <div>children</div> 
                <ng-template #prefix>begin</ng-template>
                <ng-template #suffix>
                    <span *ngIf="show">end</span>
                    <b>!</b>
                </ng-template>
            </k-test>`
        })
        class AppComponent {
            show = true;
        }

        const fixture = getFixture<AppComponent>([AppComponent, TestComponent]);
        const element = fixture.nativeElement;
        const component = fixture.componentInstance;
        expect(element.innerHTML).toBe('<div>begin<div>children</div><div><span>end</span><b>!</b></div></div>');

        component.show = false;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div>begin<div>children</div><div><b>!</b></div></div>');

        component.show = true;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div>begin<div>children</div><div><span>end</span><b>!</b></div></div>');
    });
});
