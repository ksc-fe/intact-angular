import * as tslib_1 from "tslib";
import Intact from 'intact/dist/index';
var _a = Intact.Vdt.miss, patch = _a.patch, clone = _a.clone, Types = _a.Types;
var emptyObject = Object.create(null);
var Wrapper = /** @class */ (function () {
    function Wrapper() {
    }
    Wrapper.prototype.init = function (lastVNode, nextVNode) {
        var dom = nextVNode.props.dom;
        nextVNode = this._handleProps(nextVNode);
        lastVNode = clone(nextVNode);
        lastVNode.props = emptyObject;
        lastVNode.dom = dom;
        lastVNode.className = undefined;
        patch(lastVNode, nextVNode);
        return dom;
    };
    Wrapper.prototype.update = function (lastVNode, nextVNode) {
        lastVNode = this._handleProps(lastVNode);
        nextVNode = this._handleProps(nextVNode);
        patch(lastVNode, nextVNode);
        return nextVNode.dom;
    };
    Wrapper.prototype.destroy = function (lastVNode, nextVNode, parentDom) {
        // How to destory angular element?
        var dom = lastVNode.dom;
        if (!parentDom) {
            dom.parentElement.removeChild(dom);
        }
    };
    Wrapper.prototype._handleProps = function (vNode) {
        vNode = clone(vNode);
        var props = tslib_1.__assign({}, vNode.props);
        var dom = props.dom;
        delete props.dom;
        vNode.props = props;
        vNode.children = null;
        if ('className' in props) {
            vNode.className = props.className;
            delete props.className;
        }
        if ('key' in props) {
            vNode.key = props.key;
            delete props.key;
        }
        vNode.type = Types.HtmlElement;
        vNode.dom = dom;
        return vNode;
    };
    return Wrapper;
}());
export { Wrapper };
var BlockWrapper = /** @class */ (function () {
    function BlockWrapper() {
    }
    BlockWrapper.prototype.init = function (lastVNode, nextVNode) {
        this._render(nextVNode);
        return this.placeholder;
    };
    BlockWrapper.prototype.update = function (lastVNode, nextVNode) {
        var newContext = nextVNode.props.context;
        this.viewRef.context.args = newContext;
        this.viewRef.detectChanges();
        return this.placeholder;
    };
    BlockWrapper.prototype.destroy = function () {
        this.viewRef.destroy();
    };
    BlockWrapper.prototype._render = function (vNode) {
        var placeholder = this.placeholder = document.createElement('intact-content');
        var _a = this.vNode.props, templateRef = _a.templateRef, context = _a.context;
        var viewRef = this.viewRef = templateRef.createEmbeddedView({ args: context });
        viewRef.rootNodes.forEach(function (dom) {
            placeholder.appendChild(dom);
        });
    };
    return BlockWrapper;
}());
export { BlockWrapper };
