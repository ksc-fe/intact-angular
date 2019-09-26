export type StringMap<T = any> = {[index: string]: T};

export class IntactNode {
    public props = {};
    public children: Array<HTMLElement> = [];
    public blocks: any = {};
    public instance;
    public className: object | null = null;
    public style = null;

    constructor() {  }

    setProperty(name: string, value: any) {
        // class has handled in addClass method
        if (name === 'class') {
            this.addClass(value);
        } else if (name === 'style') {
            this.initStyle();
            this.style.setAttribute('style', value);
        } else {
            this.props[name] = value;
        }
    }

    removeProperty(name) {
        delete this.props[name];
    }

    addClass(name) {
        if (!this.className) this.className = Object.create(null);
        this.className[name] = true;
    }

    removeClass(name) {
        if (this.className) {
            delete this.className[name];
        }
    }

    initStyle() {
        if (!this.style) this.style = document.createElement('div');
    }
}

export function isIntactNode(node: any): node is IntactNode {
    return node instanceof IntactNode; 
}
