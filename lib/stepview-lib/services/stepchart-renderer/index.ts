import { StepChart, Arrow, Note, NoteDataArrows } from "../../models";

export interface StepChartRenderer {
    render(chart: StepChart, renderArgs: StepChartRenderArgs): Promise<void>;
}

export interface StepChartRenderArgs {
    speedMultiplier?: number;
}