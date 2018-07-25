import { ConsoleStepChartRenderer } from "../../lib/stepview-lib/services/stepchart-renderer/console-renderer";
import { SmFileStepChartParser } from "../../lib/stepview-lib/services/stepchart-parser";

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

const fileName = args.f || args.file;
const normalize = (args.n || args.normalize || '').trim() != 'false';
const bpmMultiplier = parseFloat(args.m || args.bpmMultiplier || '1');
const realtime = (args.r || args.realtime || '').trim() != 'false';

console.log('fileName: ', fileName);
console.log('normalize: ', normalize);
console.log('multiplier: ', bpmMultiplier);
console.log('realtime: ', realtime);

const parser = new SmFileStepChartParser({ normalizeChart: normalize });
const renderer = new ConsoleStepChartRenderer({
    realtime: realtime,
    printFn: msg => console.log(msg),
    waitThenFn: (waitTime, then) => setTimeout(() => then(), waitTime)
});

const file = fs.readFileSync(path.resolve(__dirname, fileName), 'utf8');
const chart = parser.parse(file);

renderer.render(chart, { bpmMultiplier: bpmMultiplier });