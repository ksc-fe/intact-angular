import {IntactAngular} from './intact-angular';

export function functionalWrapper(Component, selector): any {
    class FunctionalWrapper extends IntactAngular {
        static blocks = Component.blocks;

        template(instance) {
            return Component(instance.props, 'angular');
        }
    }

    IntactAngular.decorate(FunctionalWrapper, selector);

    return FunctionalWrapper;
}
