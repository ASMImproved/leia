import {Component} from "@angular/core";

@Component({
    selector: 'leia-project-panel',
    template: `
        <ng-content select="leia-header"></ng-content>
        <leia-project-view [ngStyle]="{'flex-basis': horizontalMainPanel + '%'}">
            <leia-left-panel [ngStyle]="{'flex-basis': leftPanelSize + '%'}">
                <ng-content select="left"></ng-content>
            </leia-left-panel>
            <leia-middle-panel [ngStyle]="{'flex-basis': centralPanelSize + '%'}">
                <ng-content select="central" id="lee-central-panel"></ng-content>
            </leia-middle-panel>
            <leia-right-panel [ngStyle]="{'flex-basis': rightPanelSize + '%'}">
                <ng-content select="right" id="lee-right-panel"></ng-content>
            </leia-right-panel>
        </leia-project-view>
        <leia-bottom-panel [ngStyle]="{'flex-basis': bottomPanelSize + '%'}">
            <ng-content select="bottom" id="lee-bottom-panel"></ng-content>
        </leia-bottom-panel>
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