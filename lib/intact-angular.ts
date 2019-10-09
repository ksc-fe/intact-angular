import Intact from 'intact/dist/index';
import {
    Component, ElementRef, ViewContainerRef, 
    ChangeDetectorRef, ViewChild, TemplateRef,
    Injector, NgZone, ApplicationRef,
} from '@angular/core';
import {Wrapper, BlockWrapper} from './wrapper';
import {IntactNode} from './intact-node';
import {decorate, BLOCK_NAME_PREFIX} from './decorate';
import {getParentIntactInstance} from './helpers';

const {h} = Intact.Vdt.miss;
const {className: intactClassName, isEventProp} = Intact.Vdt.utils;
const {get, set} = Intact.utils;

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
    private __context__;
    private __appendQueueRef: {ref: any, children: any};
    private mountedQueue;
    private _shouldTrigger;
    private __oldTriggerFlag;
    private _shouldUpdateProps = false;
    private __firstCheck = true;
    private _isAngular = false;
    private _hasDestroyedByAngular = false;
    private __updating = false;

    constructor(
        private elRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private injector: Injector,
        private ngZone: NgZone,
        // private applicationRef: ApplicationRef,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        super();

        if (elRef instanceof ElementRef) {
            this._isAngular = true;
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
            // only handle event, maybe we should call patchProps like Intact does,
            // but it is unnecessary for now
            for (let prop in props) {
                const lastValue = this.props[prop];
                const nextValue = props[prop];
                if (lastValue === nextValue) continue;

                if (isEventProp(prop)) {
                    const eventName = prop.substr(3);
                    if (lastValue) {
                        (<any>this).off(eventName, lastValue);
                    }
                    (<any>this).on(eventName, nextValue);
                }

                this.props[prop] = nextValue;
            }
        }
        return super.init(lastVNode, nextVNode);
    }

    update(...args) {
        const updating = this.__updating;
        this.__updating = true;
        const ret = super.update(...args);
        this.__updating = updating;
        return ret;
    }

    ngAfterViewInit() {
        const parent = this.__parent__ =  this._findParentIntactComponent();

        this._initAppendQueue();

        const placeholder = this._placeholder = this.elRef.nativeElement;
        this._normalizeBlocks();
        this._normalizeContext();
        this._allowConstructor = true;
        const props = this._normalizeProps();
        this._constructor(props);

        this.__appendQueueRef.ref.push(() => {
            if (this.cancelAppendedQueue) return;

            this.__updateParentVNode();

            this.ngZone.runOutsideAngular(() => {
                this.__initMountedQueue();

                const dom = (<any>this).init(null, this.vNode);
                this.vNode.dom = dom;
                dom._intactNode = placeholder._intactNode;
                placeholder._realElement = dom;
                placeholder.parentNode.replaceChild(dom, placeholder);

                this.mountedQueue.push(() => (<any>this).mount());
                this.__triggerMountedQueue();
            });
        });

        this._triggerAppendQueue();
    }

    ngAfterViewChecked() {
        // we can not ignore the first checked, because it may update block
        // TODO: we have called detectChanges for first time render block
        // so can we ignore the first check?
        if (this.__firstCheck) return this.__firstCheck = false;
        // if (this.cancelAppendedQueue || !this.vNode.dom) return;
        if (!this.vNode.dom) return;

        this._initAppendQueue();

        const lastVNode = this.vNode;
        this._initVNode();
        this._normalizeProps();

        this.__appendQueueRef.ref.push(() => {
            if (this.cancelAppendedQueue) return;

            this.__updateParentVNode();

            this.ngZone.runOutsideAngular(() => {
                this.__initMountedQueue();
                (<any>this).update(lastVNode, this.vNode);
                this.__triggerMountedQueue();
            });
        });

        this._triggerAppendQueue();
    }

    destroy(lastVNode, nextVNode, parentDom) {
        if (this._isAngular) {
            // maybe the parent that is Angular element has been destroyed by Angular
            if (this._hasDestroyedByAngular) return;

            (<any>this).vdt.destroy();
            (<any>this)._destroy(lastVNode, nextVNode);
            (<any>this).trigger('$destroyed', this);
            // super.destroy(lastVNode, nextVNode, parentDom);
            // we should reset the destroyed flag, because we will reuse this instance
            // (<any>this).destroyed = false;
        } else {
            super.destroy(lastVNode, nextVNode, parentDom);
        }
    }

    ngOnDestroy() {
        this._hasDestroyedByAngular = true;
        super.destroy();
    }

    _normalizeProps() {
        const placeholder = this._placeholder; 
        const intactNode: IntactNode = placeholder._intactNode;
        intactNode.instance = this;

        const children = intactNode.children.map(dom => {
            const node = (<any>dom)._intactNode;
            if (node) {
                node.instance.cancelAppendedQueue = true;
                const vNode = h(node.instance);
                // because we may change props in Intact component
                // we set this flag to update props in `init` method
                node.instance._shouldUpdateProps = true;
                vNode.props = node.instance.vNode.props;
                return vNode;
            } else if (dom.nodeType === 3) {
                // text node use the nodeValue as vNode
                // KPC components library use this for detecting text vNode
                return dom.nodeValue;
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

        const props = {
            key: placeholder,
            ...intactNode.props,
            children,
            _blocks: this.__blocks__,
            _context: this.__context__,
        };

        this.vNode.props = props;
        this.vNode.key = props.key;

        return props;
    }

    _normalizeContext() {
        const context = (<any>this.viewContainerRef)._view.component;
        const ngZone = this.ngZone;
        this.__context__ = {
            data: {
                get(name) {
                    if (name !== null) {
                        return get(context, name); 
                    } else {
                        return context;
                    }
                },
                set(key, value) {
                    ngZone.run(() => {
                        set(context, key, value);
                    });
                }
            }
        }
    }

    _normalizeBlocks() {
        const blocks = (<any>this.constructor).__prop__metadata__;
        const _blocks = this.__blocks__ = {};
        for (let name in blocks) {
            if (blocks[name][0].read !== TemplateRef) continue;

            const ref = this[name];
            if (!ref) continue;

            // detect the ref is the direct child of this component
            const searchView = ref._parentView;
            const renderParent = ref._def.renderParent;
            const instance = getParentIntactInstance(searchView, renderParent, IntactAngular);
            if (instance !== this) return;

            name = name.substring(BLOCK_NAME_PREFIX.length).replace(/_/g, '-');
            _blocks[name] = (__nouse__, ...args) => {
                // check if it is a text node
                const nodes = ref._def.element.template.nodes;
                const isText = nodes.length === 1 && nodes[0].flags === 2;
                return h(BlockWrapper, {
                    templateRef: ref, 
                    context: args,
                    isText,
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
                    const instance = getParentIntactInstance(searchView, elDef, IntactAngular);
                    if (instance) return instance;
                    elDef = elDef.parent;
                    if (!elDef) break;
                }
            }
            elDef = searchView.parent ? searchView.parentNodeDef.parent : null;
            searchView = searchView.parent;
        }
    }

    _initVNode() {
        const oldVNode = this.vNode; 
        this.vNode = h(this.constructor);
        if (oldVNode) {
            this.vNode.key = oldVNode.key;
        }
        this.vNode.children = this;
    }

    _initAppendQueue() {
        const parent = this.__parent__;
        if (!this.__appendQueueRef || this.__appendQueueRef.ref.done) {
            if (parent) {
                if (parent.__appendQueueRef && !parent.__appendQueueRef.ref.done) {
                    // it indicates that another child has inited the queue
                    this.__appendQueueRef = parent.__appendQueueRef;
                } else {
                    parent.__appendQueueRef = this.__appendQueueRef = {ref: [], children: []};
                }
            } else {
                this.__appendQueueRef = {ref: [], children: []};
            }
        } else if (parent) {
            // if parent has queue, we should merge them, then update the ref
            if (parent.__appendQueueRef && !parent.__appendQueueRef.ref.done) {
                const queue = parent.__appendQueueRef.ref;
                queue.push(...this.__appendQueueRef.ref);
                
                this.__appendQueueRef.ref = queue;
                // should also update children's ref
                const loop = (ref) => {
                    const children = ref.children;
                    for (let i = 0; i < children.length; i++) {
                        let ref = children[i];
                        ref.ref = queue;
                        loop(ref);
                    }
                }
                loop(this.__appendQueueRef);

                parent.__appendQueueRef.children.push(this.__appendQueueRef);
            } else {
                // otherwise we should update the parent's queue
                parent.__appendQueueRef = this.__appendQueueRef;
            }
        }
    }

    _triggerAppendQueue() {
        if (!this.__parent__) {
            let cb;
            while (cb = this.__appendQueueRef.ref.pop()) {
                cb();
            }
            this.__appendQueueRef.ref.done = true;
        }
    }

    __updateParentVNode() {
        const parent = this.__parent__;
        this.parentVNode = parent && parent.vNode;
        this.vNode.parentVNode = this.parentVNode;
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
