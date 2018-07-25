import { StepChart, Arrow, Note } from "../../../models";
import { StepChartRenderer } from "..";

export abstract class AbstractStepChartRenderer implements StepChartRenderer {
    abstract render(chart: StepChart): Promise<void>;

    protected abstract printNote(note: Note): string;
    protected abstract printArrow(arrow: Arrow): string;

    protected calculateNoteRenderDelay(lastBeatDelta: number, bpm: number): number {
        if (lastBeatDelta == 0) {
            return 0;
        }

        const beatsPerMs = bpm / 60000;
        return lastBeatDelta / beatsPerMs;
    }
}