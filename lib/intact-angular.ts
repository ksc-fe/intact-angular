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

    private _allowConstructor: boolean = false;
    private _placeholder;
    private __blocks__;
    private __parent__;
    private _appendQueue;
    private mountedQueue;
    private _shouldTrigger;
    private __oldTriggerFlag;
    private _shouldUpdateProps = false;

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
            this._allowConstructor = true;
            this._constructor(elRef);
        }
    }

    _constructor(props) {
        if (!this._allowConstructor) return;
        super._constructor(props);
    }

    init(lastVNode, nextVNode) {
        if (this._shouldUpdateProps && nextVNode) {
            const props = nextVNode.props;
            Object.assign(this.props, props);
        }
        return super.init(lastVNode, nextVNode);
    }

    ngAfterViewInit() {
        const parent = this.__parent__ =  this._findParentIntactComponent();

        this._initAppendQueue();

        const placeholder = this._placeholder = this.elRef.nativeElement;
        this._normalizeBlocks();
        this._allowConstructor = true;
        const props = this._normalizeProps();
        this._constructor(props);

        this._appendQueue.push(() => {
            if (this.cancelAppendedQueue) return;

            this.__initMountedQueue();

            const dom = (<any>this).init(null, this.vNode);
            this.vNode.dom = dom;
            dom._intactNode = placeholder._intactNode;
            placeholder._realElement = dom;
            placeholder.parentNode.replaceChild(dom, placeholder);

            this.mountedQueue.push(() => (<any>this).mount());

            this.__triggerMountedQueue();
        });
        this._pushUpdateParentVNodeCallback();

        this._triggerAppendQueue();
    }

    ngAfterViewChecked() {
        // we can not ignore the first checked, because it may update block
        if (this.cancelAppendedQueue || !this.vNode.dom) return;

        this._initAppendQueue();

        const lastVNode = this.vNode;
        this._initVNode();
        this._normalizeProps();

        this._appendQueue.push(() => {
            this.__initMountedQueue();

            (<any>this).update(lastVNode, this.vNode);

            this.__triggerMountedQueue();
        });
        this._pushUpdateParentVNodeCallback();

        this._triggerAppendQueue();
    }


    ngOnDestroy() {
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
                const vNode = h(node.instance, null, null, null, dom /* use dom as key */);
                // because we may change props in Intact component
                // we set this flag to update props in `init` method
                node.instance._shouldUpdateProps = true;
                vNode.props = node.instance.vNode.props;
                return vNode;
            }
            // angular can insert dom, so we must keep the key consistent
            // we use the dom as key
            // 
            // we must get the className of the dom
            // because it is useful for Intact component to modify it
            // <intact-content> has not _classNames
            let className = (<any>dom)._classNames;
            if (className) {
                className = Array.from(className).join(' ') || undefined;
            }
            return h(Wrapper, {dom}, null, className, dom);
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

    __initMountedQueue() {
        this.__oldTriggerFlag = this._shouldTrigger;
        this._shouldTrigger = false;
        if (!this.mountedQueue || this.mountedQueue.done) {
            const parent = this.__parent__;
            if (parent) {
                if (parent.mountedQueue && !parent.mountedQueue.done) {
                    this.mountedQueue = parent.mountedQueue;
                    return;
                }
            }
            this._shouldTrigger = true;
            (<any>this)._initMountedQueue();
        }
    }

    __triggerMountedQueue() {
        if (this._shouldTrigger) {
            (<any>this)._triggerMountedQueue();
        }
        this._shouldTrigger = this.__oldTriggerFlag;
    }
}
