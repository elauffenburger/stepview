import { ConsoleStepChartRenderer } from "../../app/services/stepchart-renderer/console-renderer";
import { SmFileStepChartParser } from "../../app/services/stepchart-parser";

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

const fileName = args.f || args.file;
const normalize = (args.n || args.normalize).trim() != 'false';

console.log('fileName: ', fileName);
console.log('normalize: ', normalize);

const parser = new SmFileStepChartParser({ normalizeChart: normalize });
const renderer = new ConsoleStepChartRenderer({
    realtime: true,
    printFn: msg => process.stdout.write(msg + '\n'),
    waitThenFn: (waitTime, then) => setTimeout(() => then(), waitTime)
});

const file = fs.readFileSync(path.resolve(__dirname, fileName), 'utf8');
const chart = parser.parse(file);

renderer.render(chart);