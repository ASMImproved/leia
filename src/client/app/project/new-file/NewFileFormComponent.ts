import {Component, Output, EventEmitter} from '@angular/core';
import {NgForm}    from '@angular/common';
import { File }    from '../../../../common/File';
import {ProjectService} from "../ProjectService";
import {FormBuilder} from "@angular/common";
import {ControlGroup} from "@angular/common";
import {Validators} from "@angular/common";
import {Control} from "@angular/common";
import {OnInit} from "@angular/core";

@Component({
  selector: 'new-file-form',
  template: require('./new-file-form.html')
})
export class NewFileFormComponent implements OnInit{
    private model: File = new File("");
    private form: ControlGroup;

    constructor(private projectService: ProjectService, private fb: FormBuilder) {

    }

    ngOnInit():any {
        this.form = this.fb.group({
            'name': ['', Validators.compose([Validators.required,
                (control: Control): {[s: string]: boolean} => {
                    if(this.projectService.fileExists(control.value)) {
                        return {fileExists: true}
                    }
                }
            ])
            ]
        });
    }


    onSubmit() {
        if(!this.form.valid) {
            console.log('new file form not valid');
            return;
        }
        try {
            this.projectService.addFile(this.model);
            this.model = new File("");
        } catch(e) {
            console.log('Failed to create file');
        }
    }
}
