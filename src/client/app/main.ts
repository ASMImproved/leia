/// <reference path="../../../typings/index.d.ts" />

import 'core-js/es6';
import 'reflect-metadata';
require('zone.js/dist/zone');

import '../sass/main.scss';

import {bootstrap}    from '@angular/platform-browser-dynamic'
import {LeaComponent} from './lea/LeaComponent'

bootstrap(LeaComponent);
