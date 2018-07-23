import { StepChart, Arrow, ArrowType, Note, NoteMeasureData, NotesSegment, LINES_PER_MEASURE, makeEmptyNote, NoteDataArrows } from "../../models";

import _ from "lodash";

export interface StepChartRenderer {
    render(chart: StepChart): void;
}

export type NoteArrowAccessor = (arrows: NoteDataArrows) => Arrow;

export abstract class AbstractStepChartRenderer implements StepChartRenderer {
    abstract render(chart: StepChart): void;

    protected abstract printNote(note: Note): string;
    protected abstract printArrow(arrow: Arrow): string;

    protected normalizeMeasuresInNoteSegment(noteSegment: NotesSegment, noteArrowAccessors: NoteArrowAccessor[]) {
        return noteSegment.measures
            .reduce((measures, measure) => {
                const numNotes = measure.notes.length;
                const linesToSkipPerNote = LINES_PER_MEASURE / numNotes;

                const notes = measure.notes.reduce((acc, note) => {
                    const noteArrows = note.data.arrows;

                    acc.push(note);

                    // We need to map our "explicitly defined lines" space to the "total lines per beat" space
                    // e.g. map 4 lines -> 48 notes
                    for (let skippedLine = 0; skippedLine < linesToSkipPerNote; skippedLine++) {
                        if (acc.length >= LINES_PER_MEASURE) {
                            break;
                        }

                        const fillerNote = makeEmptyNote();
                        let fillerNoteArrows = fillerNote.data.arrows;

                        // Use our note accessors to perform transforms on our filler notes
                        for (let noteArrowAccessor of noteArrowAccessors) {

                            // Use the accessor to get the explicitly defined note
                            const noteArrow = noteArrowAccessor(noteArrows);

                            // Use the accessor to get the filler note
                            const fillerNoteArrow = noteArrowAccessor(fillerNoteArrows);

                            // Mark notes between HoldHead and HoldRollTail as Hold
                            if (this.isHold(noteArrow)) {
                                fillerNoteArrow.direction = noteArrow.direction;
                                fillerNoteArrow.type = ArrowType.Hold;
                            }
                        }

                        acc.push(fillerNote);
                    }

                    return acc;
                }, <Note[]>[]);

                return _.concat(measures, {
                    ...measure,
                    notes: notes
                });
            }, <NoteMeasureData[]>[]);
    }

    protected isHold(arrow: Arrow): boolean {
        return arrow.type == ArrowType.HoldHead;
    }
}