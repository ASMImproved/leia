/// <reference path="../../../../../typings/globals/jasmine/index.d.ts" />
import {it, describe, expect, beforeEach} from '@angular/core/testing'
import {RegisterPipe} from "./RegisterPipe";

describe("RegisterPipe", () => {
    var pipe: RegisterPipe;

    beforeEach(() => {
        pipe = new RegisterPipe();
    });

    it("converts numbers to hexadecimal representation with leading zeros", () => {
        const data = new Map<number, string>();
        data.set(0, "0x00000000");
        data.set(16, "0x00000010");
        data.forEach((representation: string, value:number) => {
            expect(pipe.transform(value)).toBe(representation);
        });
    });

    it("does not display negative numbers", () => {
        expect( () => pipe.transform(-1) ).toThrow(new Error("invalid data in register: -1"));
    })

});
