/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { APP_ID, Inject, Injectable, RendererStyleFlags2, ViewEncapsulation } from '@angular/core';
import { EventManager, ɵDomSharedStylesHost as DomSharedStylesHost } from '@angular/platform-browser';
import { IntactNode } from './intact-node';
export var NAMESPACE_URIS = {
    'svg': 'http://www.w3.org/2000/svg',
    'xhtml': 'http://www.w3.org/1999/xhtml',
    'xlink': 'http://www.w3.org/1999/xlink',
    'xml': 'http://www.w3.org/XML/1998/namespace',
    'xmlns': 'http://www.w3.org/2000/xmlns/',
};
var COMPONENT_REGEX = /%COMP%/g;
export var COMPONENT_VARIABLE = '%COMP%';
export var HOST_ATTR = "_nghost-" + COMPONENT_VARIABLE;
export var CONTENT_ATTR = "_ngcontent-" + COMPONENT_VARIABLE;
export function shimContentAttribute(componentShortId) {
    return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
}
export function shimHostAttribute(componentShortId) {
    return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
}
export function flattenStyles(compId, styles, target) {
    for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        if (Array.isArray(style)) {
            flattenStyles(compId, style, target);
        }
        else {
            style = style.replace(COMPONENT_REGEX, compId);
            target.push(style);
        }
    }
    return target;
}
function decoratePreventDefault(eventHandler) {
    return function (event) {
        // Ivy uses `Function` as a special token that allows us to unwrap the function
        // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`.
        if (event === Function) {
            return eventHandler;
        }
        var allowDefaultBehavior = eventHandler(event);
        if (allowDefaultBehavior === false) {
            // TODO(tbosch): move preventDefault into event plugins...
            event.preventDefault();
            event.returnValue = false;
        }
        return undefined;
    };
}
var DomRendererFactory2 = /** @class */ (function () {
    function DomRendererFactory2(eventManager, sharedStylesHost, appId) {
        this.eventManager = eventManager;
        this.sharedStylesHost = sharedStylesHost;
        this.appId = appId;
        this.rendererByCompId = new Map();
        this.defaultRenderer = new DefaultDomRenderer2(eventManager);
    }
    DomRendererFactory2.prototype.createRenderer = function (element, type) {
        if (!element || !type) {
            return this.defaultRenderer;
        }
        switch (type.encapsulation) {
            case ViewEncapsulation.Emulated: {
                var renderer = this.rendererByCompId.get(type.id);
                if (!renderer) {
                    renderer = new EmulatedEncapsulationDomRenderer2(this.eventManager, this.sharedStylesHost, type, this.appId);
                    this.rendererByCompId.set(type.id, renderer);
                }
                renderer.applyToHost(element);
                return renderer;
            }
            case ViewEncapsulation.Native:
            case ViewEncapsulation.ShadowDom:
                return new ShadowDomRenderer(this.eventManager, this.sharedStylesHost, element, type);
            default: {
                if (!this.rendererByCompId.has(type.id)) {
                    var styles = flattenStyles(type.id, type.styles, []);
                    this.sharedStylesHost.addStyles(styles);
                    this.rendererByCompId.set(type.id, this.defaultRenderer);
                }
                return this.defaultRenderer;
            }
        }
    };
    DomRendererFactory2.prototype.begin = function () { };
    DomRendererFactory2.prototype.end = function () { };
    DomRendererFactory2 = tslib_1.__decorate([
        Injectable(),
        tslib_1.__param(2, Inject(APP_ID)),
        tslib_1.__metadata("design:paramtypes", [EventManager, DomSharedStylesHost, String])
    ], DomRendererFactory2);
    return DomRendererFactory2;
}());
export { DomRendererFactory2 };
var DefaultDomRenderer2 = /** @class */ (function () {
    function DefaultDomRenderer2(eventManager) {
        this.eventManager = eventManager;
        this.data = Object.create(null);
    }
    DefaultDomRenderer2.prototype.destroy = function () { };
    DefaultDomRenderer2.prototype.createElement = function (name, namespace) {
        if (namespace) {
            // In cases where Ivy (not ViewEngine) is giving us the actual namespace, the look up by key
            // will result in undefined, so we just return the namespace here.
            return document.createElementNS(NAMESPACE_URIS[namespace] || namespace, name);
        }
        else if (name.substring(0, 2) === 'k-') {
            var el = document.createComment('intact-node');
            el._intactNode = new IntactNode(name);
            return el;
        }
        return document.createElement(name);
    };
    DefaultDomRenderer2.prototype.createComment = function (value) { return document.createComment(value); };
    DefaultDomRenderer2.prototype.createText = function (value) { return document.createTextNode(value); };
    DefaultDomRenderer2.prototype.appendChild = function (parent, newChild) {
        if (parent._intactNode) {
            var children = parent._intactNode.children;
            var lastNode = children[children.length - 1];
            parent._intactNode.children.push(newChild);
            // fix the parentNode, because it has not been appended to parentNode
            newChild._parentNode = parent;
            if (lastNode) {
                lastNode._nextSibling = newChild;
            }
            // for save original className
            newChild._classNames = new Set();
        }
        else {
            parent.appendChild(newChild);
        }
    };
    DefaultDomRenderer2.prototype.insertBefore = function (parent, newChild, refChild) {
        if (parent) {
            if (parent._intactNode) {
                var name_1 = parent._block;
                // it is appending child
                if (!refChild) {
                    this.appendChild(parent, newChild);
                }
                else {
                    var children = parent._intactNode.children;
                    var index = children.indexOf(refChild);
                    children.splice(index, 0, newChild);
                    // update nextSibling
                    newChild._parentNode = parent;
                    newChild._nextSibling = refChild;
                    if (index > 0) {
                        children[index - 1]._nextSibling = newChild;
                    }
                }
            }
            else {
                parent.insertBefore(newChild, refChild && (refChild._realElement || refChild));
            }
        }
    };
    DefaultDomRenderer2.prototype.removeChild = function (parent, oldChild) {
        if (parent) {
            if (parent._intactNode) {
                var children = parent._intactNode.children;
                var index = children.indexOf(oldChild);
                children.splice(index, 1);
                // update nextSibling
                if (index > 0) {
                    children[index - 1]._nextSibling = children[index];
                }
            }
            else {
                parent.removeChild(oldChild._realElement || oldChild);
            }
        }
    };
    DefaultDomRenderer2.prototype.selectRootElement = function (selectorOrNode, preserveContent) {
        var el = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
            selectorOrNode;
        if (!el) {
            throw new Error("The selector \"" + selectorOrNode + "\" did not match any elements");
        }
        if (!preserveContent) {
            el.textContent = '';
        }
        return el;
    };
    DefaultDomRenderer2.prototype.parentNode = function (node) {
        return node._parentNode || node.parentNode;
    };
    DefaultDomRenderer2.prototype.nextSibling = function (node) {
        return '_nextSibling' in node ? node._nextSibling : node.nextSibling;
    };
    DefaultDomRenderer2.prototype.setAttribute = function (el, name, value, namespace) {
        if (namespace) {
            name = namespace + ':' + name;
            // TODO(benlesh): Ivy may cause issues here because it's passing around
            // full URIs for namespaces, therefore this lookup will fail.
            var namespaceUri = NAMESPACE_URIS[namespace];
            if (namespaceUri) {
                el.setAttributeNS(namespaceUri, name, value);
            }
            else {
                el.setAttribute(name, value);
            }
        }
        else if (el._intactNode) {
            el._intactNode.setProperty(name, value);
        }
        else {
            el.setAttribute(name, value);
        }
    };
    DefaultDomRenderer2.prototype.removeAttribute = function (el, name, namespace) {
        if (namespace) {
            // TODO(benlesh): Ivy may cause issues here because it's passing around
            // full URIs for namespaces, therefore this lookup will fail.
            var namespaceUri = NAMESPACE_URIS[namespace];
            if (namespaceUri) {
                el.removeAttributeNS(namespaceUri, name);
            }
            else {
                // TODO(benlesh): Since ivy is passing around full URIs for namespaces
                // this could result in properties like `http://www.w3.org/2000/svg:cx="123"`,
                // which is wrong.
                el.removeAttribute(namespace + ":" + name);
            }
        }
        else if (el._intactNode) {
            el._intactNode.removeProperty(name);
        }
        else {
            el.removeAttribute(name);
        }
    };
    DefaultDomRenderer2.prototype.addClass = function (el, name) {
        if (el._intactNode) {
            el._intactNode.addClass(name);
        }
        else {
            el.classList.add(name);
            if (el._classNames) {
                el._classNames.add(name);
            }
        }
    };
    DefaultDomRenderer2.prototype.removeClass = function (el, name) {
        if (el._intactNode) {
            el._intactNode.removeClass(name);
        }
        else {
            el.classList.remove(name);
            if (el._classNames) {
                el._classNames.delete(name);
            }
        }
    };
    DefaultDomRenderer2.prototype.setStyle = function (el, style, value, flags) {
        if (el._intactNode) {
            el._intactNode.initStyle();
            el = el._intactNode.style;
        }
        if (flags & RendererStyleFlags2.DashCase) {
            el.style.setProperty(style, value, !!(flags & RendererStyleFlags2.Important) ? 'important' : '');
        }
        else {
            el.style[style] = value;
        }
    };
    DefaultDomRenderer2.prototype.removeStyle = function (el, style, flags) {
        if (el._intactNode) {
            el._intactNode.initStyle();
            el = el._intactNode.style;
        }
        if (flags & RendererStyleFlags2.DashCase) {
            el.style.removeProperty(style);
        }
        else {
            // IE requires '' instead of null
            // see https://github.com/angular/angular/issues/7916
            el.style[style] = '';
        }
    };
    DefaultDomRenderer2.prototype.setProperty = function (el, name, value) {
        if (el._intactNode) {
            el._intactNode.setProperty(name, value);
        }
        else {
            checkNoSyntheticProp(name, 'property');
            el[name] = value;
        }
    };
    DefaultDomRenderer2.prototype.setValue = function (node, value) {
        if (node._intactNode) {
            node._intactNode.setProperty('value', value);
        }
        else {
            node.nodeValue = value;
        }
    };
    DefaultDomRenderer2.prototype.listen = function (target, event, callback) {
        checkNoSyntheticProp(event, 'listener');
        if (typeof target === 'string') {
            return this.eventManager.addGlobalEventListener(target, event, decoratePreventDefault(callback));
        }
        else if (target._intactNode) {
            if (event.slice(-6) === 'Change') {
                // change event name, which like `valueChange` for two way binding, to `$change:value`
                event = "$change:" + event.slice(0, -6);
                var _cb_1 = callback;
                callback = function (c, v) {
                    this.ngZone.run(function () { return _cb_1(v); });
                };
            }
            else {
                if (event[0] === '$') {
                    // change $change-value to $change:value
                    event = event.replace(/\-/, ':');
                }
                var _cb_2 = callback;
                callback = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    this.ngZone.run(function () { return _cb_2(args); });
                };
            }
            target._intactNode.setProperty("ev-" + event, callback);
            return function () { return null; };
        }
        return this.eventManager.addEventListener(target, event, decoratePreventDefault(callback));
    };
    return DefaultDomRenderer2;
}());
var AT_CHARCODE = (function () { return '@'.charCodeAt(0); })();
function checkNoSyntheticProp(name, nameKind) {
    if (name.charCodeAt(0) === AT_CHARCODE) {
        throw new Error("Found the synthetic " + nameKind + " " + name + ". Please include either \"BrowserAnimationsModule\" or \"NoopAnimationsModule\" in your application.");
    }
}
var EmulatedEncapsulationDomRenderer2 = /** @class */ (function (_super) {
    tslib_1.__extends(EmulatedEncapsulationDomRenderer2, _super);
    function EmulatedEncapsulationDomRenderer2(eventManager, sharedStylesHost, component, appId) {
        var _this = _super.call(this, eventManager) || this;
        _this.component = component;
        var styles = flattenStyles(appId + '-' + component.id, component.styles, []);
        sharedStylesHost.addStyles(styles);
        _this.contentAttr = shimContentAttribute(appId + '-' + component.id);
        _this.hostAttr = shimHostAttribute(appId + '-' + component.id);
        return _this;
    }
    EmulatedEncapsulationDomRenderer2.prototype.applyToHost = function (element) { _super.prototype.setAttribute.call(this, element, this.hostAttr, ''); };
    EmulatedEncapsulationDomRenderer2.prototype.createElement = function (parent, name) {
        var el = _super.prototype.createElement.call(this, parent, name);
        _super.prototype.setAttribute.call(this, el, this.contentAttr, '');
        return el;
    };
    return EmulatedEncapsulationDomRenderer2;
}(DefaultDomRenderer2));
var ShadowDomRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(ShadowDomRenderer, _super);
    function ShadowDomRenderer(eventManager, sharedStylesHost, hostEl, component) {
        var _this = _super.call(this, eventManager) || this;
        _this.sharedStylesHost = sharedStylesHost;
        _this.hostEl = hostEl;
        _this.component = component;
        if (component.encapsulation === ViewEncapsulation.ShadowDom) {
            _this.shadowRoot = hostEl.attachShadow({ mode: 'open' });
        }
        else {
            _this.shadowRoot = hostEl.createShadowRoot();
        }
        _this.sharedStylesHost.addHost(_this.shadowRoot);
        var styles = flattenStyles(component.id, component.styles, []);
        for (var i = 0; i < styles.length; i++) {
            var styleEl = document.createElement('style');
            styleEl.textContent = styles[i];
            _this.shadowRoot.appendChild(styleEl);
        }
        return _this;
    }
    ShadowDomRenderer.prototype.nodeOrShadowRoot = function (node) { return node === this.hostEl ? this.shadowRoot : node; };
    ShadowDomRenderer.prototype.destroy = function () { this.sharedStylesHost.removeHost(this.shadowRoot); };
    ShadowDomRenderer.prototype.appendChild = function (parent, newChild) {
        return _super.prototype.appendChild.call(this, this.nodeOrShadowRoot(parent), newChild);
    };
    ShadowDomRenderer.prototype.insertBefore = function (parent, newChild, refChild) {
        return _super.prototype.insertBefore.call(this, this.nodeOrShadowRoot(parent), newChild, refChild);
    };
    ShadowDomRenderer.prototype.removeChild = function (parent, oldChild) {
        return _super.prototype.removeChild.call(this, this.nodeOrShadowRoot(parent), oldChild);
    };
    ShadowDomRenderer.prototype.parentNode = function (node) {
        return this.nodeOrShadowRoot(_super.prototype.parentNode.call(this, this.nodeOrShadowRoot(node)));
    };
    return ShadowDomRenderer;
}(DefaultDomRenderer2));
