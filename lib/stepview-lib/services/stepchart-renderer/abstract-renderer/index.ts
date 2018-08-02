import { StepChart, Arrow, Note, NoteType } from "../../../models";
import { StepChartRenderer, StepChartRenderArgs } from "..";

export abstract class AbstractStepChartRenderer implements StepChartRenderer {
    abstract render(chart: StepChart, renderArgs: StepChartRenderArgs): Promise<void>;

    protected abstract printNote(note: Note): string;
    protected abstract printArrow(arrow: Arrow, noteType: NoteType): string;

    protected calculateNoteRenderDelayInMs(lastBeatDelta: number, bpm: number): number {
        if (lastBeatDelta == 0) {
            return 0;
        }

        const beatsPerMs = bpm / 60000;
        return lastBeatDelta / beatsPerMs;
    }
}