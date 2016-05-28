import {Component, Input} from "angular2/core";
import {TabsSelect} from "./TabsSelect";
import {TabsList} from "./TabsList";

@Component({
    selector: 'lea-tab-list',
    template: `
    <container [hidden]="!active">
      <ng-content></ng-content>
    </container>
  `
})
export class TabList {

    @Input() tabTitle: string;
    active: boolean = false;

    constructor(tabs: TabsList) {
        tabs.addTab(this);
    }
}