import * as tslib_1 from "tslib";
import { IntactAngular } from './intact-angular';
export function functionalWrapper(Component, selector) {
    var FunctionalWrapper = /** @class */ (function (_super) {
        tslib_1.__extends(FunctionalWrapper, _super);
        function FunctionalWrapper() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FunctionalWrapper.prototype.template = function (instance) {
            return Component(instance.props, 'angular');
        };
        FunctionalWrapper.blocks = Component.blocks;
        return FunctionalWrapper;
    }(IntactAngular));
    IntactAngular.decorate(FunctionalWrapper, selector);
    return FunctionalWrapper;
}
