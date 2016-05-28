import {Component, Input} from "angular2/core";
import {TabsSelect} from "./TabsSelect";

@Component({
    selector: 'lea-tab-select',
    template: `
    <container [hidden]="!active">
      <ng-content></ng-content>
    </container>
  `
})
export class TabSelect {

    @Input() tabTitle: string;
    active: boolean = false;

    constructor(tabs: TabsSelect) {
        tabs.addTab(this);
    }
}