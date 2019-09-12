import {IntactAngular} from './intact-angular';

export function functionalWrapper(Component, selector) {
    class FunctionalWrapper extends IntactAngular {
        template(instance) {
            return Component(instance.props, true);
        }
    }

    IntactAngular.decorate(FunctionalWrapper, selector);

    return FunctionalWrapper;
}
