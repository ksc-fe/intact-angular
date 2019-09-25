import { Component, ContentChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { functionalWrapper } from './functional';
export var componentTemplate = "<ng-content></ng-content>";
export var BLOCK_NAME_PREFIX = '__block__';
// initialize the decorator of TemplateRef
// @ContentChildren('ref', {read: TemplateRef, descendants: false}) ref: TemplateRef<any>;
// The reason we use ContentChildren rather than ContentChild is that ContentChildren support 
// include only direct children
// But the `descendants` does not work, why?
export function decorateBlocks(IntactComponent, blocks) {
    blocks.forEach(function (name) {
        name = name.replace(/-/g, '_');
        var decorate = ContentChild(name, { read: TemplateRef, static: false });
        decorate(IntactComponent.prototype, BLOCK_NAME_PREFIX + name);
    });
    return IntactComponent;
}
export function decorateComponent(IntactComponent, selector) {
    Component({
        selector: selector,
        template: componentTemplate,
        changeDetection: ChangeDetectionStrategy.OnPush
    })(IntactComponent);
    return IntactComponent;
}
export function decorate(IntactComponent, selector) {
    if (!IntactComponent.decorate) {
        // is a functional component
        return functionalWrapper(IntactComponent, selector);
    }
    decorateComponent(IntactComponent, selector);
    if (IntactComponent.blocks) {
        decorateBlocks(IntactComponent, IntactComponent.blocks);
    }
    return IntactComponent;
}
