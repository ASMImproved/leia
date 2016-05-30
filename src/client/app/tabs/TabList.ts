import {Component, Input} from "angular2/core";
import {TabsSelect} from "./TabsSelect";
import {TabsList} from "./TabsList";

@Component({
    selector: 'lea-tab-list',
    host: {
        '[style]': 'styleAsString()'
    },
    template: `<ng-content></ng-content>`
})
export class TabList {

    @Input() tabTitle: string;
    active: boolean = false;

    constructor(tabs: TabsList) {
        tabs.addTab(this);
    }

    styleAsString() {
        let style = {
            display: this.active ? 'inherit' : 'none'
        };

        return JSON.stringify(style).replace('{', '').replace('}', '').replace(/"/g, '');
    }
}