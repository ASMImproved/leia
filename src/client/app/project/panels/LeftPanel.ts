import {Component} from "@angular/core";
import {ProjectPanel} from "./ProjectPanel";

@Component({
    selector: 'left',
    template: `
        <ng-content></ng-content>
        <leia-resize-panel>
			<button (click)="projectPanel.shrinkLeftPanel()"><i class="fa fa-long-arrow-left"></i></button>
			<button (click)="projectPanel.growLeftPanel()"><i class="fa fa-long-arrow-right"></i></button>
		</leia-resize-panel>        
  `
})
export class LeftPanel {
    constructor(private projectPanel: ProjectPanel) {

    }

}