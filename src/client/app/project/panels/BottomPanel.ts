import {Component} from "@angular/core";
import {ProjectPanel} from "./ProjectPanel";

@Component({
    selector: 'bottom',
    template: `
        <ng-content></ng-content>
        <leia-resize-panel>
			<button (click)="projectPanel.growBottomPanel()"><i class="fa fa-long-arrow-up"></i></button>
			<button (click)="projectPanel.shrinkBottomPanel()"><i class="fa fa-long-arrow-down"></i></button>
		</leia-resize-panel>     
  `
})
export class BottomPanel {
    constructor(private projectPanel: ProjectPanel) {

    }

}