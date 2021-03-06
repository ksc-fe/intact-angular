import Intact from 'intact/dist/index';
import { ElementRef, ViewContainerRef, ChangeDetectorRef, Injector, NgZone } from '@angular/core';
import { decorate } from './decorate';
export declare class IntactAngular extends Intact {
    private elRef;
    private viewContainerRef;
    private injector;
    private ngZone;
    private changeDetectorRef;
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
    private __appendQueue;
    private mountedQueue;
    private _shouldTrigger;
    private __oldTriggerFlag;
    private _shouldUpdateProps;
    private __firstCheck;
    private _isAngular;
    private _hasDestroyedByAngular;
    private _willUpdate;
    constructor(elRef: ElementRef, viewContainerRef: ViewContainerRef, injector: Injector, ngZone: NgZone, changeDetectorRef: ChangeDetectorRef);
    _constructor(props: any): void;
    init(lastVNode: any, nextVNode: any): any;
    ngDoCheck(): void;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): boolean;
    destroy(lastVNode: any, nextVNode: any, parentDom: any, fromSelf: any): void;
    ngOnDestroy(): void;
    _normalizeProps(): {
        key: any;
    };
    _normalizeContext(): void;
    _normalizeBlocks(): void;
    _findParentIntactComponent(): any;
    _initVNode(): void;
    _initAppendQueue(): void;
    _triggerAppendQueue(): void;
    __updateParentVNode(): void;
    __initMountedQueue(): void;
    __triggerMountedQueue(): void;
}
