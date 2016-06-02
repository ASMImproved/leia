import {Component} from "@angular/core";
import {TabSelect} from "./TabSelect";

@Component({
    selector: 'lea-tabs-list',
    template: `
    <ul class="lea-tabs">
      <li *ngFor="let tab of tabs" [ngClass]="{active: tab.active}" (click)="selectTab(tab)">
        {{tab.tabTitle}}
      </li>
    </ul>
    <ng-content></ng-content>
  `,
})
export class TabsList {
    tabs: TabSelect[] = [];

    selectTab(tab: TabSelect) {
        this.tabs.forEach((tab) => {
            tab.active = false;
        });
        tab.active = true;
    }

    addTab(tab: TabSelect) {
        if (this.tabs.length === 0) {
            tab.active = true;
        }
        this.tabs.push(tab);
    }
}
