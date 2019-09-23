import {async, ComponentFixture, TestBed, ComponentFixtureAutoDetect} from '@angular/core/testing';
import {
    Component, ContentChild, NO_ERRORS_SCHEMA, TemplateRef,
    ViewChild, ViewContainerRef, ElementRef, Input
} from '@angular/core';
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

    it('should render cloned child', () => {
        const ChildrenComponent = createIntactAngularComponent(
            `<div>{self.get('children')}{self.get('children').map(vNode => {
                return _Vdt.miss.clone(vNode);
            })}</div>`,
            `k-children`
        );
        const ChildComponent = createIntactAngularComponent(
            `<div><b:template /></div>`,
            `k-child`,
            null,
            ['template']
        );

        @Component({
            selector: 'app-root',
            template: `<k-children>
                <k-child>
                    <ng-template #template>
                        <span *ngIf="show">show</span>
                        <b>hidden</b>
                    </ng-template>
                </k-child>
            </k-children>`,
        })
        class AppComponent {
            show = true;
        }

        const fixture = getFixture<AppComponent>([AppComponent, ChildrenComponent, ChildComponent]) ;
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<div><div><intact-content><span>show</span><b>hidden</b></intact-content></div><div><intact-content><span>show</span><b>hidden</b></intact-content></div></div>');

        const component = fixture.componentInstance;
        component.show = false;
        fixture.detectChanges();
        expect(element.innerHTML).toBe("<div><div><intact-content><b>hidden</b></intact-content></div><div><intact-content><b>hidden</b></intact-content></div></div>");
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

    it('should update children which are nested Intact component', () => {
        @Component({
            selector: 'app-root',
            template: `<k-children>
                <k-children>
                    <span *ngIf="show">show</span>
                    <b>hidden</b>
                </k-children>
            </k-children>`,
        })
        class AppComponent {
            show = true;
        }

        const fixture = getFixture<AppComponent>([AppComponent, IntactChildrenComponent]) ;
        const element = fixture.nativeElement;
        const component = fixture.componentInstance;
        expect(element.innerHTML).toBe("<div><div><span>show</span><b>hidden</b></div></div>");

        component.show = false;
        fixture.detectChanges();
        expect(element.innerHTML).toBe("<div><div><b>hidden</b></div></div>");

        component.show = true;
        fixture.detectChanges();
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

    it('should bind $change event', () => {
        const onClick = jasmine.createSpy();
        const TestComponent = createIntactAngularComponent(
            `<div ev-click={self.onClick}>click</div>`,
            `k-test`,
            {onClick: function() {
                this.set('count', this.get('count', 0) + 1);
            }}
        );
        @Component({
            selector: 'app-root',
            template: `<k-test ($change-count)="onClick($event)"></k-test>`,
        })
        class AppComponent {
            onClick = onClick; 
        }

        const element = getFixture([AppComponent, TestComponent]).nativeElement;
        element.firstChild.click();
        expect(onClick).toHaveBeenCalled();
        expect(onClick.calls.count()).toEqual(1);
        expect(onClick).toHaveBeenCalledWith(1);
    });

    it('should render basic blocks', () => {
        const TestComponent = createIntactAngularComponent(
            `<div>
                <b:prefix>prefix</b:prefix>
                {self.get('children')}
                <div><b:suffix/></div>
                <b:a-b>a-b</b:a-b>
            </div>`,
            `k-test`,
            null,
            ['prefix', 'suffix', 'a-b']
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
                <ng-template #a_b></ng-template>
            </k-test>`
        })
        class AppComponent {
            show = true;
        }

        const fixture = getFixture<AppComponent>([AppComponent, TestComponent]);
        const element = fixture.nativeElement;
        const component = fixture.componentInstance;
        expect(element.innerHTML).toBe('<div><intact-content>begin</intact-content><div>children</div><div><intact-content><span>end</span><b>!</b></intact-content></div><intact-content></intact-content></div>');

        component.show = false;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div><intact-content>begin</intact-content><div>children</div><div><intact-content><b>!</b></intact-content></div><intact-content></intact-content></div>');

        component.show = true;
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div><intact-content>begin</intact-content><div>children</div><div><intact-content><span>end</span><b>!</b></intact-content></div><intact-content></intact-content></div>');
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
        const {h} = (<any>Intact).Vdt.miss;
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

    it('should render blocks in Intact functional component', () => {
        const {h} = (<any>Intact).Vdt.miss;
        const Component = createIntactComponent(`<div><b:test /></div>`);
        const functional = function(props) {
            return h(Component, props);
        };
        functional.blocks = ['test'];
        const FunctionalComponent = Intact.decorate(functional, 'k-functional');
        const AppComponent = createAppComponent(
            `<k-functional>
                <ng-template #test>
                    <span>test</span>
                </ng-template>
            </k-functional>`
        );

        const fixture = getFixture([AppComponent, FunctionalComponent]);
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<div><intact-content><span>test</span></intact-content></div>');
    });

    it('should get contenxt in Intact functional component', () => {
        const {h} = (<any>Intact).Vdt.miss;
        const FunctionalComponent = functionalWrapper(function(props) {
            const data = props._context.data;
            const number = data.get('number');
            return h('div', {'ev-click': () => {
                data.set('number', number + 1);
            }}, number);
        }, 'k-functional');

        @Component({
            selector: 'app-root',
            template: `
                <k-functional></k-functional>
                <div>
                    <k-functional></k-functional>
                </div>
            `,
        })
        class AppComponent {
            number = 1;
        }

        const fixture = getFixture([AppComponent, FunctionalComponent]);
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<div>1</div><div><div>1</div></div>');

        element.firstChild.click();
        expect(element.innerHTML).toBe('<div>2</div><div><div>2</div></div>');
    });

    it('should render class and style', () => {
        const TestComponent = createIntactAngularComponent(
            `<div class={self.get('className')} style={self.get('style')}>test</div>`,
            `k-test`
        );
        const AppComponent = createAppComponent(
            `<k-test 
                class="a" [ngClass]="{b: true, c: false}" [class.d]="true"
                style="color: red;" [ngStyle]="{'font-size': '12px'}" [style.display]="'block'"
            ></k-test>
            <k-test class="a" style="color: red;"></k-test>`
        );

        const fixture = getFixture([AppComponent, TestComponent]);
        const element = fixture.nativeElement;
        expect(element.innerHTML).toBe('<div class="a b d" style="color: red; font-size: 12px; display: block;">test</div><div class="a" style="color: red;">test</div>');
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

    it('should get parentVNode of nested Intact component with ng-container', () => {
        const SimpleComponent = createIntactAngularComponent(`<div>test</div>`, 'k-simple', {
            _beforeCreate() {
                const vNode = this.parentVNode.parentVNode;
                expect(vNode).not.toBeUndefined();
                expect(vNode.parentVNode).toBeUndefined();
                expect(vNode.tag === IntactChildrenComponent).toBe(true);
                expect(vNode.children instanceof IntactChildrenComponent).toBeTruthy();
            },
        });
        @Component({
            selector: `app-root`,
            template: `<k-children id="parent">
                <ng-container *ngFor="let item of [1, 2]">
                    <k-simple id="child">test</k-simple>
                </ng-container>
            </k-children>`
        })
        class AppComponent {
        }

        const fixture = getFixture([AppComponent, IntactChildrenComponent, SimpleComponent]);
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

    it('should call lifecycle methods of Angular component correctly', () => {
        const ngOnInit = jasmine.createSpy();
        const ngOnDestroy = jasmine.createSpy();
        const ngAfterViewChecked = jasmine.createSpy();
        @Component({
            selector: 'app-angular',
            template: `<div>{{a}}</div>`
        })
        class AngularComponet {
            @Input() a: Number;
            ngOnInit() { ngOnInit() }
            ngAfterViewChecked() { ngAfterViewChecked() }
            ngOnDestroy() { ngOnDestroy() }
        }

        const beforeCreate = jasmine.createSpy();
        const mount = jasmine.createSpy();
        const update = jasmine.createSpy();
        const destroy = jasmine.createSpy();
        const IntactComponent = createIntactAngularComponent(
            `<div>{self.get('children')}</div>`,
            `k-children`,
            {
                _beforeCreate: beforeCreate,
                _mount() {
                    expect(this.element.parentNode.tagName).toBe('DIV');
                    expect(this.element.outerHTML).toBe('<div><app-angular ng-reflect-a="1"><div>1</div></app-angular><div>1</div></div>');
                    mount();
                },
                _update: update,
                _destroy: destroy,
            }
        );

        const methods = {
            _beforeCreate: jasmine.createSpy(),
        };
        const Wrapper = createIntactComponent(`<div>{self.get('children')}</div>`, methods);
        const ItemComponent = createIntactAngularComponent(
            `<Wrapper>{self.get('a')}</Wrapper>`,
            `k-item`,
            {
                _init() {
                    this.Wrapper = Wrapper;
                }
            }
        );

        @Component({
            selector: 'app-root',
            template: `
                <k-children *ngIf="show">
                    <app-angular [a]="a"></app-angular>
                    <k-item [(a)]="a" #ref></k-item>
                </k-children>
            `,
        })
        class AppComponent {
            show = true;
            a = 1;
            @ViewChild('ref', {static: false}) ref;
        }

        const fixture = getFixture<AppComponent>([AppComponent, AngularComponet, IntactComponent, ItemComponent]);
        expect(ngOnInit.calls.count()).toEqual(1);
        expect(ngAfterViewChecked.calls.count()).toEqual(1);
        expect(ngOnDestroy.calls.count()).toEqual(0);
        expect(beforeCreate.calls.count()).toEqual(1);
        expect(mount.calls.count()).toEqual(1);
        expect(update.calls.count()).toEqual(1);
        expect(destroy.calls.count()).toEqual(0);
        // ItemComponent
        expect(methods._beforeCreate.calls.count()).toEqual(1);

        // update
        const component = fixture.componentInstance;
        component.a = 2;
        fixture.detectChanges();
        expect(ngOnInit.calls.count()).toEqual(1);
        expect(ngAfterViewChecked.calls.count()).toEqual(3);
        expect(ngOnDestroy.calls.count()).toEqual(0);
        expect(beforeCreate.calls.count()).toEqual(1);
        expect(mount.calls.count()).toEqual(1);
        expect(update.calls.count()).toEqual(3);
        expect(destroy.calls.count()).toEqual(0);
        // ItemComponent
        expect(methods._beforeCreate.calls.count()).toEqual(1);
        component.ref.set('a', 3);
        expect(methods._beforeCreate.calls.count()).toEqual(1);

        // destroy
        component.show = false;
        fixture.detectChanges();
        expect(ngOnInit.calls.count()).toEqual(1);
        expect(ngAfterViewChecked.calls.count()).toEqual(3);
        expect(ngOnDestroy.calls.count()).toEqual(1);
        expect(beforeCreate.calls.count()).toEqual(1);
        expect(mount.calls.count()).toEqual(1);
        expect(update.calls.count()).toEqual(3);
        expect(destroy.calls.count()).toEqual(1);
    });

    it('should update children\'s props when Intact component has changed them', () => {
        const onClick = jasmine.createSpy();
        // const onClick = function() { console.log('click') }
        const {clone} = (<any>Intact).Vdt.miss;
        const TestComponent = createIntactAngularComponent(
            `<div>{self.get('children')}</div>`,
            `k-test`,
            {
                _init() {
                    this.on('$receive:children', this._changeProps);
                },

                _changeProps() {
                    const children = clone(this.get('children.0'));
                    const props = {...children.props};
                    props['ev-click'] = onClick.bind(this);
                    props.className = children.className + ' test';
                    children.props = props;
                    this.set('children.0', children, {silent: true});
                },

                _removeClass() {
                    const children = clone(this.get('children.0'));
                    const props = {...children.props};
                    props.className = '';
                    children.props = props;
                    this.set('children.0', children, {silent: true});
                },

                _removeEvent() {
                    const children = clone(this.get('children.0'));
                    const props = {...children.props};
                    props['ev-click'] = null;
                    children.props = props;
                    this.set('children.0', children, {silent: true});
                }
            }
        );
        @Component({
            selector: 'app-root',
            template: `<k-test #test><div class="a" [ngClass]="{b: true}">click</div></k-test>`
        })
        class AppComponent {
            @ViewChild('test', {static: true, read: TestComponent}) test;
        }

        const fixture = getFixture<AppComponent>([AppComponent, TestComponent]);
        const element = fixture.nativeElement;

        const div = element.firstChild.firstChild;
        expect(div.className).toBe('a b test');

        div.click();
        expect(onClick.calls.count()).toEqual(1);

        const component = fixture.componentInstance;
        component.test._removeClass();
        component.test.update();
        expect(div.className).toBe('');

        div.click();
        expect(onClick.calls.count()).toEqual(2);

        component.test._removeEvent();
        component.test.update();
        div.click();
        expect(onClick.calls.count()).toEqual(2);
    });

    it('should destroy Angular component', () => {
        const TestComponent = createIntactAngularComponent(
            `<div v-if={!self.get('hidden')}>{self.get('children')}</div>`,
            `k-test`
        );
        @Component({
            selector: 'app-test',
            template: `<div>test</div>`,
        })
        class AppTestComponent {
            ngOnInit() {
                console.log('ngOnInit');
            }
            ngOnDestroy() {
                console.log('destroy');
            }
        } 
        @Component({
            selector: 'app-root',
            template: `<k-test [hidden]="hidden"><app-test></app-test></k-test>`
        })
        class AppComponent {
            hidden = false;
            hide() {
                this.hidden = true;
            }
            show() {
                this.hidden = false;
            }
        }

        const fixture = getFixture<AppComponent>([AppComponent, AppTestComponent, TestComponent]);
        const component = fixture.componentInstance;
        const element = fixture.nativeElement;

        component.hide();
        fixture.detectChanges();
        expect(element.innerHTML).toBe('');
        
        component.show();
        fixture.detectChanges();
        expect(element.innerHTML).toBe('<div><app-test><div>test</div></app-test></div>');
    });
});
