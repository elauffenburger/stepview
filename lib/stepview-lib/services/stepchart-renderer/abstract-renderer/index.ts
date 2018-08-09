import { StepChart, Arrow, Note, NoteType, NotesSegment } from "../../../models";
import { StepChartRenderer, StepChartRenderArgs } from "..";
import { toBpmChangesLookup } from "../../../helpers";

export abstract class AbstractStepChartRenderer implements StepChartRenderer {
    private isStopRequested: boolean;

    async render(chart: StepChart, notes: NotesSegment, renderArgs: StepChartRenderArgs): Promise<void> {
        this.reset();

        renderArgs.speedMultiplier = renderArgs.speedMultiplier || 1;

        const bpmSegments = chart.headerSegment.bpmSegments;
        if (!bpmSegments || !bpmSegments.length) {
            // TODO: handle failure
            return;
        }

        // A lookup we can use to see when bpm changes should occur
        const bpmChangesLookup = toBpmChangesLookup(bpmSegments);

        let lastNote: Note | undefined;
        let bpm = 0;
        let totalNoteNum = 0;

        const measures = notes.measures;
        for (let measureNum in measures) {
            const measure = measures[measureNum];

            for (let noteNum in measure.notes) {
                const note = measure.notes[noteNum];

                // Calculate beat delta from last note
                const beatDelta = lastNote ? note.beat - lastNote.beat : note.beat;

                // See if we're changing bpm
                const maybeBpmChange = bpmChangesLookup[note.beat];
                if (maybeBpmChange) {
                    bpm = maybeBpmChange * renderArgs.speedMultiplier;
                }

                if (this.isStopRequested) {
                    await this.beforeStopDueToStopRequest();
                    return;
                }

                await this.renderNoteToBeat({ note: note, measureNum: measureNum, noteNum: noteNum, totalNoteNum: totalNoteNum }, { lastBeatDelta: beatDelta, bpm: bpm });

                lastNote = note;
                totalNoteNum++;
            }
        }
    }

    requestStop() {
        this.isStopRequested = true;
    }

    beforeStopDueToStopRequest(): Promise<any> {
        return Promise.resolve();
    }

    protected abstract renderNoteToBeat(noteInfo: { note: Note, measureNum: string, noteNum: string, totalNoteNum: number }, beatInfo: { lastBeatDelta: number; bpm: number }): Promise<void>;

    protected calculateNoteRenderDelayInMs(lastBeatDelta: number, bpm: number): number {
        if (lastBeatDelta == 0) {
            return 0;
        }

        const beatsPerMs = bpm / 60000;
        return lastBeatDelta / beatsPerMs;
    }

    private reset() {
        this.isStopRequested = false;
    }
}