import {Pipe, PipeTransform} from '@angular/core';


@Pipe({name: 'register'})
export class RegisterPipe implements PipeTransform {
    transform(registerContent:number) : any {
        if (registerContent < 0) {
            throw new Error("invalid data in register: " + registerContent);
        }
        let binary:string = registerContent.toString(16);
        for (let i = binary.length; i < 8;++i) {
            binary = '0' + binary;
        }
        return '0x' + binary;
    }
}
