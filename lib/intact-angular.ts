import Intact from 'intact/dist/index';
import {
    Component, ElementRef, ViewContainerRef, 
    ChangeDetectorRef, ViewChild, TemplateRef,
} from '@angular/core';
import {Wrapper} from './wrapper';
import {IntactNode} from './intact-node';
import {decorate, BLOCK_NAME_PREFIX} from './decorate';

const {h} = Intact.Vdt.miss;

@Component({})
export class IntactAngular extends Intact {
    static decorate = decorate;

    private vNode;
    private props;
    private _blockConstructor: boolean = true;
    private _placeholder;

    @ViewChild('container', {read: ViewContainerRef, static: true}) container: ViewContainerRef;

    constructor(
        private elRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private changeDectectorRef: ChangeDetectorRef,
    ) {
        super();
    }

    _constructor(props) {
        if (this._blockConstructor) return;
        super._constructor(props);
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit');

        const placeholder = this._placeholder = this.elRef.nativeElement;
        this._normalizeBlocks();
        this._blockConstructor = false;
        this._constructor(this._normalizeProps());

        const dom = (<any>this).init(null, this.vNode);
        placeholder.parentNode.replaceChild(dom, placeholder);
        placeholder._realElement = dom;
        
        // for Error: ExpressionChangedAfterItHasBeenCheckedError
        this.changeDectectorRef.detectChanges();
    }

    ngAfterViewChecked() {
        console.log('ngAfterViewChecked');

        const lastVNode = this.vNode;
        const props = this._normalizeProps();
        (<any>this).update(lastVNode, this.vNode);
    }


    ngOnDestroy() {
        console.log('ngOnDestroy');

        (<any>this).destroy();
    }

    _normalizeProps() {
        const placeholder = this._placeholder; 
        const intactNode: IntactNode = placeholder._intactNode;
        const children = intactNode.children.map(dom => {
            return h(Wrapper, {dom});
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
        const placeholder = this._placeholder; 
        const intactNode: IntactNode = placeholder._intactNode;
        const blocks = (<any>this.constructor).__prop__metadata__;
        for (let name in blocks) {
            if (blocks[name][0].read !== TemplateRef) continue;

            const ref = this[name];
            if (!ref) continue;

            name = name.substring(BLOCK_NAME_PREFIX.length);
            const viewRef = ref.createEmbeddedView(null);
            placeholder._block = name;
            intactNode.blocks[name] = [];
            this.container.insert(viewRef, 0);
            placeholder._block = null;
        }
    }
}
