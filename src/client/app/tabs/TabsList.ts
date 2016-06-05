import {Component} from "@angular/core";
import {TabSelect} from "./TabSelect";
import {TabList} from "./TabList";

@Component({
    selector: 'leia-tabs-list',
    template: `
    <ul class="leia-tabs">
      <li *ngFor="let tab of tabs" [ngClass]="{active: tab.active}" (click)="selectTab(tab)">
        {{tab.tabTitle}}
      </li>
    </ul>
    <ng-content></ng-content>
  `,
})
export class TabsList {
    tabs: TabList[] = [];

    selectTab(tab: TabList) {
        this.tabs.forEach((tab) => {
            tab.active = false;
        });
        tab.active = true;
    }

    addTab(tab: TabList) {
        if (this.tabs.length === 0) {
            tab.active = true;
        }
        this.tabs.push(tab);
    }
}
