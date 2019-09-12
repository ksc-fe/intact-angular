import {IntactAngular} from './intact-angular';

export function functionalWrapper(Component, selector, blocks?) {
    class FunctionalWrapper extends IntactAngular {
        template(instance) {
            return Component(instance.props, true);
        }
    }

    IntactAngular.decorate(FunctionalWrapper, selector, blocks);

    return FunctionalWrapper;
}
