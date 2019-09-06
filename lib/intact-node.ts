import Intact from 'intact';

export type StringMap<T = any> = {[index: string]: T};

export class IntactNode {
    private _props = {};

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
        Object.assign(this._props, properties);
    }
}
