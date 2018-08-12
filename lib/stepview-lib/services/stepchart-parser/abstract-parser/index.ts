import { Arrow, NoteDataArrows, StepChart, NotesSegment, LINES_PER_MEASURE, makeEmptyNote, ArrowType, Note, NoteMeasureData, NoteType, BEATS_PER_MEASURE } from "../../../models";
import { StepChartParser, ParseOptions } from "..";
import { clampPrecision, distributeInto } from "../../../helpers";

export type NoteArrowAccessor = (arrows: NoteDataArrows) => Arrow;

export abstract class AbstractStepChartParser implements StepChartParser {
    protected abstract doParse(rawChart: string, options: ParseOptions): StepChart;

    parse(rawChart: string, options: ParseOptions = {}): StepChart {
        options.normalizeChart = options.normalizeChart === undefined ? true : options.normalizeChart;
        options.includeNotesSegments = options.includeNotesSegments === undefined ? true : options.includeNotesSegments;

        const parsedChart = this.doParse(rawChart, options);

        // If we're not supposed to normalize, bail
        if (!options.normalizeChart) {
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

            this.normalizeMeasuresInNoteSegment(noteSegment, noteArrowAccessors);
        }

        return parsedChart;
    }

    protected normalizeMeasuresInNoteSegment(noteSegment: NotesSegment, noteArrowAccessors: NoteArrowAccessor[]) {
        for (let measureNum = 0; measureNum < noteSegment.measures.length; measureNum++) {
            const measure = noteSegment.measures[measureNum];

            distributeInto(measure.notes, LINES_PER_MEASURE, (note, measureNoteNum) => {
                const totalNoteNum = (measureNum * LINES_PER_MEASURE) + measureNoteNum;
                const fillerNote: Note = {
                    ...makeEmptyNote(),
                    beat: clampPrecision(totalNoteNum * 4 * (1.0 / LINES_PER_MEASURE))
                };

                let fillerNoteArrows = fillerNote.data.arrows;

                // Use our note accessors to perform transforms on our filler notes
                for (let noteArrowAccessor of noteArrowAccessors) {
                    try {
                        // Use the accessor to get the explicitly defined note arrows
                        const noteArrow = noteArrowAccessor(note.data.arrows);

                        // Use the accessor to get the filler note arrows
                        const fillerNoteArrow = noteArrowAccessor(fillerNoteArrows);

                        // Mark notes between HoldHead and HoldRollTail as Hold
                        if (this.isHold(noteArrow)) {
                            fillerNoteArrow.direction = noteArrow.direction;
                            fillerNoteArrow.type = ArrowType.Hold;
                        }
                    } catch (e) {
                        let s = '';
                        throw e;
                    }
                }

                return fillerNote;
            });

        }
    }

    protected isHold(arrow: Arrow): boolean {
        return arrow.type == ArrowType.HoldHead;
    }
}