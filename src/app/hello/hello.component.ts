import { Component, OnInit, ViewContainerRef, TemplateRef, ViewChild, ContentChild, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit {
    @Input() counter = 0;

    @Output() counterChange = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    add() {
        this.counter++;
        this.counterChange.emit(this.counter);
    }

    // ngAfterViewInit() {
        // const viewRef = this.scope.createEmbeddedView({
            // $implicit: {name: 1}
        // });
        // this.container.insert(viewRef);
    // }
}
