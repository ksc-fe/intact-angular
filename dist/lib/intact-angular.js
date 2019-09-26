import * as tslib_1 from "tslib";
import Intact from 'intact/dist/index';
import { Component, ElementRef, ViewContainerRef, TemplateRef, Injector, NgZone, } from '@angular/core';
import { Wrapper, BlockWrapper } from './wrapper';
import { decorate, BLOCK_NAME_PREFIX } from './decorate';
import { getParentIntactInstance } from './helpers';
var h = Intact.Vdt.miss.h;
var intactClassName = Intact.Vdt.utils.className;
var _a = Intact.utils, get = _a.get, set = _a.set;
var IntactAngular = /** @class */ (function (_super) {
    tslib_1.__extends(IntactAngular, _super);
    function IntactAngular(elRef, viewContainerRef, injector, ngZone) {
        var _this = _super.call(this) || this;
        _this.elRef = elRef;
        _this.viewContainerRef = viewContainerRef;
        _this.injector = injector;
        _this.ngZone = ngZone;
        _this.cancelAppendedQueue = false;
        _this._allowConstructor = false;
        _this._shouldUpdateProps = false;
        _this.__firstCheck = true;
        _this._isAngular = false;
        _this._hasDestroyedByAngular = false;
        if (elRef instanceof ElementRef) {
            _this._isAngular = true;
            // is called in Angular
            // define vNode firstly, then update its props;
            _this._initVNode();
        }
        else {
            // is called in Intact
            _this._allowConstructor = true;
            _this._constructor(elRef);
        }
        return _this;
    }
    IntactAngular_1 = IntactAngular;
    IntactAngular.prototype._constructor = function (props) {
        if (!this._allowConstructor)
            return;
        _super.prototype._constructor.call(this, props);
    };
    IntactAngular.prototype.init = function (lastVNode, nextVNode) {
        if (this._shouldUpdateProps && nextVNode) {
            var props = nextVNode.props;
            Object.assign(this.props, props);
        }
        return _super.prototype.init.call(this, lastVNode, nextVNode);
    };
    IntactAngular.prototype.ngAfterViewInit = function () {
        var _this = this;
        var parent = this.__parent__ = this._findParentIntactComponent();
        this._initAppendQueue();
        var placeholder = this._placeholder = this.elRef.nativeElement;
        this._normalizeBlocks();
        this._normalizeContext();
        this._allowConstructor = true;
        var props = this._normalizeProps();
        this._constructor(props);
        this.__appendQueueRef.ref.push(function () {
            if (_this.cancelAppendedQueue)
                return;
            _this.__updateParentVNode();
            _this.ngZone.runOutsideAngular(function () {
                _this.__initMountedQueue();
                var dom = _this.init(null, _this.vNode);
                _this.vNode.dom = dom;
                dom._intactNode = placeholder._intactNode;
                placeholder._realElement = dom;
                placeholder.parentNode.replaceChild(dom, placeholder);
                _this.mountedQueue.push(function () { return _this.mount(); });
                _this.__triggerMountedQueue();
            });
        });
        this._triggerAppendQueue();
    };
    IntactAngular.prototype.ngAfterViewChecked = function () {
        var _this = this;
        // we can not ignore the first checked, because it may update block
        // TODO: we have called detectChanges for first time render block
        // so can we ignore the first check?
        if (this.__firstCheck)
            return this.__firstCheck = false;
        // if (this.cancelAppendedQueue || !this.vNode.dom) return;
        if (!this.vNode.dom)
            return;
        this._initAppendQueue();
        var lastVNode = this.vNode;
        this._initVNode();
        this._normalizeProps();
        this.__appendQueueRef.ref.push(function () {
            if (_this.cancelAppendedQueue)
                return;
            _this.__updateParentVNode();
            _this.ngZone.runOutsideAngular(function () {
                _this.__initMountedQueue();
                _this.update(lastVNode, _this.vNode);
                _this.__triggerMountedQueue();
            });
        });
        this._triggerAppendQueue();
    };
    IntactAngular.prototype.destroy = function (lastVNode, nextVNode, parentDom) {
        if (this._isAngular) {
            // maybe the parent that is Angular element has been destroyed by Angular
            if (this._hasDestroyedByAngular)
                return;
            _super.prototype.destroy.call(this, lastVNode, nextVNode, parentDom);
            // we should reset the destroyed flag, because we will reuse this instance
            this.destroyed = false;
        }
        else {
            _super.prototype.destroy.call(this, lastVNode, nextVNode, parentDom);
        }
    };
    IntactAngular.prototype.ngOnDestroy = function () {
        this._hasDestroyedByAngular = true;
        _super.prototype.destroy.call(this);
    };
    IntactAngular.prototype._normalizeProps = function () {
        var placeholder = this._placeholder;
        var intactNode = placeholder._intactNode;
        intactNode.instance = this;
        var children = intactNode.children.map(function (dom) {
            var node = dom._intactNode;
            if (node) {
                node.instance.cancelAppendedQueue = true;
                var vNode = h(node.instance, null, null, null, dom /* use dom as key */);
                // because we may change props in Intact component
                // we set this flag to update props in `init` method
                node.instance._shouldUpdateProps = true;
                vNode.props = node.instance.vNode.props;
                return vNode;
            }
            else if (dom.nodeType === 3) {
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
            var className = dom._classNames;
            if (className) {
                className = Array.from(className).join(' ') || undefined;
            }
            return h(Wrapper, { dom: dom }, null, className, dom);
        });
        // normalize className
        if (intactNode.className) {
            intactNode.props.className = intactClassName(intactNode.className);
        }
        // normalize style
        if (intactNode.style) {
            intactNode.props.style = intactNode.style.style.cssText;
        }
        var props = tslib_1.__assign({}, intactNode.props, { children: children, _blocks: this.__blocks__, _context: this.__context__, key: placeholder });
        this.vNode.props = props;
        return props;
    };
    IntactAngular.prototype._normalizeContext = function () {
        var context = this.viewContainerRef._view.component;
        var ngZone = this.ngZone;
        this.__context__ = {
            data: {
                get: function (name) {
                    if (name !== null) {
                        return get(context, name);
                    }
                    else {
                        return context;
                    }
                },
                set: function (key, value) {
                    ngZone.run(function () {
                        set(context, key, value);
                    });
                }
            }
        };
    };
    IntactAngular.prototype._normalizeBlocks = function () {
        var blocks = this.constructor.__prop__metadata__;
        var _blocks = this.__blocks__ = {};
        var _loop_1 = function (name_1) {
            if (blocks[name_1][0].read !== TemplateRef)
                return "continue";
            var ref = this_1[name_1];
            if (!ref)
                return "continue";
            // detect the ref is the direct child of this component
            var searchView = ref._parentView;
            var renderParent = ref._def.renderParent;
            var instance = getParentIntactInstance(searchView, renderParent, IntactAngular_1);
            if (instance !== this_1)
                return { value: void 0 };
            name_1 = name_1.substring(BLOCK_NAME_PREFIX.length).replace(/_/g, '-');
            _blocks[name_1] = function (__nouse__) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return h(BlockWrapper, {
                    templateRef: ref,
                    context: args,
                });
            };
        };
        var this_1 = this;
        for (var name_1 in blocks) {
            var state_1 = _loop_1(name_1);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    IntactAngular.prototype._findParentIntactComponent = function () {
        var _a = this.viewContainerRef, searchView = _a._view, elDef = _a._elDef;
        elDef = elDef.parent;
        while (searchView) {
            if (elDef) {
                // find the component element
                while (true) {
                    var instance = getParentIntactInstance(searchView, elDef, IntactAngular_1);
                    if (instance)
                        return instance;
                    elDef = elDef.parent;
                    if (!elDef)
                        break;
                }
            }
            elDef = searchView.parent ? searchView.parentNodeDef.parent : null;
            searchView = searchView.parent;
        }
    };
    IntactAngular.prototype._initVNode = function () {
        var oldVNode = this.vNode;
        this.vNode = h(this.constructor);
        if (oldVNode) {
            this.vNode.key = oldVNode.key;
        }
        this.vNode.children = this;
    };
    IntactAngular.prototype._initAppendQueue = function () {
        var parent = this.__parent__;
        if (!this.__appendQueueRef || this.__appendQueueRef.ref.done) {
            if (parent) {
                if (parent.__appendQueueRef && !parent.__appendQueueRef.ref.done) {
                    // it indicates that another child has inited the queue
                    this.__appendQueueRef = parent.__appendQueueRef;
                }
                else {
                    parent.__appendQueueRef = this.__appendQueueRef = { ref: [] };
                }
            }
            else {
                this.__appendQueueRef = { ref: [] };
            }
        }
        else if (parent) {
            // if parent has queue, we should merge them, then update the ref
            if (parent.__appendQueueRef && !parent.__appendQueueRef.ref.done) {
                var queue = parent.__appendQueueRef.ref;
                queue.push.apply(queue, tslib_1.__spread(this.__appendQueueRef.ref));
                this.__appendQueueRef.ref = queue;
            }
            else {
                // otherwise we should update the parent's queue
                parent.__appendQueueRef = this.__appendQueueRef;
            }
        }
    };
    IntactAngular.prototype._triggerAppendQueue = function () {
        if (!this.__parent__) {
            var cb = void 0;
            while (cb = this.__appendQueueRef.ref.pop()) {
                cb();
            }
            this.__appendQueueRef.ref.done = true;
        }
    };
    IntactAngular.prototype.__updateParentVNode = function () {
        var parent = this.__parent__;
        this.parentVNode = parent && parent.vNode;
        this.vNode.parentVNode = this.parentVNode;
    };
    IntactAngular.prototype.__initMountedQueue = function () {
        this.__oldTriggerFlag = this._shouldTrigger;
        this._shouldTrigger = false;
        if (!this.mountedQueue || this.mountedQueue.done) {
            var parent_1 = this.__parent__;
            if (parent_1) {
                if (parent_1.mountedQueue && !parent_1.mountedQueue.done) {
                    this.mountedQueue = parent_1.mountedQueue;
                    return;
                }
            }
            this._shouldTrigger = true;
            this._initMountedQueue();
        }
    };
    IntactAngular.prototype.__triggerMountedQueue = function () {
        if (this._shouldTrigger) {
            this._triggerMountedQueue();
        }
        this._shouldTrigger = this.__oldTriggerFlag;
    };
    var IntactAngular_1;
    IntactAngular.decorate = decorate;
    IntactAngular = IntactAngular_1 = tslib_1.__decorate([
        Component({}),
        tslib_1.__metadata("design:paramtypes", [ElementRef,
            ViewContainerRef,
            Injector,
            NgZone])
    ], IntactAngular);
    return IntactAngular;
}(Intact));
export { IntactAngular };
