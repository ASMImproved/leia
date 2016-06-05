import {Component, Input, HostBinding} from "@angular/core";
import {TabsSelect} from "./TabsSelect";
import {TabsList} from "./TabsList";

@Component({
    selector: 'leia-tab-list',
    template: `<ng-content></ng-content>`
})
export class TabList {

    @Input() tabTitle: string;
    active: boolean = false;

    @HostBinding('class.activeTab') get activeTab() {return this.active}
    @HostBinding('class.inactiveTab') get inactiveTab() {return !this.active}

    constructor(tabs: TabsList) {
        tabs.addTab(this);
    }
}