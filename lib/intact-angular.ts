import Intact from 'intact/dist/index';
import {
    Component, ElementRef, ViewContainerRef, 
    ChangeDetectorRef, ViewChild, TemplateRef,
    Injector,
} from '@angular/core';
import {Wrapper, BlockWrapper} from './wrapper';
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
    private __blocks__;
    private __parent__;
    private _appendQueue;

    // @ViewChild('container', {read: ViewContainerRef, static: true}) container: ViewContainerRef;

    constructor(
        private elRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private changeDectectorRef: ChangeDetectorRef,
        private injector: Injector,
    ) {
        super();

        // define vNode firstly, then update its props;
        this._initVNode();
    }

    // ngOnInit() {
        // console.log('ngOnInit', this);
    // }

    // ngAfterContentInit() {
        // console.log('ngAfterContentInit', this);
    // }

    // mount(...args) {
        // console.log('mount');
        // super.mount(...args);
    // }

    _constructor(props) {
        if (this._blockConstructor) return;
        super._constructor(props);
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit', this);

        const parent = this.__parent__ =  this._findParentIntactComponent();

        this._initAppendQueue();

        const placeholder = this._placeholder = this.elRef.nativeElement;
        this._normalizeBlocks();
        this._blockConstructor = false;
        const props = this._normalizeProps();
        this._constructor(props);

        const dom = (<any>this).init(null, this.vNode);

        placeholder._realElement = dom;

        this._appendQueue.push(() => {
            placeholder.parentNode.replaceChild(dom, placeholder);
        });

        this._triggerAppendQueue();

        // this.injector.get(this.constructor);

        // for Error: ExpressionChangedAfterItHasBeenCheckedError
        // this.changeDectectorRef.detectChanges();
    }

    ngAfterViewChecked() {
        console.log('ngAfterViewChecked', (<any>this).get('id'));

        const lastVNode = this.vNode;
        this._initVNode();
        this._normalizeProps();
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

        const props = {...intactNode.props, children, _blocks: this.__blocks__};

        this.vNode.props = props;
        const parent = this.__parent__;
        Object.defineProperty(this, 'parentVNode', {
            get() {
                return parent && parent.vNode;
            }
        });
        Object.defineProperty(this.vNode, 'parentVNode', {
            get() {
                return parent && parent.vNode;
            }
        });

        return props;
    }

    _normalizeBlocks() {
        const blocks = (<any>this.constructor).__prop__metadata__;
        const _blocks = this.__blocks__ = {};
        for (let name in blocks) {
            if (blocks[name][0].read !== TemplateRef) continue;

            const ref = this[name];
            if (!ref) continue;

            name = name.substring(BLOCK_NAME_PREFIX.length);
            _blocks[name] = (__nouse__, ...args) => {
                return h(BlockWrapper, {
                    templateRef: ref, 
                    context: args,
                });
            };
        }
    }

    _findParentIntactComponent() {
        let {_view: searchView, _elDef: elDef} = (<any>this.viewContainerRef);
        elDef = elDef.parent;
        while (searchView && elDef) {
            // find the component element
            let componentProvider;
            do {
                componentProvider = elDef.element.componentProvider;
                if (componentProvider) break;
                elDef = elDef.parent;
                if (!elDef) return;
            } while (!componentProvider)
            const nodeIndex = componentProvider.nodeIndex;
            const providerData = searchView.nodes[nodeIndex];
            const instance = providerData.instance;
            if (instance && instance instanceof IntactAngular) {
                return instance; 
            }
            elDef = searchView.parent ? searchView.parentNodeDef.parent : null;
            searchView = searchView.parent;
        }
    }

    _replacePlaceholder(dom) {
        const placeholder = this._placeholder;
        if (placeholder.parentNode) {
            placeholder.parentNode.replaceChild(dom, placeholder);
        } else {
            (<any>this).on('$mounted', () => {
                placeholder.parentNode.replaceChild(dom, placeholder);
            });
        }
    }

    _initVNode() {
        this.vNode = h(this.constructor);
        this.vNode.children = this;
    }

    _initAppendQueue() {
        const parent = this.__parent__;
        if (!this._appendQueue || this._appendQueue.done) {
            if (parent) {
                if (parent._appendQueue) {
                    // it indicates that another child has inited the queue
                    this._appendQueue = parent._appendQueue;
                } else {
                    parent._appendQueue = this._appendQueue = [];
                }
            } else {
                this._appendQueue = [];
            }
        }
    }

    _triggerAppendQueue() {
        if (!this.__parent__) {
            let cb;
            while (cb = this._appendQueue.pop()) {
                cb();
            }
            this._appendQueue.done = true;
        }
    }

    // __initMountedQueue() {

    // }
}
