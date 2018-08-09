import { StepChart, Note, ArrowType, Arrow, ArrowDirection, NoteType, NotesSegment } from '../../../models';
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

    protected async renderNoteToBeat(noteInfo: { note: Note, measureNum: string, noteNum: string, totalNoteNum: number }, beatInfo: { lastBeatDelta: number; bpm: number }): Promise<void> {
        const noteStr = this.printNote(noteInfo.note);
        const noteInfoStr = this.args.showMeasureNumbers
            ? _.padEnd(`(${noteInfo.measureNum}, ${noteInfo.noteNum}): `, 10)
            : '';

        const msg = `${noteInfoStr}${noteStr}`;

        if (!this.args.realtime) {
            this.args.printFn(msg);
            return Promise.resolve();
        }

        const waitTime = this.calculateNoteRenderDelayInMs(beatInfo.lastBeatDelta, beatInfo.bpm);

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