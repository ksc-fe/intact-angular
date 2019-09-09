import {Component, ContentChild, TemplateRef} from '@angular/core';

export const componentTemplate = `<ng-content></ng-content><ng-container #container></ng-container>`;

// initialize the decorator of TemplateRef
// @ContentChild('ref', {static: false, read: TemplateRef}) ref: TemplateRef<any>;
export function decorateBlocks(IntactComponent, blocks) {
    blocks.forEach(name => {
        const decorate = ContentChild(name, {static: false, read: TemplateRef});
        decorate(IntactComponent.prototype, name);
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
