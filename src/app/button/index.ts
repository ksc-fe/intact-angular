import {Component, ElementRef, ViewContainerRef, ContentChild, TemplateRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import {IntactAngular as Intact} from '../../../lib/intact-angular';
// import Intact from '../../../dist/index';

export class Button extends Intact {
    @(<any>Intact).template()
    static template = `<button class={self.get('type')} ev-click={self._onClick}>
        <b:prefix />
        {self.get('children')}
        disable: {String(self.get('disable'))}
        <b:suffix />
    </button>`;

    _onClick(e) {
        (<any>this).trigger('click', e);
    }
}

Intact.decorate(Button, 'k-button', ['prefix', 'suffix']);
