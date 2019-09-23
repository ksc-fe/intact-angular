import Intact from 'intact/dist/index';
import { ElementRef, ViewContainerRef, Injector } from '@angular/core';
import { decorate } from './decorate';
export declare class IntactAngular extends Intact {
    private elRef;
    private viewContainerRef;
    private injector;
    static decorate: typeof decorate;
    vNode: any;
    props: any;
    parentVNode: any;
    cancelAppendedQueue: boolean;
    private _allowConstructor;
    private _placeholder;
    private __blocks__;
    private __parent__;
    private _appendQueue;
    private mountedQueue;
    private _shouldTrigger;
    private __oldTriggerFlag;
    private _shouldUpdateProps;
    constructor(elRef: ElementRef, viewContainerRef: ViewContainerRef, injector: Injector);
    _constructor(props: any): void;
    init(lastVNode: any, nextVNode: any): any;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    _normalizeProps(): {
        children: any[];
        _blocks: any;
        _context: {
            data: {
                get(name: any): any;
                set(key: any, value: any): void;
            };
        };
    };
    _normalizeContext(): {
        data: {
            get(name: any): any;
            set(key: any, value: any): void;
        };
    };
    _normalizeBlocks(): void;
    _findParentIntactComponent(): IntactAngular;
    _initVNode(): void;
    _initAppendQueue(): void;
    _triggerAppendQueue(): void;
    _pushUpdateParentVNodeCallback(): void;
    __initMountedQueue(): void;
    __triggerMountedQueue(): void;
}
