export declare class Wrapper {
    init(lastVNode: any, nextVNode: any): any;
    update(lastVNode: any, nextVNode: any): any;
    destroy(lastVNode: any, nextVNode: any, parentDom: any): void;
    _handleProps(vNode: any): any;
}
export declare class BlockWrapper {
    private placeholder;
    private vNode;
    private viewRef;
    init(lastVNode: any, nextVNode: any): any;
    update(lastVNode: any, nextVNode: any): any;
    destroy(): void;
    _render(vNode: any): void;
}
