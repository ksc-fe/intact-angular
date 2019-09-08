import {IntactNode} from './intact-node';
import Intact from 'intact';
import {Wrapper} from './wrapper';

const {h} = Intact.Vdt.miss;

export function normalize(intactNode: IntactNode): any {
    const children = intactNode.children.map(dom => {
        return h(Wrapper, {dom});
    });

    return {children, ...intactNode.props};
}
