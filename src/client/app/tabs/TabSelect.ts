import {Component, Input, HostBinding} from "@angular/core";
import {TabsSelect} from "./TabsSelect";

@Component({
    selector: 'lea-tab-select',
    template: `<ng-content></ng-content>`
})
export class TabSelect {

    @Input() tabTitle: string;
    active: boolean = false;

    @HostBinding('class.activeTab') get activeTab() {return this.active}
    @HostBinding('class.inactiveTab') get inactiveTab() {return !this.active}

    constructor(tabs: TabsSelect) {
        tabs.addTab(this);
    }
}