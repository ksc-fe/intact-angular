import {NgModule, Component, ElementRef, ViewContainerRef, ContentChild, TemplateRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import Intact from 'intact';
import {Button, ButtonGroup} from 'kpc/@css/components/button';
import {Table, TableColumn} from 'kpc/@css/components/table';

const components = [Button, ButtonGroup, Table, TableColumn];

Intact.decorate(Button, 'k-button');
Intact.decorate(ButtonGroup, 'k-button-group');
Intact.decorate(Table, 'k-table');
Intact.decorate(TableColumn, 'k-table-column', ['template']);

@NgModule({
    declarations: components,
    exports: components,
})
export class KpcModule { }
