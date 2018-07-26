import { Arrow, NoteDataArrows, StepChart, NotesSegment, LINES_PER_MEASURE, makeEmptyNote, ArrowType, Note, NoteMeasureData, NoteType, BEATS_PER_MEASURE } from "../../../models";
import { StepChartParser } from "..";
import * as _ from "lodash";
import { clampPrecision } from "../../../helpers";

export type NoteArrowAccessor = (arrows: NoteDataArrows) => Arrow;

export abstract class AbstractStepChartParser implements StepChartParser {
    constructor(private args: { normalizeChart: boolean }) { }

    protected abstract doParse(file: string): StepChart;

    parse(file: string): StepChart {
        const parsedChart = this.doParse(file);

        // If we're not supposed to normalize, bail
        if (!this.args.normalizeChart) {
            return parsedChart;
        }

        // Otherwise: normalize
        for (let noteSegment of parsedChart.noteSegments) {
            const noteArrowAccessors: NoteArrowAccessor[] = [
                arrows => arrows.left,
                arrows => arrows.down,
                arrows => arrows.up,
                arrows => arrows.right,
            ];

            const normalizedMeasures = this.normalizeMeasuresInNoteSegment(noteSegment, noteArrowAccessors);
            noteSegment.measures = normalizedMeasures;
        }

        return parsedChart;
    }

    protected normalizeMeasuresInNoteSegment(noteSegment: NotesSegment, noteArrowAccessors: NoteArrowAccessor[]) {
        let noteNum = 0;
        return noteSegment.measures
            .reduce((measures, measure) => {
                const numNotes = measure.notes.length;
                const linesToSkipPerNote = LINES_PER_MEASURE / numNotes - 1;

                const notes = measure.notes.reduce((acc, note) => {
                    const noteArrows = note.data.arrows;

                    acc.push(note);
                    noteNum++

                    // We need to map our "explicitly defined lines" space to the "total lines per beat" space
                    // e.g. map 4 lines -> 48 notes
                    for (let skippedLine = 0; skippedLine < linesToSkipPerNote; skippedLine++) {
                        if (acc.length >= LINES_PER_MEASURE) {
                            break;
                        }

                        const fillerNote: Note = {
                            ...makeEmptyNote(),
                            beat: clampPrecision(noteNum * 4 * NoteType.FORTY_EIGHTH)
                        };

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
                        noteNum++;
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