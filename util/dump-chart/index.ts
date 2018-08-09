import { SmFileStepChartParser } from "../../lib/stepview-lib/services/stepchart-parser";

import chalk from "chalk";
import * as minimist from 'minimist';

const fs = require('fs');
const path = require('path');
const BSON = require('bson');

const args = minimist(process.argv.slice(2));

const debug = args.d || (args.debug || '').trim() == 'true';
const fileName = args.f || args.file;
const normalize = args.n || (args.normalize || '').trim() == 'true';
const useBson = args.b || (args.bson || '').trim() == 'true'

const bson = new BSON();

console.debug = function () {
    if (debug) {
        console.log.apply(null, [chalk.green('[debug]: '), ...Array.apply(null, arguments)]);
    }
};

console.debug('fileName: ', fileName);
console.debug('normalize: ', normalize);

const parser = new SmFileStepChartParser();

const file = fs.readFileSync(path.resolve(__dirname, fileName), 'utf8');
const chart = parser.parse(file);

const result = useBson
    ? bson.serialize(chart).toString('base64')
    : JSON.stringify(chart);

process.stdout.write(result);