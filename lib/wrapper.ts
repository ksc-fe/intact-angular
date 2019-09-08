import Intact from 'intact';

export class Wrapper {
    init(lastVNode, nextVNode) {
        return nextVNode.props.dom;
    }

    update(lastVNode, nextVNode) {
        return nextVNode.props.dom;
    }
}
