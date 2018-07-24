import { ConsoleStepChartRenderer } from "../../../app/services/stepchart-renderer/console-renderer";
import { SmFileStepChartParser } from "../../../app/services/stepchart-parser";

const fs = require('fs');
const path = require('path');

const parser = new SmFileStepChartParser({ normalizeChart: true });
const renderer = new ConsoleStepChartRenderer(printToConsole);

const file = fs.readFileSync(path.resolve(__dirname, './files/Break Free.sm'), 'utf8');
const chart = parser.parse(file);

it('can print a stepchart', () => {
    renderer.render(chart)
});

function printToConsole(msg: string): void {
    process.stdout.write(msg + '\n');
}
