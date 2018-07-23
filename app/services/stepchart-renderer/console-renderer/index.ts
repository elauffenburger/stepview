import { StepChartRenderer, AbstractStepChartRenderer } from "..";
import { StepChart, LINES_PER_MEASURE, Note, ArrowType, NoteMeasureData, Arrow, ArrowDirection, NoteDataArrows, makeEmptyNote, NotesSegment } from "../../../models";

import * as _ from 'lodash';

export class ConsoleStepChartRenderer extends AbstractStepChartRenderer {
    constructor(private printFn: (msg: string) => void) { super(); }

    render(chart: StepChart): void {
        // We're just getting the first dance-single segment
        const noteSegment = _.find(chart.noteSegments, s => s.type == 'dance-single');
        if (!noteSegment) {
            // TODO: handle failure
            return;
        }

        const noteArrowAccessors: ((arrows: NoteDataArrows) => Arrow)[] = [
            arrows => arrows.left,
            arrows => arrows.down,
            arrows => arrows.up,
            arrows => arrows.right,
        ];

        const normalizedMeasures = this.normalizeMeasuresInNoteSegment(noteSegment, noteArrowAccessors);

        normalizedMeasures.forEach((measure, measureNum) => {
            measure.notes.forEach((note, noteNum) => {
                const noteString = this.printNote(note);
                const noteInfo = _.padEnd(`(${measureNum}, ${noteNum}):`, 10);

                this.printFn(`${noteInfo} ${noteString}`);
            });
        });
    }

    protected printNote(note: Note): string {
        const arrows = note.data.arrows;
        return `${this.printArrow(arrows.left)}  ${this.printArrow(arrows.up)}  ${this.printArrow(arrows.down)}  ${this.printArrow(arrows.right)}`;
    }

    protected printArrow(arrow: Arrow): string {
        // print arrow types that look the same no matter the direction
        switch (arrow.type) {
            case ArrowType.HoldRollTail:
            case ArrowType.Hold:
                return '|'
        }

        switch (arrow.direction) {
            case ArrowDirection.Left:
                switch (arrow.type) {
                    case ArrowType.Normal:
                        return '<';
                    case ArrowType.HoldHead:
                        return '<'
                }
            case ArrowDirection.Down:
                switch (arrow.type) {
                    case ArrowType.Normal:
                        return 'v';
                    case ArrowType.HoldHead:
                        return 'V'
                }
            case ArrowDirection.Up:
                switch (arrow.type) {
                    case ArrowType.Normal:
                        return '^';
                    case ArrowType.HoldHead:
                        return 'A'
                }
            case ArrowDirection.Right:
                switch (arrow.type) {
                    case ArrowType.Normal:
                        return '>';
                    case ArrowType.HoldHead:
                        return '>'
                }
        }

        return '.';
    }

    protected isHold(arrow: Arrow): boolean {
        return arrow.type == ArrowType.HoldHead;
    }
}