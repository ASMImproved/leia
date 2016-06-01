import {Component} from "angular2/core";
import {ProjectPanel} from "./ProjectPanel";

@Component({
    selector: 'right',
    template: `
        <ng-content></ng-content>
        <lea-resize-panel>
			<button (click)="projectPanel.growRightPanel()"><i class="fa fa-long-arrow-left"></i></button>
			<button (click)="projectPanel.shrinkRightPanel()"><i class="fa fa-long-arrow-right"></i></button>
		</lea-resize-panel>   
  `
})
export class RightPanel {
    constructor(private projectPanel: ProjectPanel) {

    }

}