export class Wrapper {
    init(lastVNode, nextVNode) {
        return nextVNode.props.dom;
    }

    update(lastVNode, nextVNode) {
        return nextVNode.props.dom;
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
