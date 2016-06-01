import {Component, Input} from "angular2/core";
import {TabsSelect} from "./TabsSelect";

@Component({
    selector: 'lea-tab-select',
    host: {
        '[style]': 'styleAsString()'
    },
    template: `<ng-content></ng-content>`
})
export class TabSelect {

    @Input() tabTitle: string;
    active: boolean = false;

    constructor(tabs: TabsSelect) {
        tabs.addTab(this);
    }

    styleAsString() {
        let style = {
            display: this.active ? 'inherit' : 'none'
        };

        return JSON.stringify(style).replace('{', '').replace('}', '').replace(/"/g, '');
    }
}