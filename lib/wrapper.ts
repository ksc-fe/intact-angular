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

    /**
     * Angular element should be destroyed by Angular itself
     */
    // destroy(lastVNode, nextVNode, parentDom) {
        // How to destory angular element?
        // debugger;
        // const dom = lastVNode.dom;
        // if (!parentDom) {
            // dom.parentElement.removeChild(dom);
        // }
    // }

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

    static $id = 'AngularBlockWrapper';

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
        const {templateRef, context, ngZone} = this.vNode.props;
        ngZone.run(() => {
            const viewRef = this.viewRef = templateRef.createEmbeddedView({args: context});
            // for call lifecycle methods
            this.viewRef.detectChanges();
            viewRef.rootNodes.forEach(dom => {
                placeholder.appendChild(dom);
            });
        });
    }
}
