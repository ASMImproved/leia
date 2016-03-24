import {Pipe, PipeTransform} from 'angular2/core';


@Pipe({name: 'register'})
export class RegisterPipe implements PipeTransform {
    transform(registerContent:number, args:any[] = []) : any {
        let binary:string = registerContent.toString(16);
        for (let i = binary.length; i < 8;++i) {
            console.log(binary);
            binary = '0' + binary;
        }
        return '0x' + binary;
    }
}
