export declare class Wrapper {
    private vdt;
    init(lastVNode: any, nextVNode: any): any;
    update(lastVNode: any, nextVNode: any): any;
    /**
     * Angular element should be destroyed by Angular itself
     */
    _handleProps(vNode: any): any;
}
export declare class BlockWrapper {
    private placeholder;
    private vNode;
    private viewRef;
    private vdt;
    static $id: string;
    init(lastVNode: any, nextVNode: any): any;
    update(lastVNode: any, nextVNode: any): any;
    destroy(): void;
    _render(vNode: any): void;
}
