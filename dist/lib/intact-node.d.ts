export declare class IntactNode {
    props: {};
    children: Array<HTMLElement>;
    blocks: any;
    instance: any;
    className: object | null;
    style: any;
    constructor();
    setProperty(name: string, value: any): void;
    removeProperty(name: any): void;
    addClass(name: any): void;
    removeClass(name: any): void;
    initStyle(): void;
}
export declare function isIntactNode(node: any): node is IntactNode;
