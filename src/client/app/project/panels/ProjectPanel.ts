import {Component} from "angular2/core";

@Component({
    selector: 'lea-project-panel',
    template: `
        <ng-content select="lea-header"></ng-content>
        <lea-project-view [ngStyle]="{'flex-basis': horizontalMainPanel + '%'}">
            <lea-left-panel [ngStyle]="{'flex-basis': leftPanelSize + '%'}">
                <ng-content select="left"></ng-content>
            </lea-left-panel>
            <lea-middle-panel [ngStyle]="{'flex-basis': centralPanelSize + '%'}">
                <ng-content select="central" id="lee-central-panel"></ng-content>
            </lea-middle-panel>
            <lea-right-panel [ngStyle]="{'flex-basis': rightPanelSize + '%'}">
                <ng-content select="right" id="lee-right-panel"></ng-content>
            </lea-right-panel>
        </lea-project-view>
        <lea-bottom-panel [ngStyle]="{'flex-basis': bottomPanelSize + '%'}">
            <ng-content select="bottom" id="lee-bottom-panel"></ng-content>
        </lea-bottom-panel>
  `
})
export class ProjectPanel {
    private rightPanelSize: number = 20;
    private centralPanelSize: number = 60;
    private leftPanelSize: number = 20;
    private horizontalMainPanel: number = 70;
    private bottomPanelSize: number = 30;

    growLeftPanel() {
        if(this.centralPanelSize > 10) {
            this.leftPanelSize+= 10;
            this.centralPanelSize-= 10;
        }
    }

    shrinkLeftPanel() {
        if(this.leftPanelSize > 10) {
            this.leftPanelSize-= 10;
            this.centralPanelSize+= 10;
        }
    }

    growRightPanel() {
        if(this.centralPanelSize > 10) {
            this.rightPanelSize+= 10;
            this.centralPanelSize-= 10;
        }
    }

    shrinkRightPanel() {
        if(this.rightPanelSize > 10) {
            this.rightPanelSize -= 10;
            this.centralPanelSize += 10;
        }
    }

    growBottomPanel() {
        if(this.horizontalMainPanel > 10) {
            this.bottomPanelSize+= 10;
            this.horizontalMainPanel-= 10;
        }
    }

    shrinkBottomPanel() {
        if(this.bottomPanelSize > 10) {
            this.bottomPanelSize-= 10;
            this.horizontalMainPanel+= 10;
        }
    }
}