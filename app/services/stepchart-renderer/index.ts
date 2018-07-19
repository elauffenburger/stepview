import { StepChart } from "../../models";

export interface StepChartRenderer {
    render(chart: StepChart): void;
}