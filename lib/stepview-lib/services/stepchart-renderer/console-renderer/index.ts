import { StepChart, Note, ArrowType, Arrow, ArrowDirection, NoteType } from '../../../models';
import { AbstractStepChartRenderer } from '../abstract-renderer';

import _ from 'lodash';
import { toBpmChangesLookup } from '../../../helpers';

import 'chalk';
import chalk from 'chalk';
import { StepChartRenderArgs } from '..';

interface Args {
    printFn: (msg: string) => void;
    debugPrintFn?: (msg: string) => void;
    waitThenFn: (waitTime: number, then: () => void) => void;

    realtime: boolean;
    showMeasureNumbers: boolean;
}

export class ConsoleStepChartRenderer extends AbstractStepChartRenderer {
    constructor(private args: Args) {
        super();
    }

    async render(chart: StepChart, renderArgs: StepChartRenderArgs): Promise<void> {
        renderArgs.bpmMultiplier = renderArgs.bpmMultiplier || 1;

        // We're just getting the first dance-single segment
        const noteSegment = _.find(chart.noteSegments, s => s.type == 'dance-single');
        if (!noteSegment) {
            // TODO: handle failure
            return;
        }

        const bpmSegments = chart.headerSegment.bpmSegments;
        if (!bpmSegments || !bpmSegments.length) {
            // TODO: handle failure
            return;
        }

        // A lookup we can use to see when bpm changes should occur
        const bpmChangesLookup = toBpmChangesLookup(bpmSegments);

        let lastNote: Note | undefined;
        let bpm = 0;

        const measures = noteSegment.measures;
        for (let measureNum in measures) {
            const measure = measures[measureNum];

            for (let noteNum in measure.notes) {
                const note = measure.notes[noteNum];

                const noteString = this.printNote(note);
                const noteInfo = this.args.showMeasureNumbers 
                    ? _.padEnd(`(${measureNum}, ${noteNum}): `, 10) 
                    : '';

                // Calculate beat delta from last note
                const beatDelta = lastNote ? note.beat - lastNote.beat : note.beat;

                // See if we're changing bpm
                const maybeBpmChange = bpmChangesLookup[note.beat];
                if (maybeBpmChange) {
                    bpm = maybeBpmChange * renderArgs.bpmMultiplier;

                    this.debug(`---Changing BPM: ${bpm}---`);
                }

                await this.printNoteToBeat(`${noteInfo}${noteString}`, { bpm: bpm, lastBeatDelta: beatDelta })

                lastNote = note;
            }
        }
    }

    private async printNoteToBeat(msg: string, beatInfo: { lastBeatDelta: number; bpm: number }): Promise<void> {
        if (!this.args.realtime) {
            this.args.printFn(msg);
            return Promise.resolve();
        }

        const waitTime = this.calculateNoteRenderDelay(beatInfo.lastBeatDelta, beatInfo.bpm);

        return new Promise<void>((res, rej) => {
            this.args.waitThenFn(waitTime, () => {
                this.args.printFn(msg);
                res();
            });
        });
    }

    protected printNote(note: Note): string {
        const arrows = note.data.arrows;
        return `${this.printArrow(arrows.left, note.type)}  ${this.printArrow(arrows.up, note.type)}  ${this.printArrow(arrows.down, note.type)}  ${this.printArrow(arrows.right, note.type)}`;
    }

    protected printArrow(arrow: Arrow, noteType: NoteType): string {
        const arrowCharacter = (() => {
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
        })();

        if (!arrowCharacter) {
            return '.';
        }

        const renderFunction = (() => {
            switch (arrow.type) {
                case ArrowType.HoldHead:
                case ArrowType.Hold:
                case ArrowType.HoldRollTail:
                    return chalk.green;
                default:
                    break;
            }

            switch (noteType) {
                case NoteType.QUARTER:
                    return chalk.red;
                case NoteType.EIGHTH:
                    return chalk.blue;
                case NoteType.TWELFTH:
                    return chalk.hex('#8a2be2');
                case NoteType.SIXTEENTH:
                    return chalk.yellow;
                case NoteType.TWENTY_FOURTH:
                    return chalk.hex('#ff69b4');
                case NoteType.THIRTY_SECOND:
                    return chalk.hex('#ffa500');
                case NoteType.FORTY_EIGHTH:
                    return chalk.blueBright;
                case NoteType.SIXTY_FOURTH:
                    return chalk.green;
                default:
                    return chalk.gray;
            }
        })();

        return renderFunction(arrowCharacter);
    }

    protected isHold(arrow: Arrow): boolean {
        return arrow.type == ArrowType.HoldHead;
    }

    protected debug(msg: string) {
        const debugPrintFn = this.args.debugPrintFn;
        if (!debugPrintFn) {
            return;
        }

        debugPrintFn(msg);
    }
}