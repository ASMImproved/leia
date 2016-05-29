import {Component} from "angular2/core";
import {ProjectPanel} from "./ProjectPanel";

@Component({
    selector: 'bottom',
    template: `
        <ng-content></ng-content>
        <lea-resize-panel>
			<button (click)="projectPanel.growBottomPanel()"><i class="fa fa-long-arrow-up"></i></button>
			<button (click)="projectPanel.shrinkBottomPanel()"><i class="fa fa-long-arrow-down"></i></button>
		</lea-resize-panel>     
  `
})
export class BottomPanel {
    constructor(private projectPanel: ProjectPanel) {

    }

}