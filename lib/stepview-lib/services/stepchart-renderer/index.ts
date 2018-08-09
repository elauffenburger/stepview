import { StepChart, Arrow, Note, NoteDataArrows, NotesSegment } from "../../models";

export interface StepChartRenderer {
    render(chart: StepChart, notes: NotesSegment, renderArgs: StepChartRenderArgs): Promise<void>;
    requestStop(): void;
}

export interface StepChartRenderArgs {
    speedMultiplier?: number;
}