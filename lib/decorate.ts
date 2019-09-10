import {Component, ContentChild, TemplateRef} from '@angular/core';

export const componentTemplate = `<ng-content></ng-content>`;

export const BLOCK_NAME_PREFIX = '__block__';

// initialize the decorator of TemplateRef
// @ContentChild('ref', {static: false, read: TemplateRef}) ref: TemplateRef<any>;
export function decorateBlocks(IntactComponent, blocks) {
    blocks.forEach(name => {
        const decorate = ContentChild(name, {static: false, read: TemplateRef});
        decorate(IntactComponent.prototype, BLOCK_NAME_PREFIX + name);
    });

    return IntactComponent;
}

export function decorateComponent(IntactComponent, selector) {
    Component({selector, template: componentTemplate})(IntactComponent);

    return IntactComponent;
}

export function decorate(IntactComponent, selector, blocks?) {
    decorateComponent(IntactComponent, selector);
    if (blocks) {
        decorateBlocks(IntactComponent, blocks);
    }

    return IntactComponent;
}
