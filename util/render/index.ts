import { ConsoleStepChartRenderer } from "../../lib/stepview-lib/services/stepchart-renderer/console-renderer";
import { SmFileStepChartParser } from "../../lib/stepview-lib/services/stepchart-parser";

import chalk from "chalk";
import minimist from 'minimist';

const fs = require('fs');
const path = require('path');

const args = minimist(process.argv.slice(2));

const debug = (args.d || args.file || '').trim() == 'true';
const fileName = args.f || args.file;
const normalize = (args.n || args.normalize || '').trim() != 'false';
const bpmMultiplier = parseFloat(args.m || args.bpmMultiplier || '1');
const realtime = (args.r || args.realtime || '').trim() != 'false';
const showMeasureNumbers = (args.s || args.showMeasureNumbers || '') != 'false';

console.debug = function () {
    if (debug) {
        console.log.apply(null, [chalk.green('[debug]: '), ...Array.apply(null, arguments)]);
    }
};

console.debug('fileName: ', fileName);
console.debug('normalize: ', normalize);
console.debug('multiplier: ', bpmMultiplier);
console.debug('realtime: ', realtime);

const parser = new SmFileStepChartParser({ normalizeChart: normalize });
const renderer = new ConsoleStepChartRenderer({
    realtime: realtime,
    showMeasureNumbers: showMeasureNumbers,
    printFn: msg => console.log(msg),
    debugPrintFn: msg => console.debug(msg),
    waitThenFn: (waitTime, then) => setTimeout(() => then(), waitTime)
});

const file = fs.readFileSync(path.resolve(__dirname, fileName), 'utf8');
const chart = parser.parse(file);

renderer.render(chart, { bpmMultiplier: bpmMultiplier });