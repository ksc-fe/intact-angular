import Intact from 'intact/dist/index';
import { ElementRef, ViewContainerRef, Injector, NgZone } from '@angular/core';
import { decorate } from './decorate';
export declare class IntactAngular extends Intact {
    private elRef;
    private viewContainerRef;
    private injector;
    private ngZone;
    static decorate: typeof decorate;
    vNode: any;
    props: any;
    parentVNode: any;
    cancelAppendedQueue: boolean;
    private _allowConstructor;
    private _placeholder;
    private __blocks__;
    private __parent__;
    private __context__;
    private _appendQueue;
    private mountedQueue;
    private _shouldTrigger;
    private __oldTriggerFlag;
    private __outside;
    private _shouldUpdateProps;
    constructor(elRef: ElementRef, viewContainerRef: ViewContainerRef, injector: Injector, ngZone: NgZone);
    _constructor(props: any): void;
    init(lastVNode: any, nextVNode: any): any;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    destroy(lastVNode: any, nextVNode: any, parentDom: any): void;
    ngOnDestroy(): void;
    _normalizeProps(): {
        children: any[];
        _blocks: any;
        _context: any;
    };
    _normalizeContext(): void;
    _normalizeBlocks(): void;
    _findParentIntactComponent(): IntactAngular;
    _initVNode(): void;
    _initAppendQueue(): void;
    _triggerAppendQueue(): void;
    _pushUpdateParentVNodeCallback(): void;
    __initMountedQueue(): void;
    __triggerMountedQueue(): void;
    set(key: any, value: any, options: any): void;
}
