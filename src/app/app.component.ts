import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    @ViewChild('ref', {static: false}) ref;
    title = 'intact-angular';
    disable = false;

    counter = 1;

    onClick() {
        console.log(this.ref.nativeElement.style);
        this.disable = !this.disable;
    }
}
