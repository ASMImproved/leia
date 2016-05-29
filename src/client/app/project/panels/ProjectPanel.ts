import {Component} from "angular2/core";

@Component({
    selector: 'lea-project-panel',
    template: `
        <ng-content select="lea-header"></ng-content>
        <lea-project-view>
            <lea-left-panel [ngStyle]="{'flex-grow': leftPanelSize}">
                <ng-content select="left"></ng-content>
            </lea-left-panel>
            <lea-middle-panel>
                <ng-content select="central" id="lee-middle-panel"></ng-content>
            </lea-middle-panel>
            <lea-right-panel [ngStyle]="{'flex-grow': rightPanelSize}">
                <ng-content select="right" id="lee-right-panel"></ng-content>
            </lea-right-panel>
        </lea-project-view>
        <lea-bottom-panel [ngStyle]="{'flex-grow': bottomPanelSize}">
            <ng-content select="bottom" id="lee-bottom-panel"></ng-content>
        </lea-bottom-panel>
  `
})
export class ProjectPanel {
    private rightPanelSize: number = 1;
    private leftPanelSize: number = 1;
    private bottomPanelSize: number = 3;

    growLeftPanel() {
        this.leftPanelSize++;
    }

    shrinkLeftPanel() {
        if(this.leftPanelSize > 1)
            this.leftPanelSize--;
    }

    growRightPanel() {
        this.rightPanelSize++;
    }

    shrinkRightPanel() {
        if(this.rightPanelSize > 1)
            this.rightPanelSize--;
    }

    growBottomPanel() {
        this.bottomPanelSize++;
    }

    shrinkBottomPanel() {
        if(this.bottomPanelSize > 1) {
            this.bottomPanelSize--;
        }
    }
}