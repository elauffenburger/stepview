import { StepChart, Arrow, Note, NoteDataArrows } from "../../models";

export interface StepChartRenderer {
    render(chart: StepChart): Promise<void>;
}