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
const {className: intactClassName} = Intact.Vdt.utils;

@Component({})
export class IntactAngular extends Intact {
    static decorate = decorate;

    public vNode;
    public props;
    public parentVNode;
    public cancelAppendedQueue: boolean = false;

    private _blockConstructor: boolean = true;
    private _placeholder;
    private __blocks__;
    private __parent__;
    private _appendQueue;

    constructor(
        private elRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private injector: Injector,
    ) {
        super();

        if (elRef instanceof ElementRef) {
            // is called in Angular
            // define vNode firstly, then update its props;
            this._initVNode();
        } else {
            // is called in Intact
            this._blockConstructor = false;
            this._constructor(elRef);
        }
    }

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

        this._appendQueue.push(() => {
            if (this.cancelAppendedQueue) return;

            const dom = (<any>this).init(null, this.vNode);
            this.vNode.dom = dom;
            dom._intactNode = placeholder._intactNode;
            placeholder._realElement = dom;
            placeholder.parentNode.replaceChild(dom, placeholder);
        });
        this._pushUpdateParentVNodeCallback();

        this._triggerAppendQueue();
    }

    ngAfterViewChecked() {
        if (this.cancelAppendedQueue || !this.vNode.dom) return;
        console.log('ngAfterViewChecked', this);

        this._initAppendQueue();

        const lastVNode = this.vNode;
        this._initVNode();
        this._normalizeProps();

        (<any>this).update(lastVNode, this.vNode);

        this._pushUpdateParentVNodeCallback();
        this._triggerAppendQueue();
    }


    ngOnDestroy() {
        console.log('ngOnDestroy', this);
        if (this.cancelAppendedQueue) return;

        (<any>this).destroy();
    }

    _normalizeProps() {
        const placeholder = this._placeholder; 
        const intactNode: IntactNode = placeholder._intactNode;
        intactNode.instance = this;
        const children = intactNode.children.map(dom => {
            const node = (<any>dom)._intactNode;
            if (node) {
                node.instance.cancelAppendedQueue = true;
                return h(node.instance, null, null, null, dom);
            }
            // angular can insert dom, so we must keep the key consistent
            // we use the dom as key
            return h(Wrapper, {dom}, null, null, dom);
        });

        // normalize className
        if (intactNode.className) {
            (<any>intactNode.props).className = intactClassName(intactNode.className);    
        }
        // normalize style
        if (intactNode.style) {
            (<any>intactNode.props).style = intactNode.style.style.cssText;
        }

        const props = {...intactNode.props, children, _blocks: this.__blocks__};

        this.vNode.props = props;

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
        while (searchView) {
            if (elDef) {
                // find the component element
                while (true) {
                    const componentProvider = elDef.element.componentProvider;
                    if (componentProvider) {
                        const nodeIndex = componentProvider.nodeIndex;
                        const providerData = searchView.nodes[nodeIndex];
                        const instance = providerData.instance;
                        if (instance && instance instanceof IntactAngular) {
                            return instance; 
                        }
                    }
                    elDef = elDef.parent;
                    if (!elDef) return;
                }
            }
            elDef = searchView.parent ? searchView.parentNodeDef.parent : null;
            searchView = searchView.parent;
        }
    }

    _initVNode() {
        this.vNode = h(this.constructor);
        this.vNode.children = this;
    }

    _initAppendQueue() {
        if (!this._appendQueue || this._appendQueue.done) {
            const parent = this.__parent__;
            if (parent) {
                if (parent._appendQueue && !parent._appendQueue.done) {
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

    _pushUpdateParentVNodeCallback() {
        this._appendQueue.push(() => {
            const parent = this.__parent__;
            this.parentVNode = parent && parent.vNode;
            this.vNode.parentVNode = this.parentVNode;
        });
    }
}
