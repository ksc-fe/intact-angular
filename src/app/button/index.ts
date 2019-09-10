import {Component, ElementRef, ViewContainerRef, ContentChild, TemplateRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import {IntactAngular as Intact} from '../../../lib/intact-angular';
// import Intact from '../../../dist/index';

export class Button extends Intact {
    @(<any>Intact).template({noWith: true})
    static template = `<div class={self.get('type')} ev-click={self._onClick}>
        <b:prefix />
        {self.get('children')}
        disable: {String(self.get('disable'))}
        <b:suffix />
        <ul>
            <li v-for={self.get('list')}>
                <b:item args={[value]} />
            </li>
        </ul>
    </div>`;

    defaults() {
        return {
            list: [{name: 1}, {name: 2}]
        };
    }

    _onClick(e) {
        (<any>this).trigger('click', e);
    }
}

Intact.decorate(Button, 'k-button', ['prefix', 'suffix', 'item']);
