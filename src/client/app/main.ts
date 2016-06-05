/// <reference path="../../../typings/index.d.ts" />

import 'core-js/es6';
import 'reflect-metadata';
require('zone.js/dist/zone');

import '../sass/main.scss';

import {bootstrap}    from '@angular/platform-browser-dynamic'
import {LeiaComponent} from './leia/LeiaComponent'
import { enableProdMode } from '@angular/core';

if (process.env.ENV === 'production') {
    enableProdMode();
} else {
    // Development
    Error['stackTraceLimit'] = Infinity;
    require('zone.js/dist/long-stack-trace-zone');
}

bootstrap(LeiaComponent);
