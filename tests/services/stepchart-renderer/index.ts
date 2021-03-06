import { ConsoleStepChartRenderer } from "../../../lib/stepview-lib/services/stepchart-renderer/console-renderer";
import { SmFileStepChartParser } from "../../../lib/stepview-lib/services/stepchart-parser";

const fs = require('fs');
const path = require('path');

const parser = new SmFileStepChartParser();
const renderer = new ConsoleStepChartRenderer({
    realtime: false,
    showMeasureNumbers: true,
    printFn: msg => { },
    waitThenFn: (waitTime, then) => setTimeout(() => then(), waitTime)
});

const file = fs.readFileSync(path.resolve(__dirname, './files/Boogie Down.sm'), 'utf8');
const chart = parser.parse(file);

it('can print a stepchart', () => {
    renderer.render(chart, chart.noteSegments[0], {});
});

function printToConsole(msg: string): void {
    process.stdout.write(msg + '\n');
}
