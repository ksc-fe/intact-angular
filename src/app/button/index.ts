import Intact from 'intact';
import {Component, ElementRef, ViewContainerRef, ContentChild, TemplateRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import {IntactNode} from '../../../lib/intact-node';
import {Wrapper} from '../../../lib/wrapper';

const {VNode, h} = Intact.Vdt.miss;

@Component({
    selector: 'k-button',
    template: `<ng-content></ng-content><ng-container #container></ng-container>`,
})
export class Button extends Intact {
    @Intact.template()
    static template = `<button class={self.get('type')} ev-click={self._onClick}>
        <b:prefix />
        {self.get('children')}
        disable: {String(self.get('disable'))}
        <b:suffix />
    </button>`;

    private vNode;
    private props;
    private _$block: boolean = true;

    @ContentChild('suffix', {static: false}) suffix: TemplateRef<any>;
    @ContentChild('prefix', {static: false}) prefix: TemplateRef<any>;
    @ViewChild('container', {read: ViewContainerRef, static: true}) container: ViewContainerRef;

    constructor(
        private elRef: ElementRef, 
        private viewContainerRef: ViewContainerRef,
        private changeDectectionRef: ChangeDetectorRef
    ) {
        super();
    }

    _constructor(props) {
        if (this._$block) return;
        super._constructor(props);
    }

    _onClick(e) {
        (<any>this).trigger('click', e);
    }

    ngAfterContentInit() {
        console.log('ngAfterContentInit');
    }

    ngAfterContentChecked() {
        console.log('ngAfterContentChecked');
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit');


        this._normalizeBlocks();
        this._$block = false;
        this._constructor(this._normalizeProps());

        const dom = (<any>this).init(null, this.vNode);
        console.log(this.elRef, dom);
        this.elRef.nativeElement.parentNode.replaceChild(dom, this.elRef.nativeElement);
        
        // for Error: ExpressionChangedAfterItHasBeenCheckedError
        this.changeDectectionRef.detectChanges();
    }

    ngAfterViewChecked() {
        console.log('ngAfterViewChecked');

        const lastVNode = this.vNode;
        const props = this._normalizeProps();
        (<any>this).update(lastVNode, this.vNode);
    }

    ngOnInit() {
        console.log('ngOnInit');
    }

    ngOnDestroy() {
        (<any>this).destroy();
    }

    _normalizeProps() {
        const placeholder = this.elRef.nativeElement;
        const intactNode: IntactNode = placeholder._intactNode;
        const children = [];
        intactNode.children.forEach(dom => {
            children.push(h(Wrapper, {dom}));
        });

        const blocks = {};
        for (let key in intactNode.blocks) {
            const vNodes = intactNode.blocks[key].map(dom => {
                return h(Wrapper, {dom});
            });
            blocks[key] = () => vNodes;
        }

        const props = {...intactNode.props, children, _blocks: blocks};

        this.vNode = h(this.constructor, props);
        this.vNode.children = this;

        return props;
    }

    _normalizeBlocks() {
        const placeholder = this.elRef.nativeElement;
        const intactNode: IntactNode = placeholder._intactNode;
        const renderElement = this.container.element.nativeElement;
        renderElement._intactNode = intactNode;
        ['prefix', 'suffix'].forEach(name => {
            const viewRef = this[name].createEmbeddedView(null);
            renderElement._block = name;
            intactNode.blocks[name] = [];
            this.container.insert(viewRef, 0);
        });
    }
}
