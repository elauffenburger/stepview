import { ConsoleStepChartRenderer } from "lib/stepview-lib/services/stepchart-renderer/console-renderer";
import { SmFileStepChartParser } from "lib/stepview-lib/services/stepchart-parser";

const fs = require('fs');
const path = require('path');

const parser = new SmFileStepChartParser({ normalizeChart: true });
const renderer = new ConsoleStepChartRenderer({
    realtime: false,
    printFn: msg => { },
    waitThenFn: (waitTime, then) => setTimeout(() => then(), waitTime)
});

const file = fs.readFileSync(path.resolve(__dirname, './files/Boogie Down.sm'), 'utf8');
const chart = parser.parse(file);

it('can print a stepchart', () => {
    renderer.render(chart)
});

function printToConsole(msg: string): void {
    process.stdout.write(msg + '\n');
}
