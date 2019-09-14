import Intact from 'intact/dist/index';

const {patch, clone, Types} = Intact.Vdt.miss;
const emptyObject = Object.create(null);

export class Wrapper {
    init(lastVNode, nextVNode) {
        const dom = nextVNode.props.dom;

        nextVNode = this._handleProps(nextVNode);
        lastVNode = clone(nextVNode);
        lastVNode.props = emptyObject; 
        lastVNode.dom = dom;
        lastVNode.className = undefined;
        patch(lastVNode, nextVNode);

        return dom;
    }

    update(lastVNode, nextVNode) {
        lastVNode = this._handleProps(lastVNode);
        nextVNode = this._handleProps(nextVNode);
        patch(lastVNode, nextVNode);

        return nextVNode.dom;
    }

    destroy(lastVNode, nextVNode, parentDom) {
        // How to destory angular element?
        const dom = lastVNode.dom;
        if (!parentDom) {
            dom.parentElement.removeChild(dom);
        }
    }

    _handleProps(vNode) {
        vNode = clone(vNode);
        const props = {...vNode.props};
        const dom = props.dom;
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
    }
}

export class BlockWrapper {
    private placeholder;
    private vNode;
    private viewRef;

    init(lastVNode, nextVNode) {
        this._render(nextVNode);
        return this.placeholder;
    }

    update(lastVNode, nextVNode) {
        const newContext = nextVNode.props.context;
        this.viewRef.context.args = newContext;
        this.viewRef.detectChanges();
        return this.placeholder;
    }

    destroy() {
        this.viewRef.destroy();
    }

    _render(vNode) {
        const placeholder = this.placeholder = document.createElement('intact-content');
        const {templateRef, context} = this.vNode.props;
        const viewRef = this.viewRef = templateRef.createEmbeddedView({args: context});
        viewRef.rootNodes.forEach(dom => {
            placeholder.appendChild(dom);
        });
    }
}
