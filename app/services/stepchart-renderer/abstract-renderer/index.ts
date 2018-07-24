import { StepChart, Arrow, Note } from "../../../models";
import { StepChartRenderer } from "..";

export abstract class AbstractStepChartRenderer implements StepChartRenderer {
    abstract render(chart: StepChart): void;

    protected abstract printNote(note: Note): string;
    protected abstract printArrow(arrow: Arrow): string;
}