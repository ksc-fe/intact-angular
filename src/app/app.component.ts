import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'intact-angular';
    disable = false;

    counter = 1;

    onClick() {
        this.disable = !this.disable;
    }
}
