import { ConsoleStepChartRenderer } from "../../../app/services/stepchart-renderer/console-renderer";
import { CHART_FIXTURE } from "../stepchart-parser/sm-file-parser";

const renderer = new ConsoleStepChartRenderer(printToConsole);
const chart = CHART_FIXTURE;

it('can print a stepchart', () => {
    renderer.render(chart)
});

function printToConsole(msg:string): void {
    process.stdout.write(msg + '\n');
}
