import {Component} from "angular2/core";
import {LabelService, Label} from "../LabelService";

@Component({
    selector: 'lea-symboltable',
    templateUrl: 'client/app/project/symbols/symboltable.html'
})
export class SymboleTableComponent {
    private globalSymbols: Label[] = [];
    private localSymbols: Label[] = [];

    constructor(private labelService: LabelService) {
        labelService.labelsChanged.subscribe((labels: Label[]) => {
            console.log("labels changed");
            console.log(labels);
            this.globalSymbols = [];
            this.localSymbols = [];
            labels.forEach((label: Label) => {
                if (label.global) {
                    console.log("global symbol");
                    console.log(label);
                    this.globalSymbols.push(label);
                } else {
                    console.log("local symbol");
                    console.log(label);
                    this.localSymbols.push(label);
                }
            })
        });
    }
}
