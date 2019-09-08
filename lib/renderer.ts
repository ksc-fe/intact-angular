import {Injectable, Renderer2, RendererStyleFlags2, RendererType2} from '@angular/core';
import {EventManager, ɵDomRendererFactory2, ɵDomSharedStylesHost} from '@angular/platform-browser';
import {IntactNode, isIntactNode} from './intact-node';

@Injectable()
export class IntactAngularRendererFactory extends ɵDomRendererFactory2 {
    private readonly defaultIntactRenderer: IntactRenderer;

    public intactRootNodes: Set<IntactNode> = new Set();

    constructor(eventManager: EventManager, sharedStylesHost: ɵDomSharedStylesHost) {
        super(eventManager, sharedStylesHost, 'app-id');

        this.defaultIntactRenderer = new IntactRenderer(this);
    }

    createRenderer(element: any, type: RendererType2 | null): Renderer2 {
        if (type && type.styles && type.styles[0] === 'intact') {
            return this.defaultIntactRenderer;
        }
        return super.createRenderer(element, type);
    }

    begin() {}

    end() {}
}

export interface IntactRendererData {
    readonly addRootNode: (node: IntactNode) => void;
}

export class IntactRenderer implements Renderer2 {
    readonly data: IntactRendererData = {
        addRootNode: (node: IntactNode) => {
            this.rootRenderer.intactRootNodes.add(node);
        },
    };

    constructor(public readonly rootRenderer: IntactAngularRendererFactory) {
        debugger; 
    }

    createElement(value: string): IntactNode {
        debugger;
        return new IntactNode(name);
    }

    destroy(): void {}

    destroyNode(node: IntactNode): void {
        debugger;
    }

    createComment(value: string): IntactNode {
        return new IntactNode(); 
    }

    createText(value: string): IntactNode {
        debugger;
        return new IntactNode().asText(value);
    }

    appendChild(parent: HTMLElement | IntactNode, node: IntactNode): void {
        debugger;
        if (!isIntactNode(parent)) {
            this.rootRenderer.intactRootNodes.add(node);
            node.parent = parent;
        }
    }

    insertBefore(parent: HTMLElement | IntactNode, node: IntactNode, refChild: any): void {

    }

    removeChild(parent: HTMLElement | IntactNode | void, node: IntactNode, isHostElement?: boolean): void {

    }

    selectRootElement(selectorOrNode: string | any): any {

    }

    parentNode(node: IntactNode): any {

    }

    nextSibling(node: any): any {

    }

    setAttribute(node: IntactNode, name: string, value: string, namespace?: string): void {
        node.setAttribute(name, value);
    }

    removeAttribute(node: IntactNode, name: string, namespace?: string): void {

    }

    addClass(node: IntactNode, name: string): void {
        node.setProperty('className', name);
    }

    removeClass(node: IntactNode, name: string): void {

    }

    setStyle(node: IntactNode, style: string, value: any, flags: RendererStyleFlags2): void {
        if (flags & RendererStyleFlags2.DashCase) {
            node.setProperty('style', {style: value + !!(flags & RendererStyleFlags2.Important) ? ' !important' : ''});
        } else {
            node.setProperty('style', {style: value});
        }
    }

    removeStyle(node: IntactNode, style: string, flags: RendererStyleFlags2): void {

    }

    setProperty(node: IntactNode, name: string, value: any): void {
        node.setProperty(name, value);
    }

    setValue(node: IntactNode, value: string): void {
        node.setProperty('value', value);
    }

    listen(node: IntactNode, event: string, callback: (event: any) => boolean): () => void {
        node.setProperty(event, callback);

        return () => null;
    }
}
