import { Component, OnInit, ViewContainerRef, TemplateRef, ViewChild, ContentChild } from '@angular/core';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit {
    data = [{name: 1}, {name: 2}];

    @ContentChild('scope', {static: false}) scope: TemplateRef<any>;
    @ViewChild('container', {static: false, read: ViewContainerRef}) container: ViewContainerRef;

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        const viewRef = this.scope.createEmbeddedView({
            $implicit: {name: 1}
        });
        this.container.insert(viewRef);
    }
}
