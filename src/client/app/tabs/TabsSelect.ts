import {Component} from "@angular/core";
import {TabSelect} from "./TabSelect";
import {FORM_DIRECTIVES, CORE_DIRECTIVES} from "@angular/common";

@Component({
    selector: 'leia-tabs-select',
    template: require('./tabsSelect.html'),
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
})
export class TabsSelect {
    tabs: TabSelect[] = [];
    activeTab: TabSelect;

    selectTab(tabName: string) {
        this.tabs.forEach((tab) => {
            tab.active = false;
        });
        let newTab: TabSelect;
        this.tabs.forEach((tab: TabSelect) => {
            if(tab.tabTitle == tabName) {
                newTab = tab;
            }
        });
        newTab.active = true;
        this.activeTab = newTab;
    }

    addTab(tab: TabSelect) {
        if (this.tabs.length === 0) {
            tab.active = true;
        }
        this.tabs.push(tab);
    }
}