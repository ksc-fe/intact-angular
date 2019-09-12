import {async, ComponentFixture, TestBed, ComponentFixtureAutoDetect} from '@angular/core/testing';
import {Component, ContentChild, NO_ERRORS_SCHEMA, TemplateRef, ViewChild, ViewContainerRef, ElementRef} from '@angular/core';
import {IntactAngular as Intact} from '../../lib/intact-angular';
import {
    createIntactAngularComponent, createIntactComponent,
    createAppComponent, getFixture, createAngularComponent,
} from './utils';
import {IntactAngularBrowserModule} from '../../lib/module';
import {functionalWrapper} from '../../lib/functional';

const IntactChildrenComponent = createIntactAngularComponent(`<div>{self.get('children')}</div>`, 'k-children');
const AngularChildrenComponent = createAngularComponent(`<div><ng-content></ng-content></div>`, 'app-children');

describe('Unit Tests', () => {
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

    it('should render Intact component in Angular component', () => {
        const AppComponent = createAppComponent(`<app-children><k-children>test</k-children></app-children>`);

        const fixture = getFixture([AppComponent, IntactChildrenComponent, AngularChildrenComponent]) ;
        const element = fixture.nativeElement;

        expect(element.innerHTML).toBe('<app-children><div><div>test</div></div></app-children>');
    });

    it('should render nested Intact component', () => {
        const AppComponent = createAppComponent(`<k-children><k-children>test</k-children></k-children>`);

        const fixture = getFixture([AppComponent, IntactChildrenComponent]) ;
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<div><div>test</div></div>');
    });

    it('should render nested multiple Intact components', () => {
        const AppComponent = createAppComponent(
            `<k-children id="parent">
                <k-children id="child">test1</k-children>
                <k-children id="child">test2</k-children>
            </k-children>`
        );

        const fixture = getFixture([AppComponent, IntactChildrenComponent]) ;
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<div><div>test1</div><div>test2</div></div>');
    });

    it('should render nested Intact component with element', () => {
        const AppComponent = createAppComponent(`<k-children><div><k-children>test</k-children></div></k-children>`);

        const fixture = getFixture([AppComponent, IntactChildrenComponent]) ;
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<div><div><div>test</div></div></div>');
    });

    it('should render nested Intact component and Angular Component', () => {
        const AppComponent = createAppComponent(
            `<app-children>
                <k-children>
                    <app-children>
                        <k-children>test</k-children>
                    </app-children>
                </k-children>
            </app-children>`
        );

        const fixture = getFixture([AppComponent, IntactChildrenComponent, AngularChildrenComponent]) ;
        const element = fixture.nativeElement;

        expect(element.innerHTML).toBe('<app-children><div><div><app-children><div><div>test</div></div></app-children></div></div></app-children>');
    });

    it('should render nested component in template of Angular component', () => {
        const AngularComponet = createAngularComponent(`<k-children><ng-content></ng-content></k-children>`, 'app-component');
        const AppComponent = createAppComponent(
            `<k-children>
                <app-component>test</app-component>
            </k-children>`
        );

        const fixture = getFixture([AppComponent, IntactChildrenComponent, AngularComponet]) ;
        const element = fixture.nativeElement;

        expect(element.innerHTML).toBe("<div><app-component><div>test</div></app-component></div>");
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

    it('should do two way data binding', () => {
        const TestComponent = createIntactAngularComponent(
            `<div ev-click={self.onClick}>click</div>`,
            'k-test',
            {onClick: function() {
                const value = this.get('value') || 0;
                this.set('value', value + 1);
            }}
        );
        const AppComponent = createAppComponent(`<k-test [(value)]="value"></k-test>value: {{ value }}`);

        const fixture = getFixture([AppComponent, TestComponent]);
        const element = fixture.nativeElement;
        element.firstChild.click();
        expect(element.innerHTML).toBe('<div>click</div>value: 1');
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
        expect(element.innerHTML).toBe('<div><intact-content>begin</intact-content><div>children</div><div><intact-content><span>end</span><b>!</b></intact-content></div></div>');

        component.show = false;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div><intact-content>begin</intact-content><div>children</div><div><intact-content><b>!</b></intact-content></div></div>');

        component.show = true;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div><intact-content>begin</intact-content><div>children</div><div><intact-content><span>end</span><b>!</b></intact-content></div></div>');
    });

    it('should render scope blocks', () => {
        const TestComponent = createIntactAngularComponent(
            `<div>
                <div v-for={self.get('data')}>
                    <b:template args={[value]} />
                </div>
            </div>`,
            `k-test`,
            null,
            ['template']
        );

        @Component({
            selector: `app-root`,
            template: `<k-test [data]="data" #test>
                <div>children</div> 
                <ng-template #template let-scope="args[0]">
                    <div>{{scope.name}}</div>
                </ng-template>
            </k-test>`
        })
        class AppComponent {
            @ViewChild('test', {static: true}) test;
            data = [{name: 'aaa'}, {name: 'bbb'}];
        }

        const fixture = getFixture<AppComponent>([AppComponent, TestComponent]);
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe("<div><div><intact-content><div>aaa</div></intact-content></div><div><intact-content><div>bbb</div></intact-content></div></div>");

        const component = fixture.componentInstance;
        component.data[0].name = 'ccc';
        fixture.detectChanges();
        expect(element.innerHTML).toBe("<div><div><intact-content><div>ccc</div></intact-content></div><div><intact-content><div>bbb</div></intact-content></div></div>");

        component.data = [{name: 'ddd'}];
        fixture.detectChanges();
        expect(element.innerHTML).toBe("<div><div><intact-content><div>ddd</div></intact-content></div></div>");

        component.test.set('data', [{name: 'eee'}]);
        expect(element.innerHTML).toBe("<div><div><intact-content><div>eee</div></intact-content></div></div>");
    });

    it('should render Intact functional component', () => {
        const {h, render} = (<any>Intact).Vdt.miss;
        const FunctionalComponent = functionalWrapper(function(props) {
            return h('k-wrapper', null, [
                h(IntactChildrenComponent, props),
                h(IntactChildrenComponent, null, 'two')
            ]);
        }, 'k-functional');
        const AppComponent = createAppComponent(`<k-functional>test</k-functional>`);

        const fixture = getFixture([AppComponent, FunctionalComponent]);
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<k-wrapper><div>test</div><div>two</div></k-wrapper>');
    });

    it('should get parentVNode of nested Intact component', () => {
        const SimpleComponent = createIntactAngularComponent(`<div>test</div>`, 'k-simple', {
            _beforeCreate() {
                const vNode = this.parentVNode.parentVNode;
                expect(vNode).not.toBeUndefined();
                expect(vNode.parentVNode).toBeUndefined();
                expect(vNode.tag === IntactChildrenComponent).toBe(true);
                expect(vNode.children instanceof IntactChildrenComponent).toBeTruthy();
            }
        });
        @Component({
            selector: `app-root`,
            template: `<k-children #parent id="parent"><k-simple #child id="child">test</k-simple></k-children>`
        })
        class AppComponent {
            @ViewChild('parent', {static: true}) parent;
            @ViewChild('child', {static: true}) child;
        }

        const fixture = getFixture([AppComponent, IntactChildrenComponent, SimpleComponent]);
    });

    it('should get parentVNode of nested Intact component with element', () => {
        const SimpleComponent = createIntactAngularComponent(`<div>test</div>`, 'k-simple', {
            _beforeCreate() {
                const vNode = this.parentVNode;
                expect(vNode).not.toBeUndefined();
                expect(vNode.parentVNode).toBeUndefined();
                expect(vNode.tag === IntactChildrenComponent).toBe(true);
                expect(vNode.children instanceof IntactChildrenComponent).toBeTruthy();
            }
        });
        @Component({
            selector: `app-root`,
            template: `<k-children id="parent">
                <header>
                    <k-simple id="child">test</k-simple>
                </header>
            </k-children>`
        })
        class AppComponent {
        }

        const fixture = getFixture([AppComponent, IntactChildrenComponent, SimpleComponent]);
    });

    it('should get parentVNode of nested Intact component with Angular component', () => {
        const SimpleComponent = createIntactAngularComponent(`<div>test</div>`, 'k-simple', {
            _beforeCreate() {
                const vNode = this.parentVNode;
                expect(vNode).not.toBeUndefined();
                expect(vNode.parentVNode).toBeUndefined();
                expect(vNode.tag === IntactChildrenComponent).toBe(true);
                expect(vNode.children instanceof IntactChildrenComponent).toBeTruthy();
            },
        });
        @Component({
            selector: `app-root`,
            template: `<k-children id="parent">
                <app-children>
                    <k-simple id="child">test</k-simple>
                </app-children>
            </k-children>`
        })
        class AppComponent {
        }

        const fixture = getFixture([AppComponent, IntactChildrenComponent, SimpleComponent, AngularChildrenComponent]);
    });

    it('should handle children vNode in Intact template', () => {
        const GroupComponent = createIntactAngularComponent(
            `<ul>
                {self.get('children').map(vNode => {
                    vNode.props.className = 'k-item';
                    return vNode;
                })}
            </ul>`,
            'k-group', 
            {_init() {
                this.Item = ItemComponent;
            }}
        );
        const ItemComponent = createIntactAngularComponent(
            `<li class={self.get('className')}>{self.get('children')}</li>`,
            'k-item',
        );
        @Component({
            selector: 'app-root',
            template: `<k-group>
                <k-item *ngFor="let v of list">{{v}}</k-item>
            </k-group>`
        })
        class AppComponent {
            list = ['1', '2'];
        }

        const fixture = getFixture<AppComponent>([AppComponent, GroupComponent, ItemComponent]);
        const component = fixture.componentInstance;
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<ul><li class="k-item">1</li><li class="k-item">2</li></ul>');

        component.list = ['3', '4'];
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<ul><li class="k-item">3</li><li class="k-item">4</li></ul>');

        component.list[0] = '5';
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<ul><li class="k-item">5</li><li class="k-item">4</li></ul>');
    });
});
