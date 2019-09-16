import {NgModule, Component, ElementRef, ViewContainerRef, ContentChild, TemplateRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import Intact, {functionalWrapper} from 'intact';
import {Button, ButtonGroup} from 'kpc/@css/components/button';
import {Table, TableColumn} from 'kpc/@css/components/table';
import {Dropdown, DropdownMenu, DropdownItem} from 'kpc/@css/components/dropdown';
import {configure} from 'kpc/@css/components/utils';

configure({useWrapper: true});

Intact.decorate(Button, 'k-button');
Intact.decorate(ButtonGroup, 'k-button-group');
Intact.decorate(Table, 'k-table');
Intact.decorate(TableColumn, 'k-table-column', ['template']);
Intact.decorate(DropdownMenu, 'k-dropdown-menu');
Intact.decorate(DropdownItem, 'k-dropdown-item');
const DropdownWrapper = functionalWrapper(Dropdown, 'k-dropdown');

const components = [Button, ButtonGroup, Table, TableColumn, DropdownWrapper, DropdownMenu, DropdownItem];

@NgModule({
    declarations: components,
    exports: components,
})
export class KpcModule { }
