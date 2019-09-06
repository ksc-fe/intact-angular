import {Injectable, Renderer2, RendererStyleFlags2, RendererType2} from '@angular/core';
import {EventManager, ɵDomRendererFactory2, ɵDomSharedStylesHost} from '@angular/platform-browser';
import {IntactNode} from './intact-node';

@Injectable()
export class IntactAngularRendererFactory extends ɵDomRendererFactory2 {
    private readonly defaultIntactRenderer: IntactRenderer;

    constructor(eventManager: EventManager, sharedStylesHost: ɵDomSharedStylesHost) {
        super(eventManager, sharedStylesHost, 'app-id');

        this.defaultIntactRenderer = new IntactRenderer(this);
    }

    createRenderer(element: any, type: RendererType2 | null): Renderer2 {

        return super.createRenderer(element, type);
    }
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

    }

    createElement(value: string): IntactNode {
        return new IntactNode(name);
    }
}
