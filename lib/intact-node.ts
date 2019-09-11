export type StringMap<T = any> = {[index: string]: T};

export class IntactNode {
    private _text: string;
    private _parent: HTMLElement | IntactNode;

    public props = {};
    public children: Array<HTMLElement> = [];
    public blocks: any = {};
    public instance;

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
}

export function isIntactNode(node: any): node is IntactNode {
    return node instanceof IntactNode; 
}
