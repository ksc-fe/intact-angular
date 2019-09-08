import Intact from 'intact';

export type StringMap<T = any> = {[index: string]: T};

export class IntactNode {
    private _text: string;
    private _parent: HTMLElement | IntactNode;
    private _childrenToAppend: Array<HTMLElement> = [];

    public props = {};
    public children: Set<HTMLElement> = new Set();
    public blocks: any = {};

    set parent(parent: HTMLElement | IntactNode) {
        this._parent = parent;
    }
    get parent(): HTMLElement | IntactNode {
        return this._parent;
    }

    constructor(private type?: string) {

    }

    setAttribute(name: string, value: string) {
        this.setAttributes({[name]: value});
    }

    setAttributes(attributes: StringMap<string>) {
        this.setProperties(attributes);
    }

    setProperty(name: string, value: any) {
        this.setProperties({[name]: value});
    }

    setProperties(properties: StringMap) {
        Object.assign(this.props, properties);
    }

    asText(value: string) {
        this._text = value;

        return this;
    }

    appendChild(projectedContent: HTMLElement) {
        debugger;
        this._childrenToAppend.push(projectedContent);
    }
}

export function isIntactNode(node: any): node is IntactNode {
    return node instanceof IntactNode; 
}
