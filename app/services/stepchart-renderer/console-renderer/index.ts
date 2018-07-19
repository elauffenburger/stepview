import { StepChartRenderer } from "..";
import { StepChart } from "../../../models";

export class ConsoleStepChartRenderer implements StepChartRenderer {
    render(chart: StepChart): void {
        for (let note of chart.noteSegments) {
            
        }
    }
}